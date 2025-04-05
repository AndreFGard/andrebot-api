import express, {Express, NextFunction, Request, Response} from "express";
const router = express.Router();
import { testauth, addWinners, addUser, getRank, auth} from "../controllers/andrebotController";

router.get('/testauth', testauth );
router.get('/getrank', getRank);



router.use(auth);
router.post('/addwinners', addWinners);
router.post('/adduser', addUser);

export default router;