# Entro

This application scans the commits of a GitHub repository to find secrets

**Getting Started:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```
   GITHUB_PAT=your_github_personal_access_token
   GITHUB_REPO_OWNER=your_repo_owner
   GITHUB_REPO_NAME=your_repo_name
   ```

3. **To run the scanner:**
   ```bash
   npm start
   ```

4. **To run the scanner as a Web Server:**
   ```bash
   npm run start:server
   ```

5. check report.txt

**Example Usage:**

- Start the scanner
    ```
    curl -X POST \
      http://localhost:3000/api/v1/scan?page=1&per_page=2
    ```
