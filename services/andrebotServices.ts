import bcrypt from "bcryptjs";
import z from 'zod';
import {AndrebotModel} from "../models/andrebotmodel"

const model = new AndrebotModel();

export interface UserEntry {
    username: string, platform: string;
};

export interface rankEntry extends UserEntry {
    wins: number;
    anon_username: string;
};

export interface Victory_Event {
    username: string,
    loser_username: string,
    word: string,
    platform: string,
    attempts: number,
    date?: string
}

const Victory_Event_Schema = z.object({
    username: z.string(),
    loser_username: z.string().optional(),
    word: z.string(),
    platform: z.string(),
    attempts: z.number(),
    date: z.string().optional()
});

export interface ScheduleDay {
    day: string;
    start: string;
    end: string;
    classroom: string;
    id: number;
}

export interface ClassSchedule {
    bachelor: string;
    code: string;
    name: string;
    professor: string;
    days: ScheduleDay[];
    id: number;
    term: string;
    optional: boolean;
}

export const weekdays = ["seg", "ter", "qua", "qui", "sex"];

export type TermDict = Record<number, ClassSchedule[]>;
export type BachelorDict = Record<string, TermDict>;

export class CourseTable {
    bachelorDict: BachelorDict;
    bachelors: string[];
    classListByBachelor: Record<string, ClassSchedule[]>;
    classesByCode: Record<string, Record<string, ClassSchedule[]>>;
    classesByID: Record<number, ClassSchedule>
    


    constructor(courses: BachelorDict){
        this.bachelorDict = courses;
        this.bachelors = Object(courses).keys();
        this.classListByBachelor = {};

        this.bachelors.forEach((bachelor: string) => {
            this.classListByBachelor[bachelor] = Object(this.bachelorDict[bachelor]).values();
        });
        
        this.classesByID = {}
        this.classesByCode = {};
        Object.entries(this.classListByBachelor).forEach(([bsc, classList]) => {
            this.classesByCode[bsc] = {};
            classList.forEach(classSched => {
                if (classSched.code in this.classesByCode[bsc]) this.classesByCode[bsc][classSched.code].push(classSched);
                else this.classesByCode[bsc][classSched.code] = [classSched];

                this.classesByID[classSched.id] = classSched;
            });

        })

    }

    getCourseList(bachelor: string){
        return this.classListByBachelor[bachelor];
    }

    getClassesByCode(bsc: string, code  : string){
        return this.classesByCode.bsc.code || [];
    }

    getClassByID(id: number){
        return this.classesByCode[id] || undefined;
    }


    checkConflict(classes: ClassSchedule[]){
        const days = classes.map((classs) => {
            return classs.days}).flat();


    }
}


const bachelors = ["CC", "EC", "SI"];
let courses: BachelorDict = {}
Object(bachelors).forEach( (bachelor: string) => {
    courses[bachelor] = model.getCoursesbyBachelor(bachelor);
});

export const GraduationServices = new CourseTable(courses);
export class andrebotServices {


    async getHash(password: string){
        return await bcrypt.hash(password, 10);
    }

    async auth(username: string, password: string): Promise<boolean> {
        const hashed = await model.authAdmin(username);
        
        return bcrypt.compareSync(password, hashed);
    }

    async getRank(showPlatforms: Array<string>){
        const rows = await model.getRank();

        let filtered: Array<rankEntry> = rows.map((value: rankEntry) => {
            const newname = showPlatforms.includes(value.platform) ? value.username: value.anon_username;
            value.username = newname;
            return value;
        });

        return filtered;

    }

    async addWinner(event: Victory_Event) {
        //discord, telegram are the allowed platforms, for now
        if (!['dsc', 'tg'].includes(event.platform)) {
            return 0;
        }
        await model.addWinner(event.username,event.loser_username,event.word,event.platform,event.attempts,event.date);
    }

    async addWinners(events: Array<Victory_Event>){
        for (const evt of events){
            await this.addWinner(evt);
        }
    }

    async addUser({ username, platform, wins }: { username: string, platform: string, wins?: number }) {
        model.addUser(username, platform, wins||0);
        return;
    }

    async getCourses(bachelor: string){

        //let filteredCourses: ClassSchedule[][] ;
        //filteredCourses = Object.values(courses) as ClassSchedule[][];

        let courselist: ClassSchedule[] =[];
        Object.entries(courses).forEach((key: any[],_) =>{
            key[1].forEach((k: any) => {
                courselist.push(k);
            });
        })
        return courselist;
    }

    async getClassesFromCodes(codes: string[]){

    }


}

