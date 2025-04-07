import {TimetableRenderInfo} from './../../backend/models/schemas';

export type {CourseInfo, ITimetable, ScheduleDay, TimetableRenderInfo} from './../../backend/models/schemas';

export const fetchTimetable = async (SelectedClassIDs: number[]) => {

    const response = await fetch(`http://localhost:3000/timetable/timetable?NewSelectedClassIDs=${SelectedClassIDs.join(',')}`);
    const data = await response.json() as TimetableRenderInfo;
    console.log('Timetable fetched successfully:', data);
    return data;

};