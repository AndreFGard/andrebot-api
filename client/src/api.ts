import {TimetableRenderInfo, CourseDisplayInfo, majorList} from './../../backend/models/schemas';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/timetable';
export type {CourseInfo, ITimetable, ScheduleDay, TimetableRenderInfo, CourseDisplayInfo} from './../../backend/models/schemas';

export const fetchTimetable = async (SelectedClassIDs: number[]) => {

    const response = await fetch(`${apiUrl}/timetable?NewSelectedClassIDs=${SelectedClassIDs.join(',')}`);
    const data = await response.json() as TimetableRenderInfo;
    console.log('Timetable fetched successfully:', data);
    return data;

};



export const coursesplaceholder : Record<string, CourseDisplayInfo[]> = {
    CC: [
        {
            name: 'Algebra Linear',
            id: 1,
            professor: "Silvio"
        },
        {
            name: 'Algoritmos',
            id: 2,
            professor: 'Gustavo',
        },
    ],
    EC: [
        {
            name: 'Arquietura de Sistemas Operacionas e Computadores',
            id: 2,
            professor: 'Andson',
        },
    ],
    SI: [],
};

export const getCourseDisplayInfoList = async () => {
    const response = await fetch(`${apiUrl}/getCourseDisplayInfoList`);
    const data = await response.json() as Record<string, CourseDisplayInfo[]>;
    return data;
}


export {majorList};