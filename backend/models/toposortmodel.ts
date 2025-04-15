import * as fs from 'fs';
import { CurriculumDAG, EquivalenceMapping } from './schemas';

function loadCurriculumData(filePath: string): CurriculumDAG {
  try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(data);

      const requiredFields = [
          { key: 'prerequisites', check: (v: any) => v && typeof v === 'object', message: "Missing or invalid 'prerequisites' field in JSON." },
          { key: 'completed_courses', check: Array.isArray, message: "'completed_courses' must be an array." },
          { key: 'major', check: (v: any) => typeof v === 'string', message: "'major' must be a string." },
          { key: 'curriculumVersion', check: (v: any) => typeof v === 'string', message: "'curriculumVersion' must be a string." },
          { key: 'equivalences', check: (v: any) => Array.isArray(v), message: "Invalid 'equivalences' field in JSON. It must be an array." },
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
          equivalences: parsedData.equivalences,
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
        console.log(this._curriculumDAG.completed_courses);
    }

    get curriculumDAG(): CurriculumDAG {
        return this._curriculumDAG;
    }

    private _expandEquivalences(codes: string[]): Set<string> {
        const expanded = new Set(codes);
        const equivalences = this.curriculumDAG.equivalences;

        let changed = true;
        while (changed) {
            changed = false;
            for (const { old_codes, new_codes } of equivalences) {
                const hasOld = old_codes.some(code => expanded.has(code));
                const hasNew = new_codes.some(code => expanded.has(code));

                if (hasOld) {
                    for (const newCode of new_codes) {
                        if (!expanded.has(newCode)) {
                            expanded.add(newCode);
                            changed = true;
                        }
                    }
                }

                if (hasNew) {
                    for (const oldCode of old_codes) {
                        if (!expanded.has(oldCode)) {
                            expanded.add(oldCode);
                            changed = true;
                        }
                    }
                }
            }
        }

        return expanded;
    }

    private _addEquivalences(): string[] {
        const completed_temp = new Set(this.curriculumDAG.completed_courses);
        const equivalences = this.curriculumDAG.equivalences;

        let changed = true;

        while (changed) {
            changed = false;
            for (const { old_codes, new_codes } of equivalences) {
                const oldCompleted = old_codes.every(code => completed_temp.has(code));
                const newCompleted = new_codes.every(code => completed_temp.has(code));

                if (oldCompleted) {
                    for (const newCode of new_codes) {
                        if (!completed_temp.has(newCode)) {
                            completed_temp.add(newCode);
                            changed = true;
                        }
                    }
                }

                if (newCompleted) {
                    for (const oldCode of old_codes) {
                        if (!completed_temp.has(oldCode)) {
                            completed_temp.add(oldCode);
                            changed = true;
                        }
                    }
                }
            }
        }

        return Array.from(completed_temp);
    }

    private setCourseList(): void {
        this.curriculumDAG.courseList = Array.from(this.curriculumDAG.prerequisites.keys());
    }

    private setCoursesAndDegree(): void {
        const temp: Record<string, number> = {};
        for (const course of this.curriculumDAG.courseList) {
            const prereqs = this.curriculumDAG.prerequisites.get(course) || [];
            const degree = prereqs.filter(pr => !this.curriculumDAG.completed_courses.includes(pr)).length;
            temp[course] = degree;
        }
        this.curriculumDAG.coursesAndDegree = temp;
    }

    private _validatePrerequisites(completed: Set<string>): Record<string, number> {
        const completedCoursesDegree: Record<string, number> = {};
        const validCompletedCourses = new Set<string>();

        for (const course of completed) {
            completedCoursesDegree[course] = this.curriculumDAG.coursesAndDegree[course] || 0;
            if (completedCoursesDegree[course] === 0) {
                validCompletedCourses.add(course);
            }
        }

        while (validCompletedCourses.size > 0) {
            const course = validCompletedCourses.values().next().value;
            if (course !== undefined) { validCompletedCourses.delete(course);}

            for (const [courseToCheck, prereqs] of Object.entries(this.curriculumDAG.prerequisites)) {
                if (prereqs.includes(course) && completedCoursesDegree[courseToCheck] > 0) {
                    completedCoursesDegree[courseToCheck]--;
                    if (completedCoursesDegree[courseToCheck] === 0) {
                        validCompletedCourses.add(courseToCheck);
                    }
                }
            }
        }

        return completedCoursesDegree;
    }

    private _coletarCursosFaltantes(
        completed: Set<string>,
        missingCompletedCourses: Set<string>
    ): Map<string, string[]> {
        const missingCourses: Map<string, string[]> = new Map();

        const addMissingPrerequisites = (originalCourse: string, currentCourse: string) => {
            const prereqs = this.curriculumDAG.prerequisites.get(currentCourse);
            if (!prereqs) return;

            for (const prereq of prereqs) {
                if (!completed.has(prereq) || missingCompletedCourses.has(prereq)) {
                    if (!missingCourses.has(originalCourse)) {
                        missingCourses.set(originalCourse, []);
                    }

                    const list = missingCourses.get(originalCourse)!;

                    if (!list.includes(prereq)) {
                        list.push(prereq);
                        addMissingPrerequisites(originalCourse, prereq);
                    }
                }
            }
        };

        for (const course of missingCompletedCourses) {
            addMissingPrerequisites(course, course);
        }

        return missingCourses;
    }

    public atualizarPrerequisitos(): string[] {
        try {
            this.curriculumDAG.completed_courses = this._addEquivalences();
            const completed = this._expandEquivalences(this.curriculumDAG.completed_courses);
            if (completed.size === 0) {
                throw new Error("No completed courses provided.");
            }

            const available: string[] = [];
            const completedCoursesDegree = this._validatePrerequisites(completed);

            const missingCompletedCourses = new Set(
                Object.entries(completedCoursesDegree)
                .filter(([_, degree]) => degree !== 0)
                .map(([course]) => course)
            );

            const missingCourses = this._coletarCursosFaltantes(completed, missingCompletedCourses);

            if (missingCourses.size > 0) {
                const missingCoursesList = Array.from(missingCourses.entries()).map(
                    ([course, prereqs]) => `${course}: ${prereqs.join(', ')}`
                );
                console.log("Missing courses:", missingCoursesList);
                // throw new Error(`Missing prerequisites: ${missingCoursesList.join(', ')}`);
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
