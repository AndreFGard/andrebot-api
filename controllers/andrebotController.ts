
import express, {Express, NextFunction, Request, Response} from "express";
import {andrebotServices} from "../services/andrebotServices";
import { GraduationServices, ClassSchedule } from "../services/andrebotServices";
const andrebotService = new andrebotServices();

export const testauth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.headers['platform'] || req.headers['password']) ||
            !await andrebotService.auth(String(req.headers['platform']), String(req.headers['password']))) {
            res.status(403).send("unauthed");
        } else {
            res.status(200).send("ok");
        }
    } catch (err: any) {
        res.status(500).send("Database error");
    }
};


export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.headers['platform'] || req.headers['password']) ||
            !await andrebotService.auth(String(req.headers['platform']), String(req.headers['password']))) {
            res.status(403).send("unauthed");
        } else {
            next();
        }
    } catch (err: any) {
        res.status(500).send("Database error");
    }
}

export const addWinners = async (req: Request, res: Response, next: NextFunction) => {
    andrebotService.addWinners(req.body.winners)

    res.status(200).send();
}

export const addUser = async(req: Request, res: Response, next: NextFunction) => {
    andrebotService.addUser(req.body.user).then(() => {
        res.status(200).send();
        console.log('ok');

    }).catch(_ => {
        console.log(_);
        res.status(500).send();
    });
}

export const getRank = async (req: Request, res: Response, next: NextFunction) => {
    const rank = await andrebotService.getRank(req.body.platforms || []);
    res.send({"rank": rank});
}


export const getCoursesbyBachelor = async (req: Request, res: Response, next: NextFunction)=> {
    const classSchedules = (await andrebotService.getCourses(req.body.bachelor || "CC")).slice(0,20);
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
    const allClasses = GraduationServices.classListByBachelor[bsc] || [];

    const bachelors = {
        CC: bsc === "CC",
        EC: bsc === "EC",
        SI: bsc === "SI"
    };
    res.render('timetableditor', { allClasses, bsc, bachelors });
};

export const renderClassList = (req: Request, res: Response) => {
    const program = req.query.program as string;
    const programClasses = GraduationServices.classListByBachelor[program] || [];
    res.render('classes', { programClasses });
};

export const RenderTimeTable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bsc = req.query.bsc as string || "CC";

        const IDsStrings = [...new Set(String(req.query.SelectedClassIDs || "").split(","))];
        const SelectedClassIDs: ClassSchedule[] = IDsStrings.filter(id => id).map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        });

        const NewIDsStrings = [...new Set(String(req.query.NewSelectedClassIDs || "").split(","))];
        const NewSelectedClassIDs: ClassSchedule[] = NewIDsStrings.filter(id => id).map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        });

        let currentlyChosenClasses = SelectedClassIDs.concat(NewSelectedClassIDs);
        const conflicts = GraduationServices.checkConflict(currentlyChosenClasses)       as [ClassSchedule, ClassSchedule][];

        let classestorender: ClassSchedule[] = [];

        if (conflicts.length === 0) 
            classestorender = currentlyChosenClasses;
        else classestorender = SelectedClassIDs;
        [classestorender, currentlyChosenClasses] = [[...new Set(classestorender)], [...new Set(currentlyChosenClasses)]];

        // Render the partial table and send as HTML
        res.render('timetable', { classestorender, conflicts, currentlyChosenClasses });
    } catch (error) {
        next(error);
    }
};

