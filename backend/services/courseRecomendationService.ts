
import { CourseInfo, majorList, PendingCourse} from "../models/schemas";


export type {PendingCourse};

//interface that must be implemented
export class CurriculumManager {
    // Abstract methods that must be implemented by child classes
    constructor(major:string){
        //load the file relevant to the major
    }
    getPendingCourses(completedCourseCodes: string[]): PendingCourse[] {
        const placeholder:PendingCourse = {
            major: "CC",
            code: "CIN0133",
            name: "INTRODUÇÃO À PROGRAMAÇÃO",
            professor: "Ricardo Massa Ferreira Lima / Sérgio Soares / Fernanda Madeiral Delfim",
            days: [], // Added missing required field
            id: 5,
            term: "1", // Fixed term field
            optional: false,
            blockedCourseIds: [],
            blockedCourseCodes: []
        }
        return [placeholder] as PendingCourse[];
    }
}

export class RecommendationSystem{
    majorManagers: Record<string, CurriculumManager> = {};
    constructor(majors=majorList.slice(0, -1)){
        majors.forEach((major) => {
            this.majorManagers[major] = new CurriculumManager(major);
        });
    }

    getRecommendations(major: string, completedCourseCodes: string[]): Record<number, PendingCourse[]> {
        const man = this.majorManagers[major];
        const pending = man.getPendingCourses(completedCourseCodes)
        const byTerm: Record<number, PendingCourse[]> = {};
        for (const course of pending) {
            if (byTerm[Number(course.term)]){
                byTerm[Number(course.term)].push(course);
            }
            else byTerm[Number(course.term)] = [course];
        }
        return byTerm;
    }
}