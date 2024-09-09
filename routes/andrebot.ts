import express, {Express, NextFunction, Request, Response} from "express";
const router = express.Router();
import { testauth, addWinners} from "../controllers/andrebotController";

router.get('/testauth', testauth );
router.post('/addWinners', addWinners);
export default router;