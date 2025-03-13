import express from 'express';
import { startScan } from '../controllers/scan.controller';

const router = express.Router();

router.post('/', startScan);

export default router;
