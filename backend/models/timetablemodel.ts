import { CourseInfo, ScheduleDay, CourseDisplayInfo, majorList } from './schemas';
import * as fs from 'fs';



const coursesraw = fs.readFileSync('courses.json', 'utf-8');
const courses = JSON.parse(coursesraw) as Record<string, Record<number, CourseInfo[]>>;
Object.values(courses).forEach(major => {
    Object.values(major).forEach(trm => {
        let i =0;
        Object.values(trm).forEach(clss => {
            clss.isNewCurriculum = clss.code.toLowerCase().includes("cin");
            clss.shortName = clss.name.replaceAll(" DE", "").replaceAll(" E ", " ").split(" ").slice(0,3).join(" ");
            clss.days.forEach(d => {
                i+=1;
                const hexcodes = ['#fee2e2', '#ffedd5', '#fef3c7', '#fef9c3', '#ecfccb', '#d1fae5', '#a7f3d0', '#99f6e4', '#a5f3fc', '#bae6fd', '#c7d2fe', '#e0e7ff', '#ddd6fe', '#f5d0fe', '#fae8ff', '#fde7f3', '#e5e7eb', '#d1d5db', '#f3f4f6', '#e5e7eb']; // Updated Tailwind bg-200 shades

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

    readonly #coursesByCode: Record<string, CourseInfo> = {};

    constructor(){

        const y =
            Object.keys(courses).map((major) => {
            const mjrCourses = Object.entries(courses[major]).map(([term, courses]) => {
                const convertedCourses = courses.map((crs) => ({
                    name: crs.name,
                    id: crs.id,
                    professor: crs.professor,
                    term: crs.term,
                    code: crs.code,
                    isNewCurriculum: crs.isNewCurriculum,
                } as CourseDisplayInfo))

                return {[Number(term)]: convertedCourses};
            })
            const assigned = Object.assign({}, ...mjrCourses);
            return {[major]: assigned}
        });

        this.#courseDisplayInfoList = Object.assign({}, ...y);

        this.#coursesByCode = {};
        Object.entries(courses).forEach(([major, termCourses]) => {
            Object.entries(termCourses).forEach(([term, courseList]) => {
                courseList.forEach(course => {
                    this.#coursesByCode[course.code] = course;
                });
            });
        });

            
    }


    getCoursesbymajor(major: string): Record<number, CourseInfo[]>{
        return courses[major] as Record<number, CourseInfo[]>;
        
    }

    getCourseDisplayInfoList(): Record<string, Record<number, CourseDisplayInfo[]>>{
        return this.#courseDisplayInfoList;
    }

    getCourseBycode(code: string): CourseInfo|undefined{   
        return this.#coursesByCode[code] || undefined ;
    }
}
