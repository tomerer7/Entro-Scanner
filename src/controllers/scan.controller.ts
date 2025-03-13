import { Request, Response } from 'express';
import { scanService } from '../services/scan.service';

export const startScan = async (req: Request, res: Response) => {
    const { page = 1, per_page = 2 } = req.query;
    try {
        const scanResults = await scanService.startScan(
            parseInt(page as string),
            parseInt(per_page as string)
        );
        
        res.status(200).json({
            message: "Scan completed",
            results: scanResults
        });
    } catch (error) {
        res.status(500).json({
            message: "Scan failed",
            page
        });
    }
};
