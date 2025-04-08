import express, {Express, NextFunction, Request, Response} from "express";
const router = express.Router();
import { RenderTimeTable, RenderMainPage, renderClassList} from "../controllers/timetableController";


router.get('/timetableeditor', RenderMainPage)
router.get('/timetable', RenderTimeTable)
router.get('/classes', renderClassList)

export default router;