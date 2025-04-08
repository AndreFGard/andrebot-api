import { GraduationServices, TimeTableService} from "../services/timetableServices";
import {CourseInfo, TimetableRenderInfo, } from "../models/schemas";
import express, {Express, NextFunction, Request, Response} from "express";

const timetableService = new TimeTableService();

// DEPRECATED
// export const getCoursesbymajor = async (req: Request, res: Response, next: NextFunction)=> {
//     const classSchedules = (await timetableService.getCourses(req.body.major || "CC")).slice(0,20);
//     //const search_options = result.map((classinfo) => {})
  
//       const selectedClassCode = req.query.classCode as string; // Get selected class code from the query
  
//       const filteredSchedules = selectedClassCode
//         ? classSchedules.filter(schedule => schedule.code === selectedClassCode)
//         : classSchedules;
  
//       res.render('timetable', { classSchedules: filteredSchedules, selectedClassCode });
    
// }

export const RenderMainPage = (req: Request, res: Response) => {
    const major = req.query.major as string || "CC";
    const allClasses = GraduationServices.classListBymajor[major] || [];

    const majors = {
        CC: major === "CC",
        EC: major === "EC",
        SI: major === "SI"
    };
    res.send({ allClasses, major, majors });
};

export const renderClassList = (req: Request, res: Response) => {
    const major = req.query.major as string;
    const majorClasses = GraduationServices.classListBymajor[major] || [];
    res.send({majorClasses})
    //res.render('classes', { majorClasses });
};

export async function RenderTimeTable(req: Request, res: Response, next: NextFunction){
    try {
        const major = req.query.major as string || "CC";

        const classIds = [...new Set(String(req.query.SelectedClassIDs || "")
                            .split(","))];
        const newClassIds = [...new Set(String(req.query.NewSelectedClassIDs || "")
                            .split(","))]
        
        const renderInfo: TimetableRenderInfo = await timetableService.renderTimetable(classIds, newClassIds)
        res.send(renderInfo);
        //res.send({ coursestorender, currentlyChosenClasses, timetable, conflictsIDs, conflictDays, blamedConflicts})
    } catch (error) {
        next(error);
    }

};

