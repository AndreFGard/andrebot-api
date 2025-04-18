import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MajorChooser from './majorChooser';
import { useCourseSelection } from '@/hooks/useCourseSelection';

import PeriodCard from './PeriodCard';
import VisualizationTab from './VisualizationTab';
import { CourseDisplayInfoCtx } from '@/CourseDisplayInfoCtx';
import { CourseDisplayInfo } from '@/api';
interface CourseHistoryProps {
  completedCourseIds: Set<number>;
  setCompletedCourseIds: (completedCourseIds: Set<number>) => void;
}
const CourseHistory = ({completedCourseIds, setCompletedCourseIds}:CourseHistoryProps) => {
  
  const [major, setMajor] = React.useState("CC");
  const [selectedTerms, setSelectedTerms] = React.useState<Set<number>>(new Set([1]));
  const courses = useContext(CourseDisplayInfoCtx)

  const { 
    selectedCourseIds, 
    toggleCourse, 
    addCoursesByTerm, 
    getCoursesForPeriod 
  } = useCourseSelection();

  completedCourseIds;

  useEffect(() => {
    setCompletedCourseIds(new Set(Array.from(selectedCourseIds)));
  }, [selectedCourseIds, setCompletedCourseIds]);
  
  // Prevent automatic scroll on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


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
  const [newCurriculum, setNewCurriculum] = useState<string>("Não");
  return (
    <>
      {/* Major Selection */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Selecione seu Curso</h2>
          <MajorChooser major={major} onMajorChange={setMajor} />
          <h2 className="text-2xl font-bold my-4">Grade nova?</h2>
          <MajorChooser major={newCurriculum} onMajorChange={setNewCurriculum} majors={newCurriculumStrings} />
        </CardContent>
      </Card>

      {/* Course History */}
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold my-4">Disciplinas Cursadas</h2>
          
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
                    selectedCourseIds={selectedCourseIds}
                    isExpanded={expandedPeriods[period] || false}
                    onToggleExpand={togglePeriod}
                    onToggleCourse={handleCourseToggle}
                    onAddAllFromPeriod={handleAddAllFromTerm}
                    isNewCurriculum={newCurriculumStrings.indexOf(newCurriculum) === 1}
                    getIdentifier={(course: CourseDisplayInfo) => course.code}
                  />
                ))}
              </div>
            </TabsContent>
            
            {/* Visualization tab */}
            <TabsContent value="visualizacao">
              <VisualizationTab
                major={major}
                selectedCourseIds={selectedCourseIds}
                selectedTerms={selectedTerms}
                allPeriods={allPeriods}
                coursesData={courses}
                onMajorChange={setMajor}
                onCourseToggle={handleCourseToggle}
                onUpdateSelectedTerms={setSelectedTerms}
                onAddAllFromTerm={handleAddAllFromTerm}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default CourseHistory;
