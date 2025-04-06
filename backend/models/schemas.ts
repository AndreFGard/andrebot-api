
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

export interface TimetableResponse {
    classestorender: CourseInfo[];
    currentlyChosenClasses: CourseInfo[];
    timetable: ITimetable;
    conflictsIDs: number[];
    conflictDays: [CourseInfo, CourseInfo, ScheduleDay][];
    blamedConflicts: [CourseInfo, CourseInfo, ScheduleDay][];
}