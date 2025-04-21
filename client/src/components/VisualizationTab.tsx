import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, Target, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CourseDisplayInfo } from '@/api';
import { getCourseCredits } from '@/utils/courseUtils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import CarouselCard from './carouselCard';

interface VisualizationTabProps {
  major: string;
  selectedCourseIds: Set<number>;
  allPeriods: number[];
  coursesData: Record<string, Record<number, CourseDisplayInfo[]>>;
  onCourseToggle: (id: number) => void;
}

// Helper function to check prerequisites (assuming CourseDisplayInfo has prerequisites)
// todo ajustar os pre-requisitos em CourseDisplayInfo

const VisualizationTab: React.FC<VisualizationTabProps> = ({
  major,
  selectedCourseIds,
  allPeriods,
  coursesData,
  onCourseToggle,
}) => {
  // Statistics calculation remains the same
  const { totalCourses, completedCourses: completedCourseObjects, totalCredits, completedCredits, completionPercentage } = useMemo(() => {
    const allCoursesForMajor: CourseDisplayInfo[] = [];
    // Ensure coursesData[major] exists before trying to access its values
    if (coursesData && coursesData[major]) {
        Object.values(coursesData[major]).forEach(courses => {
            if (Array.isArray(courses)) {
                allCoursesForMajor.push(...courses);
            }
        });
    }

    const completed = allCoursesForMajor.filter(course => selectedCourseIds.has(course.id));

    let totalCreditsValue = 0;
    let completedCreditsValue = 0;

    allCoursesForMajor.forEach(course => {
      const credits = getCourseCredits(course); // Use existing utility
      totalCreditsValue += credits;

      if (selectedCourseIds.has(course.id)) {
        completedCreditsValue += credits;
      }
    });

    const percentage = totalCreditsValue > 0 ? (completedCreditsValue / totalCreditsValue) * 100 : 0;

    return {
      totalCourses: allCoursesForMajor.length,
      completedCourses: completed, // Array of completed course objects
      totalCredits: totalCreditsValue,
      completedCredits: completedCreditsValue,
      completionPercentage: percentage
    };
  }, [coursesData, major, selectedCourseIds]);

  // use a state object mapping a period to its own expansion state.
  const [expandedCards, setExpandedCards] = useState<{
    [period: number]: { expanded: boolean; view: "completed" | "pending" };
  }>({});

  // Toggle a card's expansion status – if opening, default view is "pending" and collapse all other cards.
  const toggleCardExpansion = (period: number) => {
    setExpandedCards((prev) => {
      const isCurrentlyExpanded = prev[period]?.expanded;

      // If clicking the already expanded card, collapse it and return empty state
      if (isCurrentlyExpanded) {
        return {}; // Collapse all
      }

      // If clicking a collapsed card, expand it and ensure all others are collapsed
      const newState: typeof prev = {}; // Start with an empty state
      newState[period] = { // Set the clicked card to expanded
        expanded: true,
        view: "pending", // Default view when expanding
      };
      return newState; // Return the state with only the clicked card expanded
    });
  };

  // Update the view for a card
  const setCardView = (period: number, view: "completed" | "pending") => {
    setExpandedCards((prev) => ({
      ...prev,
      [period]: {
        expanded: prev[period]?.expanded || false,
        view,
      },
    }));
  };

  // Use allPeriods derived from props to ensure correct order and inclusion
  const periods = allPeriods.sort((a, b) => a - b);
  const StatisticCardClassName = 'shadow-sm hover:shadow-md transition-shadow duration-200 min-w-70 md:w-1/3 snap-start';
  return (
    <>
      {/* Statistics Cards */}
      <div className="flex gap-4 mb-6 overflow-scroll snap-start">
         {/* Card 1: Disciplinas Cursadas */}
         <Card className={StatisticCardClassName}>
           <CardContent className="pt-2">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-medium text-muted-foreground">Disciplinas Cursadas</p>
                 <h3 className="text-2xl font-bold mt-1">
                   {completedCourseObjects.length}/{totalCourses}
                 </h3>
               </div>
               <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                 <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
               </div>
             </div>
             <Progress value={totalCourses > 0 ? (completedCourseObjects.length / totalCourses) * 100 : 0} className="h-2 mt-4 [&>div]:bg-blue-500" />
           </CardContent>
         </Card>

         {/* Card 2: Créditos Completados */}
         <Card className={StatisticCardClassName}>
           <CardContent className="pt-2">
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

         {/* Card 3: Progresso do Curso */}
         <Card className={StatisticCardClassName}>
           <CardContent className="pt-2">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-lg font-medium text-muted-foreground">Progresso do Curso</p>
                 <h3 className="text-2xl font-bold mt-1">
                   {completionPercentage.toFixed(0)}%
                 </h3>
               </div>
               <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                 <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
               </div>
             </div>
             <Progress value={completionPercentage} className="h-2 mt-4 [&>div]:bg-purple-500" />
           </CardContent>
         </Card>
      </div>

      {/* Main content card with a carousel */}
      <Card className='w-full shadow-sm'>
        <CardContent className='py-1 md:p-6'>
          <h4 className="text-lg font-semibold mb-4">Visualização por Período</h4>
          
          <div className="space-y-6">
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {periods.map((period) => {
                  // Get courses for the current period directly from coursesData
                  const periodCourses = coursesData?.[major]?.[period] ?? [];
                  const cardState = expandedCards[period];
                  const isExpanded = cardState?.expanded ?? false; // Default to false if undefined
                  const cardView = cardState?.view;

                  return (
                    <CarouselItem key={period} className="pl-2 md:pl-4 pb-2 md:pb-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 self-stretch">
                      {/* Use the CarouselCard component */}
                      <CarouselCard
                        period={period}
                        periodCourses={periodCourses}
                        selectedCourseIds={selectedCourseIds}
                        isExpanded={isExpanded}
                        cardView={cardView}
                        onToggleExpansion={toggleCardExpansion}
                        onSetView={setCardView}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="hidden md:flex items-center justify-center gap-2 mt-4">
                <CarouselPrevious className="static transform-none" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>

            {/* Legend */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 pt-4 border-t">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs md:text-sm">Concluída</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xs md:text-sm">Pendente (Disponível)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs md:text-sm">Pendente (Bloqueada)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VisualizationTab;
