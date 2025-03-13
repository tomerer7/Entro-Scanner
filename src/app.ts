import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import scanRoutes from './routes/scan.routes';
import config from './config';
import * as fs from "fs";

const app = express();
const port = config.server.port;

app.use(bodyParser.json());
app.use(cors());

app.use('/api/v1/scan', scanRoutes);

app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

fs.writeFileSync("report.txt", "");
fs.writeFileSync("lastProcessedPage.txt", "");

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default server;
