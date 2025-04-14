import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, Target } from "lucide-react";
import ClassChooser from './classChooser';
import TermChooser from './termChooser';
import { CourseDisplayInfo } from '@/api';
import { getCourseCredits } from '@/utils/courseUtils';

interface VisualizationTabProps {
  major: string;
  selectedCourseIds: Set<number>;
  selectedTerms: Set<number>;
  allPeriods: number[];
  coursesData: Record<string, Record<number, CourseDisplayInfo[]>>;
  onMajorChange: (major: string) => void;
  onCourseToggle: (id: number) => void;
  onUpdateSelectedTerms: (terms: Set<number>) => void;
  onAddAllFromTerm: (term: number) => void;
}

const VisualizationTab: React.FC<VisualizationTabProps> = ({
  major,
  selectedCourseIds,
  selectedTerms,
  allPeriods,
  coursesData,
  onMajorChange,
  onCourseToggle,
  onUpdateSelectedTerms,
  onAddAllFromTerm
}) => {
  // Calculate statistics for the cards
  const { totalCourses, completedCourses, totalCredits, completedCredits, completionPercentage } = useMemo(() => {
    // Flatten all courses for this major
    const allCourses: CourseDisplayInfo[] = [];
    Object.values(coursesData[major] || {}).forEach(courses => {
      allCourses.push(...courses);
    });
    
    const completed = allCourses.filter(course => selectedCourseIds.has(course.id));
    
    // Calculate credits
    let totalCreditsValue = 0;
    let completedCreditsValue = 0;
    
    allCourses.forEach(course => {
      const credits = getCourseCredits(course);
      totalCreditsValue += credits;
      
      if (selectedCourseIds.has(course.id)) {
        completedCreditsValue += credits;
      }
    });
    
    const percentage = totalCreditsValue > 0 ? (completedCreditsValue / totalCreditsValue) * 100 : 0;
    
    return {
      totalCourses: allCourses.length,
      completedCourses: completed,
      totalCredits: totalCreditsValue,
      completedCredits: completedCreditsValue,
      completionPercentage: percentage
    };
  }, [coursesData, major, selectedCourseIds]);

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-muted-foreground">Disciplinas Cursadas</p>
                <h3 className="text-2xl font-bold mt-1">
                  {completedCourses.length}/{totalCourses}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" /> 
              </div>
            </div>
            <Progress value={totalCourses > 0 ? (completedCourses.length / totalCourses) * 100 : 0} className="h-2 mt-4 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-muted-foreground">Créditos Completados</p>
                <h3 className="text-2xl font-bold mt-1">
                  {completedCredits}/{totalCredits}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"> 
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" /> 
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2 mt-4 [&>div]:bg-green-500" /> 
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200"> 
          <CardContent className="pt-3"> 
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-muted-foreground">Progresso do Curso</p> 
                <h3 className="text-2xl font-bold mt-1">
                  {completionPercentage.toFixed(0)}% {/* Formatted percentage */}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"> {/* Added icon container */}
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" /> 
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2 mt-4 [&>div]:bg-purple-500" /> 
          </CardContent>
        </Card>
      </div>

      {/* Main content card */}
      <Card className='w-full shadow-sm'> 
        <CardContent className='py-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'> 
            <div className='border rounded-md p-4'> 
              <h4 className="text-lg font-semibold mb-3">Selecionar Disciplinas</h4> {/* Added title */}
              <ClassChooser
                major={major}
                onMajorChange={onMajorChange}
                onCourseToggle={onCourseToggle}
                selectedCourseIds={selectedCourseIds}
              />
            </div>
            <div className='border rounded-md p-4'> 
               <h4 className="text-lg font-semibold mb-3">Selecionar Período</h4> 
              <TermChooser
                terms={new Set(allPeriods)}
                selectedTerms={selectedTerms}
                setSelectedTerms={onUpdateSelectedTerms}
                multipleChoice={false}
              />
              <ul className="space-y-1 my-4 max-h-48 overflow-y-auto pr-2"> 
                {Array.from(selectedTerms).map((term: number) =>
                  (coursesData[major]?.[term] ?? []).map((course: { id: number; name: string }) => (
                    <li
                      key={course.id}
                      className="flex flex-row justify-between py-1.5 px-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-150 cursor-pointer text-sm" 
                    >
                      <span className="text-gray-800">{course.name}</span>
                    </li>
                  ))
                )}
                 {Array.from(selectedTerms).length > 0 && (coursesData[major]?.[Array.from(selectedTerms)[0]] ?? []).length === 0 && (
                   <li className="text-sm text-muted-foreground text-center py-2">Nenhuma disciplina neste período.</li>
                 )}
              </ul>
              <Button
                onClick={() => {
                  const term = Array.from(selectedTerms)[0];
                  if (term !== undefined) {
                    onAddAllFromTerm(term);
                  }
                }}
                disabled={selectedTerms.size === 0 || (coursesData[major]?.[Array.from(selectedTerms)[0]] ?? []).length === 0} // Disable if no courses in term
                size="sm" // Smaller button
              >
                Adicionar Todas do Período
              </Button>
            </div>
          </div>
           <p className="mt-4 text-sm text-muted-foreground">Disciplinas selecionadas: {Array.from(selectedCourseIds).join(", ")}</p> 
        </CardContent>
      </Card>
    </>
  );
};

export default VisualizationTab;
