import * as fs from 'fs';
import { CurriculumDAG, EquivalenceMapping, PendingCourse } from './schemas';

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

export interface CourseEquivalence {
    name?: string;
    // Old course information
    old_codes: string[];
    old_course_name: string[];
    old_status: string[];
    _class_hours: string[];
    class_hours: number;

    
    // New course information
    new_codes: string[];
    new_course_name: string[];
    new_status: string[];
  }
  
interface MandatoryCourse{
    code:string;
    name:string;
    term:string;
}

interface MandatoryGraph{
    g: Record<string, string[]>
    degrees: Record<string, number>;
    uncaughtCourses: string[];
}


export class RecommendationModel{
    prerequisites: Record<string, string[]> = {}
    equivalences: Record<string, string[]> = {}
    code_equivalences: Record<string, CourseEquivalence> = {};
    mandatoryGraphs: Record<string, MandatoryGraph> = {};
    uncaughtCourses: string[] = [];
    mandatoryCurriculumCourse:  Record<string, Record<string,  Record<number, Record<string, MandatoryCourse>[]>>> = {}
    //* only mandatory courses included

    constructor(){
        const data = fs.readFileSync("general_course_info.json", 'utf-8');
        const parsedData = JSON.parse(data);
        //const prerequList = new Map<string, string[]>(Object.entries(parsedData.prerequisites));
        this.prerequisites = parsedData.prerequisites;

        const mandat = JSON.parse(
                    fs.readFileSync("mandatory_courses.json", 'utf-8')
                )
        this.mandatoryCurriculumCourse = mandat.mandatory;

        const course_code_equivalences_f = fs.readFileSync("course_code_equivalences.json", 'utf-8');
        const course_code_equivalences = JSON.parse(course_code_equivalences_f);
        this.code_equivalences = course_code_equivalences;
        
        for (const [key, value] of Object.entries(this.code_equivalences)) {
            value.name = key;
            value.class_hours = parseInt(value._class_hours[0]);
            
        }

        const x=  Object.assign({}, ...["CC","EC","SI"].map(major => {return {[major]:this.buildMandatoryGraph(major)}}));
        this.mandatoryGraphs = x;
        
        // for (const [k,v] of Object.entries(this.code_equivalences)) {
        //     //if one course = 2 courses, well record only
        //     // the one course as having an equivalence to the other 2
        // }
    }

    private getPrereqsOfMissingCourses(
        completed: Set<string>,
        missing: Set<string>
    ): Record<string, string[]> {
        const missingCourses: Map<string, string[]> = new Map();
        const dealt = new Set();
        const deepmmissing = Array.from(missing);
        const miss = {} as Record<string, string[]>;

        while(deepmmissing.length){
            const curm = deepmmissing.pop()!;
            if (dealt.has(curm)) continue;

            dealt.add(curm);

            for (const son of this.prerequisites[curm]) {
                if (!miss[son]) {
                    miss[son] = [];
                }
                miss[son].push(curm);
                if (!completed.has(son) && !dealt.has(son)) deepmmissing.push(son);
            }
        }

        return miss;
    }

    private addEquivalencesToCompleted(completedCourses: string[]|Set<string>): string[] {
        const equivalences = this.code_equivalences;
        let completed = new Set(completedCourses);
        let oldval = completed.size;
        for (let x=0; x<2; x++){

            for (const [k,v] of Object.entries(equivalences)) {
                const oldCompletedEquivalencies = v.old_codes.every(code => completed.has(code)) && v.old_codes.length;
                const newCompletedEquivalencies = v.new_codes.every(code => completed.has(code)) && v.new_codes.length;

                if (oldCompletedEquivalencies || newCompletedEquivalencies) {
                    for (const code of v.new_codes.concat(v.old_codes)) {
                        completed.add(code);
                    }
                }
                if (completed.size != oldval)
                    oldval = completed.size
            }
        }

        return Array.from(completed);
    }

    private getMandatoryCourseDicts(major:string, newCurr:boolean,  maxTerm:number=11){
        const curstr = (newCurr) ? "NEW" : "OLD";
        const mandatoryCodes: Record<string, MandatoryCourse>[] = Object.values(this.mandatoryCurriculumCourse[curstr][major]).flat();
        const y =  (mandatoryCodes.filter(d =>Number( Object.values(d)[0].term) <=maxTerm));
        return y;
    }

    //* bypass the term numbers and course code dicts
    private getMandatoryCoursess(major:string, newCurr:boolean, maxTerm:number=11){
        const mandatoryCodes = this.getMandatoryCourseDicts(major,newCurr).map(x=>Object.values(x)).flat().filter(x=>parseInt(x.term) <= maxTerm);
        return mandatoryCodes;
    }



