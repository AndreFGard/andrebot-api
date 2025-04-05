import { GraduationServices, TimeTableService, CourseInfo} from "../services/timetableServices";
import express, {Express, NextFunction, Request, Response} from "express";

const timetableService = new TimeTableService();

export const getCoursesbymajor = async (req: Request, res: Response, next: NextFunction)=> {
    const classSchedules = (await timetableService.getCourses(req.body.major || "CC")).slice(0,20);
    //const search_options = result.map((classinfo) => {})
    const classes =  classSchedules.map(i => {return {code: i.code, name: i.name, professor: i.professor}})
  
      const selectedClassCode = req.query.classCode as string; // Get selected class code from the query
  
      const filteredSchedules = selectedClassCode
        ? classSchedules.filter(schedule => schedule.code === selectedClassCode)
        : classSchedules;
  
      res.render('timetable', { classSchedules: filteredSchedules, classes, selectedClassCode });
    
}

export const RenderMainPage = (req: Request, res: Response) => {
    const bsc = req.query.bsc as string || "CC";
    const allClasses = GraduationServices.classListBymajor[bsc] || [];

    const majors = {
        CC: bsc === "CC",
        EC: bsc === "EC",
        SI: bsc === "SI"
    };
    res.render('timetableditor', { allClasses, bsc, majors });
};

export const renderClassList = (req: Request, res: Response) => {
    const program = req.query.program as string;
    const programClasses = GraduationServices.classListBymajor[program] || [];
    res.render('classes', { programClasses });
};

export const RenderTimeTable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bsc = req.query.bsc as string || "CC";

        const IDsStrings = [...new Set(String(req.query.SelectedClassIDs || "").split(","))];
        const SelectedClassIDs: CourseInfo[] = IDsStrings.filter(id => id).map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        });

        const NewIDsStrings = [...new Set(String(req.query.NewSelectedClassIDs || "").split(","))];
        const NewSelectedClassIDs: CourseInfo[] = NewIDsStrings.filter(id => id).map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        });

        let currentlyChosenClasses = [...new Set(SelectedClassIDs.concat(NewSelectedClassIDs))];
        const conflictDays = GraduationServices.getConflictingDays(currentlyChosenClasses).flat();
        let classestorender: CourseInfo[] = GraduationServices.filterConflictless(currentlyChosenClasses);

        [classestorender, currentlyChosenClasses] = [[...new Set(classestorender)], [...new Set(currentlyChosenClasses)]];

        const timetable = GraduationServices.arrangeTimetable(classestorender);
        // Render the partial table and send as HTML
        const conflictsIDs = [...new Set(conflictDays.map(x => x.course_id))];

        const blamedConflicts = GraduationServices.blameConflictingClasses(currentlyChosenClasses);
        res.render('timetable', { classestorender, currentlyChosenClasses, timetable, conflictsIDs, conflictDays, blamedConflicts});
    } catch (error) {
        next(error);
    }
};

