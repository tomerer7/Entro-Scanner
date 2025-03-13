import logger from "../utils/Logger";
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

class ScanService {
    octokit: Octokit;
    owner: string;
    repo: string;

    constructor() {
        this.octokit = new Octokit({
            auth: process.env.GITHUB_PAT,
        });
        
        this.owner = process.env.GITHUB_REPO_OWNER || "";
        this.repo = process.env.GITHUB_REPO_NAME || "";
    }
  
    async startScan(page: number, perPage: number) {
        const results: string[] = [];
        let hasNextPage = true;
        const lastProcessedPage = this.getLastProcessedPage();
        let lastPage = lastProcessedPage ? lastProcessedPage : page;

        try {
            const { data, headers } = await this.octokit.repos.listCommits({
                owner: this.owner,
                repo: this.repo,
                per_page: perPage,
                page: lastPage
            });
    
            for (const commit of data) {
                const commitSHA = commit.sha;
                const commitMessage = commit.commit?.message;
                const commitAuthor = commit.commit.author?.name;
                const commitDate = commit.commit.author?.date;
            
                this.writeReport(`Commit SHA: ${commitSHA}`);
                this.writeReport(`Commit Message: ${commitMessage}`);
                this.writeReport(`Commit Author: ${commitAuthor}`);
                this.writeReport(`Date: ${commitDate}`);
                results.push(`Commit SHA: ${commitSHA}`);
                results.push(`Commit Message: ${commitMessage}`);
                results.push(`Commit Author: ${commitAuthor}`);
                results.push(`Date: ${commitDate}`);
            
                const { data: commitDetails } =
                await this.octokit.repos.getCommit({
                    owner: this.owner,
                    repo: this.repo,
                    ref: commitSHA,
                });
                        
                commitDetails.files?.forEach((file) => {            
                    if (file.patch) {
                        const patchLines = file.patch.split("\n");
                
                        patchLines.forEach((line) => {
                            if (line.startsWith("+")) {
                                const secretsFound = this.findSecretsInText(line);
                                secretsFound.forEach((secret) => {
                                    this.writeReport(secret);
                                    results.push(secret);
                                });
                            }
                        });
                    }
                });
            
                this.writeReport("\n--------------------------------------------------\n");
                results.push("\n--------------------------------------------------\n");
            }
    
            const linkHeader = headers['link'];
            hasNextPage = linkHeader && linkHeader.includes('rel="next"') ? true : false;
      
            lastPage++;
            this.storeLastProcessedPage(lastPage);

            logger.debug(`Scan result ${JSON.stringify({ results, page, hasNextPage })}`)
            return { results, page, hasNextPage };
        } catch (error) {
            logger.error(`Error fetching commits: ${error instanceof Error ? error.message : error}`);
            throw new Error("Scan Failed!")
        }
    }
    
    private findSecretsInText(text: string): string[] {
        const secretPatterns = [
            /ASIA[0-9A-Z]{16}/,
            /[A-Za-z0-9/+=]{40}/,
        ];

        const foundSecrets: string[] = [];
        
        const normalizedText = text.replace(/\n/g, '').trim();
        
        secretPatterns.forEach((pattern) => {
            const matches = normalizedText.match(pattern);
            if (matches) {
                foundSecrets.push(...matches);
            }
        });
        return foundSecrets;
    }
    
    private writeReport(content: string) {
        fs.appendFileSync("report.txt", content + "\n");
    };

    private getLastProcessedPage() {
        try {
            const data = fs.readFileSync("lastProcessedPage.txt", "utf8");
            return parseInt(data.trim());
        } catch (err) {
            return null;
        }
    };
    
    private storeLastProcessedPage(page: number) {
        fs.writeFileSync("lastProcessedPage.txt", page.toString());
    };
    
}

export const scanService = new ScanService();