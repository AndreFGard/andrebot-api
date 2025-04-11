import { CourseInfo, ScheduleDay, CourseDisplayInfo } from './schemas';
import * as fs from 'fs';



const coursesraw = fs.readFileSync('courses.json', 'utf-8');
const courses = JSON.parse(coursesraw) as Record<string, Record<number, CourseInfo[]>>;
Object.values(courses).forEach(major => {
    Object.values(major).forEach(trm => {
        let i =0;
        Object.values(trm).forEach(clss =>
             {
            clss.shortName = clss.name.replaceAll(" DE", "").replaceAll(" E ", " ").split(" ").slice(0,3).join(" ");
            clss.days.forEach(d => {
                i+=1;
                const hexcodes = ['#60d394ff', '#f58549ff', '#ff9b85ff', '#bc4b51ff', '#8cb369ff', '#ffd97dff', '#f4e285ff', '#f2a65aff', '#8cb369ff', '#772f1aff', '#f4a259ff', '#eec170ff', '#5b8e7dff', '#f4a259ff', '#ee6055ff', '#5b8e7dff', '#585123ff', '#f4e285ff', '#aaf683ff', '#bc4b51ff'];

                const color = hexcodes[i% hexcodes.length];
                const range = (a: number,b: number) => Array.from(Array(b).keys()).splice(a);
                
                //this is very ugly and even imprecise, but simplifies the timetable making a lot
                const start = Number(d.start.split(":")[0]) + Math.round(Number(d.start.split(":")[1])/60);
                const end = Number(d.end.split(":")[0]) + Math.round(Number(d.end.split(":")[1])/60);
                let hours = range(start,end).map(n => (n.toString().padStart(2, '0') + ":00"));
                d.aproxHourList = hours;
                d.course_id = clss.id;
                d.timeString = `${d.day}: ${d.start}-${d.end} `;
                d.className = clss.name;

                clss.colorCode = clss.colorCode || color;
                d.colorCode = clss.colorCode;
                
            })
        })
    })
})

export class timetableModel{
    readonly #courseDisplayInfoList: Record<string, Record<number, CourseDisplayInfo[]>> = {};

    constructor(){

        const y =
            Object.keys(courses).map((major) => {
            const mjrCourses = Object.entries(courses[major]).map(([term, courses]) => {
                const convertedCourses = courses.map((crs) => ({
                    name: crs.name,
                    id: crs.id,
                    professor: crs.professor
                }));

                return {[Number(term)]: convertedCourses};
            })
            const assigned = Object.assign({}, ...mjrCourses);
            return {[major]: assigned}
        });

        this.#courseDisplayInfoList = Object.assign({}, ...y);
    }


    getCoursesbymajor(major: string): Record<number, CourseInfo[]>{
        return courses[major] as Record<number, CourseInfo[]>;
        
    }

    getCourseDisplayInfoList(): Record<string, Record<number, CourseDisplayInfo[]>>{
        return this.#courseDisplayInfoList;
    }
}
