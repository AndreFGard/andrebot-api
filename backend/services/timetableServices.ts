import {timetableModel} from "../models/timetablemodel"
import { CourseInfo, ScheduleDay, ITimetable, TimetableRenderInfo} from '../models/schemas';



const model = new timetableModel();
function min(a:string, b:string){
    return (a < b) ? a : b;
}
const max = (a:string, b:string) => (a > b) ? a : b;



export class Timetable implements ITimetable {
    table: Record<string, Record<string, ScheduleDay|undefined>>
    //range of hours that must be included in the table eg. ['08:00','09:00', '10:00']
    aproxHourList: string[];
    //the earliest starting hour: 8
    startHour: Number;
    //the latest ending hour: 10
    endHour: Number;

    constructor(classes: CourseInfo[], filterConflictless: (classes: CourseInfo[]) => CourseInfo[]){
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

export type TermDict = Record<number, CourseInfo[]>;
export type majorDict = Record<string, TermDict>;

export class CourseTable {
    majorDict: majorDict;
    majors: string[];
    classListBymajor: Record<string, CourseInfo[]>;
    _classesByCode: Record<string, Record<string, CourseInfo[]>>;
    classesByID: Record<number, CourseInfo>
    
    constructor(courses: majorDict){
        this.majorDict = courses;
        this.majors = Object.keys(courses);
        this.classListBymajor = {};

        this.majors.forEach((major: string) => {
            this.classListBymajor[major] = Object.values(this.majorDict[major]).flat();
        });
        
        this.classesByID = {}
        this._classesByCode = {};
        Object.entries(this.classListBymajor).forEach(([major, classList]) => {
            this._classesByCode[major] = {};
            classList.forEach(classSched => {
                if (classSched.code in this._classesByCode[major]) this._classesByCode[major][classSched.code].push(classSched);
                else this._classesByCode[major][classSched.code] = [classSched];

                this.classesByID[classSched.id] = classSched;
            });

        })
    }

    getCourseList(major: string){
        return this.classListBymajor[major];
    }

    getClassesByCode(major: string, code  : string){
        return this._classesByCode.major.code || [];
    }

    getClassByID(id: number){
        return this.classesByID[id] || undefined;
    }

    checkDayConflict(day1: ScheduleDay, day2: ScheduleDay){
        if (day1.course_id == day2.course_id) return false; //they are the same
        else if ((day1.day == day2.day) && (
                (day1.start <= day2.start && day1.end >= day2.start)
            || 
                (day2.start <= day1.start && day2.end >= day1.start))){
                    return true;
            }
        return false;
    }

    getConflictingDays(classes: CourseInfo[]){
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
    getConflictingClasses(classes: CourseInfo[]){
        const failed_classes = this.getConflictingDays(classes).map(([d1, d2]) => {
            return [this.getClassByID(d1.course_id), this.getClassByID(d2.course_id)];
        });
        return failed_classes ;
    }

    blameConflictingClasses(classes: CourseInfo[]): [CourseInfo, CourseInfo, ScheduleDay][] {
        const failed_blamed_truples = this.getConflictingDays(classes)
                .map(([d1, d2]) =>  [this.getClassByID(d1.course_id), this.getClassByID(d2.course_id), d1]);
        
        return failed_blamed_truples as [CourseInfo, CourseInfo, ScheduleDay][];
    }

    filterConflictless(classes: CourseInfo[]){
        const conflictsIds = GraduationServices.getConflictingClasses(classes).flat().map(clss => clss.id);
        return classes.filter( clss => {
            return (!conflictsIds.includes(clss.id));
        })
    }

    //arranges the timetable given that it's guaranteed that there are no conflicts
    arrangeTimetable(classes: CourseInfo[]){
        return new Timetable(classes, GraduationServices.filterConflictless);
    }
}


const majors = ["CC", "EC", "SI"];
let courses: majorDict = {}
Object(majors).forEach( (major: string) => {
    courses[major] = model.getCoursesbymajor(major);
});

export const GraduationServices = new CourseTable(courses);


export class TimeTableService{
    constructor() {
        // Empty constructor
    }

    async getCourses(major: string){

        //let filteredCourses: CourseInfo[][] ;
        //filteredCourses = Object.values(courses) as CourseInfo[][];

        let courselist: CourseInfo[] =[];
        Object.entries(courses).forEach((key: any[],_) =>{
            key[1].forEach((k: any) => {
                courselist.push(k);
            });
        })
        return courselist;
    }

    async getClassesFromCodes(codes: string[]){

    }

    async renderTimetable(chosenids: string[], addedClassIds: string[]){

        //theoretically, these should be conflictless
        const chosenClasses = chosenids.map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        });
        console.log(chosenClasses)
        
        const addedClasses: CourseInfo[] = addedClassIds.filter(id => id).map(ID => {
            return GraduationServices.getClassByID(Number(ID));
        }).filter((x) => x !== undefined);

        
        //** all classes, including conflicting ones */
        let currentlyChosenClasses = [...new Set(chosenClasses.concat(addedClasses))].filter(i=>i!==undefined);
        let conflictlessClasses: CourseInfo[] = GraduationServices.filterConflictless(currentlyChosenClasses);
        
        //const conflictDays = GraduationServices.getConflictingDays(currentlyChosenClasses).flat();
        const conflicts = GraduationServices.blameConflictingClasses(currentlyChosenClasses);
        const conflictIds = [...new Set(conflicts.map(x => (x[0].id, x[1].id)).flat())];

        [conflictlessClasses, currentlyChosenClasses] = [conflictlessClasses, currentlyChosenClasses]
                    .map((x)=>[... new Set(x)]);

        const timetable = GraduationServices.arrangeTimetable(conflictlessClasses);
        

        // const renderInfo: TimetableRenderInfo = {
        //     timetable: timetable,
        //     conflictingClasses: conflictingClasses.map(([c1, c2]) => c1), // Extracting just the first class from each conflict pair
        //     conflictingIds: conflictingIds,
        //     conflictlessClasses: conflictlessClasses,
        //     conflictlessIds: conflictlessClasses.map(c => c.id),
        // };
        const renderInfo: TimetableRenderInfo = {
            timetable: timetable,
            conflictlessClasses: conflictlessClasses,
            conflicts: conflicts,
            conflictIds: conflictIds,
            conflictlessIds: conflictlessClasses.map(c => c.id),
        }

        return renderInfo;      
    }


}