
export interface ScheduleDay {
    day: string;
    start: string;
    end: string;
    aproxHourList: string[];
    classroom: string;
    course_id: number;
    timeString?: string;
    className: string;
    colorCode: string;

}

export interface ITimetable {
    table: Record<string, Record<string, ScheduleDay|undefined>>;
    aproxHourList: string[];
    startHour: Number;
    endHour: Number;
}

export interface CourseInfo {
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



interface TimetableRenderInfo {
    timetable: ITimetable;
    conflictlessClasses: CourseInfo[];
    conflicts: [CourseInfo, CourseInfo, ScheduleDay][];
    conflictIds: number[];
    conflictlessIds: number[];
}

export type {TimetableRenderInfo};

export interface CourseDisplayInfo{
    name: string;
    id: number;
    professor: string;
}

export const majorList = ["CC", "EC", "SI", "outros"];

export interface CurriculumDAG {
    prerequisites: Map<string, string[]>;
    coursesAndDegree: Record<string, number>;
    courseList: string[]; 
    completed_courses: string[];
    major: string;
    curriculumVersion: string;
}
