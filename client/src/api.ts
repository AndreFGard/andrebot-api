import { TimetableRenderInfo, CourseDisplayInfo, majorList } from './../../backend/models/schemas';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/timetable';
export type { CourseInfo, ITimetable, ScheduleDay, TimetableRenderInfo, CourseDisplayInfo } from './../../backend/models/schemas';

export const fetchTimetable = async (SelectedClassIDs: number[]) => {

    const response = await fetch(`${apiUrl}/timetable?NewSelectedClassIDs=${SelectedClassIDs.join(',')}`);
    const data = await response.json() as TimetableRenderInfo;
    console.log('Timetable fetched successfully:', data);
    return data;

};



export const coursesplaceholder: Record<string, Record<number, CourseDisplayInfo[]>> = {
    CC: {
        1: [
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
        2: [{
            name: 'Desenvolvimento Paia',
            id: 3,
            professor: 'Gustavo',
        },
        ]
    },
    EC: {        
        1: [{
            name: 'Calculo 1',
            id: 3,
            professor: 'Andre',
        }],
        2: [{
            name: 'Desenvolvimento Paia',
            id: 3,
            professor: 'Gustavo',
        }]
    },
    SI: [],
};

export const getCourseDisplayInfoList = async () => {
    const response = await fetch(`${apiUrl}/getCourseDisplayInfoList`);
    const data = await response.json() as Record<string, Record<number, CourseDisplayInfo[]>>;
    return data;
}


export { majorList };