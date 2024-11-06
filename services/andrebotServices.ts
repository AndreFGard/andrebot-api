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
const _weekdaysDict = Object.fromEntries(weekdays.map((day, index) => [day, Number(index)]));

export type TermDict = Record<number, ClassSchedule[]>;
export type BachelorDict = Record<string, TermDict>;

export class CourseTable {
    bachelorDict: BachelorDict;
    bachelors: string[];
    classListByBachelor: Record<string, ClassSchedule[]>;
    _classesByCode: Record<string, Record<string, ClassSchedule[]>>;
    classesByID: Record<number, ClassSchedule>
    
    constructor(courses: BachelorDict){
        this.bachelorDict = courses;
        this.bachelors = Object(courses).keys();
        this.classListByBachelor = {};

        this.bachelors.forEach((bachelor: string) => {
            this.classListByBachelor[bachelor] = Object(this.bachelorDict[bachelor]).values();
        });
        
        this.classesByID = {}
        this._classesByCode = {};
        Object.entries(this.classListByBachelor).forEach(([bsc, classList]) => {
            this._classesByCode[bsc] = {};
            classList.forEach(classSched => {
                if (classSched.code in this._classesByCode[bsc]) this._classesByCode[bsc][classSched.code].push(classSched);
                else this._classesByCode[bsc][classSched.code] = [classSched];

                this.classesByID[classSched.id] = classSched;
            });

        })
    }

    getCourseList(bachelor: string){
        return this.classListByBachelor[bachelor];
    }

    getClassesByCode(bsc: string, code  : string){
        return this._classesByCode.bsc.code || [];
    }

    getClassByID(id: number){
        return this.classesByID[id] || undefined;
    }

    checkDayConflict(day1: ScheduleDay, day2: ScheduleDay){
        if (day1.id == day2.id) return false; //they are the same
        else if ((day1 == day2) && (
                (day1.start <= day2.start && day1.end >= day2.start)
            || 
                (day2.start <= day1.start && day2.end >= day1.start))){
                    return true;
            }
        return false;
    }

    checkConflict(classes: ClassSchedule[]){
        let days = classes.map((classs) => {
            return classs.days}).flat();
        days.sort((a,b) => {
            return (_weekdaysDict[a.day] < _weekdaysDict[b.day]) ? -1 : 1;
        })

        let sortedDays: Record<string, ScheduleDay[]> = {};

        days.forEach(d => {
            if (d.day in sortedDays) sortedDays[d.day].push(d);
            else sortedDays[d.day] = [d];
        })

        let failed: [ScheduleDay,ScheduleDay][] = [];
        Object.entries(sortedDays).forEach(([entr, dayList]) => {
            dayList.forEach(d1 => {
                dayList.forEach(d2 => {
                    if (this.checkDayConflict(d1, d2)) failed.push([d1,d2]);
                });
            });
        });
        
        const failed_classes = failed.map(([d1, d2]) => {
            return [this.getClassByID(d1.id), this.getClassByID(d1.id)];
        });
        return failed_classes ;
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

