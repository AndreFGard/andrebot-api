import { CourseInfo, ScheduleDay, CourseDisplayInfo, majorList } from './schemas';
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
                const hexcodes = ['#fee2e2', '#ffedd5', '#fef3c7', '#fef9c3', '#ecfccb', '#dcfce7', '#d1fae5', '#ccfbf1', '#cffafe', '#e0f2fe', '#dbeafe', '#e0e7ff', '#ede9fe', '#f3e8ff', '#fae8ff', '#fce7f3', '#ffe4e6', '#f1f5f9', '#f3f4f6', '#f4f4f5', '#f5f5f5', '#f5f5f4']; // Tailwind bg-100 shades

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

const data = courses;

Object.keys(data).filter(k => {return(!majorList.includes(k))})
    .forEach(k=> {
        if (!data["outros"]) data["outros"] = {'-1': []};
        const subdata = Object.values(data[k]).flat();
        data["outros"][-1] = data["outros"][-1].concat(subdata)
        delete data[k];
    }
);

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
