import * as fs from 'fs';
import { CurriculumDAG } from './schemas';

function loadCurriculumData(filePath: string): CurriculumDAG {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsedData = JSON.parse(data);

        const requiredFields = [
            { key: 'prerequisites', check: (v: any) => v && typeof v === 'object', message: "Missing or invalid 'prerequisites' field in JSON." },
            { key: 'completed_courses', check: Array.isArray, message: "'completed_courses' must be an array." },
            { key: 'major', check: (v: any) => typeof v === 'string', message: "'major' must be a string." },
            { key: 'curriculumVersion', check: (v: any) => typeof v === 'string', message: "'curriculumVersion' must be a string." },
        ];

        for (const field of requiredFields) {
            if (!field.check(parsedData[field.key])) {
                throw new Error(field.message);
            }
        }

        return {
            prerequisites: new Map<string, string[]>(Object.entries(parsedData.prerequisites)),
            coursesAndDegree: {} as Record<string, number>,
            courseList: [],
            completed_courses: parsedData.completed_courses,
            major: parsedData.major,
            curriculumVersion: parsedData.curriculumVersion,
        };
    } catch (error) {
        console.error(`Error loading curriculum data from ${filePath}:`, error);
        throw error;
    }
}

class ToposortModel {
    private readonly _curriculumDAG: CurriculumDAG;

    constructor(filePath: string) {
        this._curriculumDAG = loadCurriculumData(filePath);
        this.setCourseList();
        this.setCoursesAndDegree();
    }

    get curriculumDAG(): CurriculumDAG {
        return this._curriculumDAG;
    }

    setCourseList(): void {
        this.curriculumDAG.courseList = Array.from(this.curriculumDAG.prerequisites.keys());
    }

    setCoursesAndDegree(): void {
        const temp: Record<string, number> = {};
        for (const course of this.curriculumDAG.courseList) {
            const prereqs = this.curriculumDAG.prerequisites.get(course) || [];
            const degree = prereqs.filter(pr => !this.curriculumDAG.completed_courses.includes(pr)).length;
            temp[course] = degree;
        }
        this.curriculumDAG.coursesAndDegree = temp;
    }

    atualizarPrerequisitos(): string[] {
        try {
            const completed = new Set(this.curriculumDAG.completed_courses);
            if (completed.size === 0) {
                throw new Error("No completed courses provided.");
            }

            const available: string[] = [];
            const completedCoursesDegree = {} as Record<string, number>;
            const validCompletedCourses = new Set();

            for (const course of completed) {
                completedCoursesDegree[course] = this.curriculumDAG.coursesAndDegree[course] || 0;
                if (completedCoursesDegree[course] === 0) {
                    validCompletedCourses.add(course);
                }
            }

            while (validCompletedCourses.size > 0) {
                const course = validCompletedCourses.values().next().value;
                validCompletedCourses.delete(course);

                for (const [courseToCheck, prereqs] of Object.entries(this.curriculumDAG.prerequisites)) {
                    if (prereqs.includes(course) && completedCoursesDegree[courseToCheck] > 0) {
                        completedCoursesDegree[courseToCheck]--;
                        if (completedCoursesDegree[courseToCheck] === 0) {
                            validCompletedCourses.add(courseToCheck);
                        }
                    }
                }
            }

            const missingCourses: Map<string, string[]> = new Map();
            const missingCompletedCourses: Set<string> = new Set();

            const addMissingPrerequisites = (originalCourse: string, currentCourse: string, courseNotPossible: Set<string>) => {
                const prereqs = this.curriculumDAG.prerequisites.get(currentCourse);
                if (!prereqs) return;

                for (const prereq of prereqs) {
                    if (!completed.has(prereq) || courseNotPossible.has(prereq)) {
                        if (!missingCourses.has(originalCourse)) {
                            missingCourses.set(originalCourse, []);
                        }

                        const list = missingCourses.get(originalCourse)!;

                        if (!list.includes(prereq)) {
                            list.push(prereq);
                            addMissingPrerequisites(originalCourse, prereq, courseNotPossible);
                        }
                    }
                }
            };

            for (const [course, degree] of Object.entries(completedCoursesDegree)) {
                if (degree !== 0) {
                    if (!missingCompletedCourses.has(course)) {
                        missingCompletedCourses.add(course);
                    }
                }
            }

            for (const course of missingCompletedCourses) {
                addMissingPrerequisites(course, course, missingCompletedCourses);
            }


            if (missingCourses.size > 0) {
                const missingCoursesList = Array.from(missingCourses.entries()).map(
                    ([course, prereqs]) => `${course}: ${prereqs.join(', ')}`
                );
                console.log("Missing courses:", missingCoursesList);
                throw new Error(`Missing prerequisites: ${missingCoursesList.join(', ')}`);
            }

            for (const [course, prereqs] of this.curriculumDAG.prerequisites.entries()) {
                const remaining = prereqs.filter(pr => !completed.has(pr));
                this.curriculumDAG.prerequisites.set(course, remaining);
            }

            this.setCoursesAndDegree();

            for (const [course, degree] of Object.entries(this.curriculumDAG.coursesAndDegree)) {
                if (degree === 0 && !completed.has(course)) {
                    available.push(course);
                }
            }

            return available;
        } catch (error) {
            console.error("Error updating prerequisites:", error);
            throw error;
        }
    }

}

export { ToposortModel, loadCurriculumData };
export type { CurriculumDAG };
