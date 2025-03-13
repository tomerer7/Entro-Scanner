import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const octokit = new Octokit({
    auth: process.env.GITHUB_PAT,
});

const owner = process.env.GITHUB_REPO_OWNER || "";
const repo = process.env.GITHUB_REPO_NAME || "";

const secretPatterns = [
    /ASIA[0-9A-Z]{16}/,
    /[A-Za-z0-9/+=]{40}/,
];

function findSecretsInText(text: string): string[] {
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

function writeReport(content: string) {
    fs.appendFileSync("report.txt", content + "\n");
};

function getLastProcessedPage() {
    try {
        const data = fs.readFileSync("lastProcessedPage.txt", "utf8");
        return parseInt(data.trim());
    } catch (err) {
        return null;
    }
};

function storeLastProcessedPage(page: number) {
    fs.writeFileSync("lastProcessedPage.txt", page.toString());
};

async function main() {
    
    let page = 1;
    const perPage = 2;
    
    try {
        fs.writeFileSync("report.txt", "");
        fs.writeFileSync("lastProcessedPage.txt", "");
        
        const lastProcessedPage = getLastProcessedPage();
        let hasNextPage = true;

        while (hasNextPage) {
            const { data, headers } = await octokit.repos.listCommits({
                owner,
                repo,
                per_page: perPage,
                page: lastProcessedPage ? lastProcessedPage : page
            });
    
            for (const commit of data) {
                const commitSHA = commit.sha;
                const commitMessage = commit.commit?.message;
                const commitAuthor = commit.commit.author?.name;
                const commitDate = commit.commit.author?.date;
            
                writeReport(`Commit SHA: ${commitSHA}`);
                writeReport(`Commit Message: ${commitMessage}`);
                writeReport(`Commit Author: ${commitAuthor}`);
                writeReport(`Date: ${commitDate}`);
            
                const { data: commitDetails } =
                await octokit.repos.getCommit({
                    owner,
                    repo,
                    ref: commitSHA,
                });
                        
                commitDetails.files?.forEach((file) => {            
                    if (file.patch) {
                        const patchLines = file.patch.split("\n");
                
                        patchLines.forEach((line) => {
                            if (line.startsWith("+")) {
                                const secretsFound = findSecretsInText(line);
                                secretsFound.forEach((secret) => {
                                    writeReport(secret);
                                });
                            }
                        });
                    }
                });
            
                writeReport("\n--------------------------------------------------\n");

            }

            page++;
            storeLastProcessedPage(page);
    
            const linkHeader = headers['link'];
            hasNextPage = linkHeader && linkHeader.includes('rel="next"') ? true : false;
        }
        console.log('Done!');
    } catch (error) {
        console.error("Error fetching commits:", error instanceof Error ? error.message : error);
    }
}

main();
