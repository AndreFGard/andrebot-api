
export interface ScheduleDay {
    day: string;
    start: string;
    end: string;
    aproxHourList: string[];
    classroom: string;
    course_id: number;
    timeString?: string;
    class?: CourseInfo;
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