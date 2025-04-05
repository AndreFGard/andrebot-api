import { number } from 'zod';
import bcrypt from "bcryptjs";
import z from 'zod';
import {AndrebotModel} from "../models/andrebotmodel"

const model = new AndrebotModel();
function min(a:string, b:string){
    return (a < b) ? a : b;
}
const max = (a:string, b:string) => (a > b) ? a : b;
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
    aproxHourList: string[];
    class?: ClassSchedule;
    classroom: string;
    id: number;
    timeString?: string;
}

export interface ClassSchedule {
    major: string;
    code: string;
    name: string;
    professor: string;
    days: ScheduleDay[];
    id: number;
    term: string;
    optional: boolean;
    colorCode?: string;
    shortName?: string;
}

export class Timetable{
    table: Record<string, Record<string, ScheduleDay|undefined>>
    //range of hours that must be included in the table eg. ['08:00','09:00', '10:00']
    aproxHourList: string[];
    //the earliest starting hour: 8
    startHour: Number;
    //the latest ending hour: 10
    endHour: Number;

    constructor(classes: ClassSchedule[], filterConflictless: (classes: ClassSchedule[]) => ClassSchedule[]){
        let filteredDays = filterConflictless(classes)
                                    .map(c => c.days)
                                    .flat();
        
        //sort by hour and day
        filteredDays.sort((a,b) => {
            return (_weekdaysDict[a.start] < _weekdaysDict[b.start]) ? -1 : 1;
        });

        filteredDays.sort((a,b) => {
            return (_weekdaysDict[a.day] < _weekdaysDict[b.day]) ? -1 : 1;
        });

        let table : Record<string, Record<string, ScheduleDay|undefined>> = {};
        let globalstart = "25:00", globalmax = "00:00";
        for (const day of weekdays) table[day] = {};

        for (const day of filteredDays){
            if (day.aproxHourList){
                globalstart = min(day.aproxHourList[0], globalstart);
                globalmax = max(day.aproxHourList.slice(-1)[0], globalmax);

                for (const h of day.aproxHourList){
                    table[day.day][h] = day;
                }
            }
        }
        //+2 because it includes the last and adds another spare hour to prettify the table
        const range = (a: string|number,b: string|number) => 
            Array.from(Array(Number(b)+2).keys()).splice(Number(a)); 


        const hourRange = range(globalstart.split(":")[0],globalmax.split(":")[0])
                            .map(n => (n.toString().padStart(2, '0') + ":00"));
        
        for (let dayrecord of Object.values(table)){
            for (const h of hourRange){
                if (!(h in dayrecord)){
                dayrecord[h] = undefined;
                }
            }
        }

        this.table = table;
        this.aproxHourList = hourRange;
        [this.startHour, this.endHour] = [globalstart,globalmax].map(x => Number(x.split(":")[0]));


    }
}

export const weekdays = ["seg", "ter", "qua", "qui", "sex"];
const _weekdaysDict = Object.fromEntries(weekdays.map((day, index) => [day, Number(index)]));

export type TermDict = Record<number, ClassSchedule[]>;
export type majorDict = Record<string, TermDict>;

export class CourseTable {
    majorDict: majorDict;
    majors: string[];
    classListBymajor: Record<string, ClassSchedule[]>;
    _classesByCode: Record<string, Record<string, ClassSchedule[]>>;
    classesByID: Record<number, ClassSchedule>
    
    constructor(courses: majorDict){
        this.majorDict = courses;
        this.majors = Object.keys(courses);
        this.classListBymajor = {};

        this.majors.forEach((major: string) => {
            this.classListBymajor[major] = Object.values(this.majorDict[major]).flat();
        });
        
        this.classesByID = {}
        this._classesByCode = {};
        Object.entries(this.classListBymajor).forEach(([bsc, classList]) => {
            this._classesByCode[bsc] = {};
            classList.forEach(classSched => {
                if (classSched.code in this._classesByCode[bsc]) this._classesByCode[bsc][classSched.code].push(classSched);
                else this._classesByCode[bsc][classSched.code] = [classSched];

                this.classesByID[classSched.id] = classSched;
            });

        })
    }

    getCourseList(major: string){
        return this.classListBymajor[major];
    }

    getClassesByCode(bsc: string, code  : string){
        return this._classesByCode.bsc.code || [];
    }

    getClassByID(id: number){
        return this.classesByID[id] || undefined;
    }

    checkDayConflict(day1: ScheduleDay, day2: ScheduleDay){
        if (day1.id == day2.id) return false; //they are the same
        else if ((day1.day == day2.day) && (
                (day1.start <= day2.start && day1.end >= day2.start)
            || 
                (day2.start <= day1.start && day2.end >= day1.start))){
                    return true;
            }
        return false;
    }

    getConflictingDays(classes: ClassSchedule[]){
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
        return failed;
    }

    //TODO - make it possible  to reuse previously detected conflicts rather than recalculating htem always
    getConflictingClasses(classes: ClassSchedule[]){
        const failed_classes = this.getConflictingDays(classes).map(([d1, d2]) => {
            return [this.getClassByID(d1.id), this.getClassByID(d2.id)];
        });
        return failed_classes ;
    }

    blameConflictingClasses(classes: ClassSchedule[]){
        const failed_blamed_truples = this.getConflictingDays(classes)
                .map(([d1, d2]) =>  [this.getClassByID(d1.id), this.getClassByID(d2.id), d1]);
        
        return failed_blamed_truples;
    }

    filterConflictless(classes: ClassSchedule[]){
        const conflictsIds = GraduationServices.getConflictingClasses(classes).flat().map(clss => clss.id);
        return classes.filter( clss => {
            return (!conflictsIds.includes(clss.id));
        })
    }

    //arranges the timetable given that it's guaranteed that there are no conflicts
    arrangeTimetable(classes: ClassSchedule[]){
        return new Timetable(classes, GraduationServices.filterConflictless);
    }
}


const majors = ["CC", "EC", "SI"];
let courses: majorDict = {}
Object(majors).forEach( (major: string) => {
    courses[major] = model.getCoursesbymajor(major);
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

    async getCourses(major: string){

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

