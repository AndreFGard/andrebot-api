
import { CourseInfo, majorList, PendingCourse} from "../models/schemas";



import { RecommendationModel } from "../models/toposortmodel";
//interface that must be implemented
export class CurriculumManager {
    // Abstract methods that must be implemented by child classes
    recommender: RecommendationModel = new RecommendationModel();
    constructor(major:string){
        //load the file relevant to the major
    }
    getPendingCourses(major:string, currentTerm:number, newCurriculum:boolean, completedCourseCodes: string[]): PendingCourse[] {
        const pend =  this.recommender.getPendingCourses(major, newCurriculum,currentTerm+1, completedCourseCodes);
        return (newCurriculum) ? pend["NEW"] : pend["OLD"];
    }
}

export class RecommendationSystem{
    majorManagers: Record<string, CurriculumManager> = {};
    constructor(majors=majorList.slice(0, -1)){
        majors.forEach((major) => {
            this.majorManagers[major] = new CurriculumManager(major);
        });
    }

    getRecommendations(major: string, currentTerm:number, newCurriculum:boolean, completedCourseCodes: string[]): Record<number, PendingCourse[]> {
        const man = this.majorManagers[major];
        const pending = man.getPendingCourses(major, currentTerm, newCurriculum, completedCourseCodes);
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