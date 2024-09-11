import express, {Express, NextFunction, Request, Response} from "express";
const router = express.Router();
import { testauth, addWinners, addUser, getRank} from "../controllers/andrebotController";

router.get('/testauth', testauth );
router.post('/addwinners', addWinners);
router.post('/adduser', addUser);
router.get('/getrank', getRank);
export default router;