import express, {Express, NextFunction, Request, Response} from "express";
const router = express.Router();
import { testauth, addWinners, addUser} from "../controllers/andrebotController";

router.get('/testauth', testauth );
router.post('/addWinners', addWinners);
router.post('/addUser', addUser);
export default router;