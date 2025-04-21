import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MajorChooser from './majorChooser';
import { useCourseSelection } from '@/hooks/useCourseSelection';

import PeriodCard from './PeriodCard';
import VisualizationTab from './VisualizationTab';
import { CourseDisplayInfoCtx } from '@/CourseDisplayInfoCtx';
interface CourseHistoryProps {
  completedCourseIds: Set<number>;
  setCompletedCourseIds: (completedCourseIds: Set<number>) => void;
}
const CourseHistory = ({completedCourseIds, setCompletedCourseIds}:CourseHistoryProps) => {
  const [major, setMajor] = React.useState("CC");
  const courses = useContext(CourseDisplayInfoCtx)

  const { 
    toggleCourse, 
    addCoursesByTerm, 
    getCoursesForPeriod 
  } = useCourseSelection({selectedCourseIds:completedCourseIds, setSelectedCourseIds:setCompletedCourseIds});

  


  // Get all periods for the selected major
  const allPeriods = React.useMemo(() => {
    if (courses[major]) {
      return Array.from(new Set(Object.keys(courses[major]).map(Number))).sort((a, b) => a - b);
    }
    return [];
  }, [major, courses]);
  
  // Track expanded/collapsed state of each period
  const [expandedPeriods, setExpandedPeriods] = useState<Record<number, boolean>>(() => {
    const initialState: Record<number, boolean> = {};
    if (allPeriods.length > 0) {
      initialState[allPeriods[0]] = true; // Expand the first period by default
    }
    return initialState;
  });

  // Update expanded state when major changes
  useEffect(() => {
    setExpandedPeriods(prev => {
      const newState: Record<number, boolean> = {};
      if (allPeriods.length > 0) {
        newState[allPeriods[0]] = prev[allPeriods[0]] ?? true;
        allPeriods.slice(1).forEach(p => {
          newState[p] = prev[p] ?? false;
        });
      }
      return newState;
    });
  }, [allPeriods]);
  
  // Toggle period expansion
  const togglePeriod = (period: number) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }));
  };

  // Wrapper functions that include major
  const handleCourseToggle = (courseId: number) => toggleCourse(courseId);
  const handleAddAllFromTerm = (term: number) => addCoursesByTerm(major, term);
  const getCoursesForPeriodWithMajor = (period: number) => getCoursesForPeriod(major, period);

  const newCurriculumStrings = ["Não", "Sim"];
  const [newCurriculum, setNewCurriculum] = useState<string>("Sim");
  return (
    <>
      {/* Major Selection */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Selecione seu Curso</h2>
          <MajorChooser major={major} onMajorChange={setMajor} />
          <h2 className="text-2xl font-bold my-4">Você está na grade nova?</h2>
          <MajorChooser major={newCurriculum} onMajorChange={setNewCurriculum} majors={newCurriculumStrings} />
        </CardContent>
      </Card>

      {/* Course History */}
      <Card>
        <CardHeader>
          <CardTitle><h3 className="text-2xl font-bold my-4">Disciplinas Cursadas</h3></CardTitle>
          <CardDescription className='text-lg'>Adicione disciplinas obrigatórias que você já cursou, 
            para calcular o seu progresso e 
            receber recomendações de disciplinas pendentes abaixo.
            Disciplinas equivalentes de outros currículos estarão acizentadas. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          
          <Tabs defaultValue="periodo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted p-1 rounded-lg h-auto"> 
              <TabsTrigger 
                value="periodo" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=inactive]:bg-transparent"
              >
                Por Periodo
              </TabsTrigger>
              <TabsTrigger 
                value="visualizacao" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=inactive]:bg-transparent"
              >
                Visualização
              </TabsTrigger>
            </TabsList>
            
            {/* Period-based view */}
            <TabsContent value="periodo" className="w-full">
              <div className="space-y-3">
                {allPeriods.map((period) => (
                  <PeriodCard
                    key={period}
                    period={period}
                    courses={getCoursesForPeriodWithMajor(period)}
                    selectedCourseIds={completedCourseIds}
                    isExpanded={expandedPeriods[period] || false}
                    onToggleExpand={togglePeriod}
                    onToggleCourse={handleCourseToggle}
                    onAddAllFromPeriod={handleAddAllFromTerm}
                    isNewCurriculum={newCurriculumStrings.indexOf(newCurriculum) === 1}
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Visualization tab */}
            <TabsContent value="visualizacao">
              <VisualizationTab
                major={major}
                selectedCourseIds={completedCourseIds}
                allPeriods={allPeriods}
                coursesData={courses}
                onCourseToggle={handleCourseToggle}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default CourseHistory;
