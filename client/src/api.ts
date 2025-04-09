import {TimetableRenderInfo, courseDisplayInfo, majorList} from './../../backend/models/schemas';

export type {CourseInfo, ITimetable, ScheduleDay, TimetableRenderInfo, courseDisplayInfo} from './../../backend/models/schemas';

export const fetchTimetable = async (SelectedClassIDs: number[]) => {

    const response = await fetch(`http://localhost:3000/timetable/timetable?NewSelectedClassIDs=${SelectedClassIDs.join(',')}`);
    const data = await response.json() as TimetableRenderInfo;
    console.log('Timetable fetched successfully:', data);
    return data;

};



export const coursesplaceholder : Record<string, courseDisplayInfo[]> = {
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

export {majorList};