    private buildMandatoryGraph(major:string){
        const mandatoryCourses =  ([true,false].map(curr=>this.getMandatoryCoursess(major, curr))).flat();

        const g: MandatoryGraph = {g: {}, degrees: {}, uncaughtCourses: []};
        const uncaughtCourses = [];
        for (const course of mandatoryCourses){
            if (!this.prerequisites[course.code]){
                uncaughtCourses.push(course.code);
                continue;
            }

            g.degrees[course.code] = (g.degrees[course.code] || 0);
            if (g.g[course.code] === undefined){
                g.g[course.code] = [];
            }

            for (const p of this.prerequisites[course.code]){
                if (g.g[p] === undefined){
                    g.g[p] = [];
                }
                g.g[p].push(course.code);
                g.degrees[course.code] += 1;
            }
        }
        g.uncaughtCourses = uncaughtCourses;
        return g;
    }



    private getPendingCodes(
            major:string,
            newCurr:boolean,
            maxTermToConsider:number,
            completedCodes: string[]){
                
        const completedfull = this.addEquivalencesToCompleted(completedCodes);
        const compleSet = new Set(completedfull);
        const g = this.mandatoryGraphs[major];
        //all the requisites of mandatory courses are mandatory themselves
        const mark = {...g.degrees};
        const orphans = [...completedfull];

        while(orphans.length){
            const dad = orphans.pop()!;
            if (!g.g[dad]) continue;
            for (const son of g.g[dad]){
                mark[son]--;
                if (mark[son] === 0){
                    orphans.push(son);
                }
            }
        }

        const pending = Object.entries(mark).filter(([_,v]) => (v <= 0) && (!compleSet.has(_))).map(([k,_]) => k);
        return pending;
    }

    private getTermOfCode(major:string, newCurr: boolean, code:string){
        const terms = this.mandatoryCurriculumCourse[(newCurr) ? "NEW" : "OLD"][major];
        for (const [term, courses] of Object.entries(terms)){
            if (Object.keys(courses).some(coursecode => coursecode==code ))
                return Number(term);
        }
        return Number(0);
    }

    getPendingCodesByCurriculum(
        major: string,
        newCurr: boolean,
        maxTermToConsider: number,
        completedCodes: string[]
    ): Record<string, string[]> {
        const pending = Array.from(new Set(this.getPendingCodes(
            major,
            newCurr,
            maxTermToConsider,
            completedCodes
        )));
        const byCur = {"NEW": [], "OLD": []} as Record<string, string[]>;
        const oldcur = Object.assign({}, ...this.getMandatoryCourseDicts(major,false,11));
        const newcur = Object.assign({}, ...this.getMandatoryCourseDicts(major, true, 11));
        // const oldcur = this.getMandatoryCourses(major, true);
        pending.forEach(code => {
            //if (code.includes("CIN"))
            if(newcur[code] && !oldcur[code]){
                byCur['NEW'].push(code);
            }
            else if(!newcur[code] && oldcur[code]){
                byCur['OLD'].push(code);
            }
            else {
                //suppose it's available on both
                byCur['OLD'].push(code);
                byCur['NEW'].push(code);
            }
        })
        for (const k of Object.keys(byCur)) {
            const filteredCourses = [];
            for (let i = 0; i < byCur[k].length; i++) {
                const v = byCur[k][i];
                if (this.getTermOfCode(major, newCurr, v) <= maxTermToConsider) {
                    filteredCourses.push(v);
                }
            }
            byCur[k] = filteredCourses;
        }
        return byCur;

    }

    getPendingCourses(major:string, newCurr:boolean, maxTerm:number, completedCodes: string[]){
        const pending = this.getPendingCodesByCurriculum(major, newCurr, maxTerm, completedCodes);
        const pendingCourses: Record<string, PendingCourse[]> = {};
        for (const [key, value] of Object.entries(pending)) {
            pendingCourses[key] = value.map((code) => {return { 
                name: (this.code_equivalences[code]) ? this.code_equivalences[code].name : `FAILED: ${code}`,
                code: code,
                term: this.getTermOfCode(major, newCurr, code),
                blockedCourseCodes: this.mandatoryGraphs[major].g[code],
            } as PendingCourse});

        }
        return pendingCourses;
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
                const oldCompletedEquivalencies = old_codes.every(code => completed_temp.has(code));
                const newCompletedEquivalencies = new_codes.every(code => completed_temp.has(code));

                if (oldCompletedEquivalencies) {
                    for (const newCode of new_codes) {
                        if (!completed_temp.has(newCode)) {
                            completed_temp.add(newCode);
                            changed = true;
                        }
                    }
                }

                if (newCompletedEquivalencies) {
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
