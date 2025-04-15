import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { CourseDisplayInfo } from '@/api';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Helper function to check prerequisites (for VisualizationTab)
// Consider moving this to a shared utils file if used elsewhere
const arePrerequisitesCompleted = (course: CourseDisplayInfo, completedIds: Set<number>): boolean => {
  if (!course.prerequisites || course.prerequisites.length === 0) return true;
  return course.prerequisites.every((prereqId) => completedIds.has(prereqId));
};

interface CarouselCardProps {
  period: number;
  periodCourses: CourseDisplayInfo[];
  selectedCourseIds: Set<number>;
  isExpanded: boolean;
  cardView: "completed" | "pending" | undefined;
  onToggleExpansion: (period: number) => void;
  onSetView: (period: number, view: "completed" | "pending") => void;
}

const CarouselCard: React.FC<CarouselCardProps> = ({
  period,
  periodCourses,
  selectedCourseIds,
  isExpanded,
  cardView,
  onToggleExpansion,
  onSetView,
}) => {
  const completedInPeriod = periodCourses.filter((course) =>
    selectedCourseIds.has(course.id)
  ).length;
  const pendingInPeriod = periodCourses.length - completedInPeriod;
  const periodCompletionPercentage = periodCourses.length > 0
    ? Math.round((completedInPeriod / periodCourses.length) * 100)
    : 0;

  return (
    <div className="p-1"> {/* h-full estava gerando o bug do expand */}
      <Card
        className={cn(
          "h-full transition-all duration-300 flex flex-col",
          isExpanded && "border-primary ring-2 ring-primary/50",
          isExpanded ? "scale-100" : "hover:scale-[1.02]",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-base md:text-lg">
            <span>{period}º Período</span>
            <Badge
              className={cn(
                "border",
                periodCompletionPercentage === 100
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              )}
            >
              {periodCompletionPercentage}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 flex-grow">
          <div className="space-y-4">
            <Progress value={periodCompletionPercentage} className="h-2" />

            <div className="grid grid-cols-2 gap-2 text-center">
              <div
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-colors border",
                  isExpanded && cardView === "completed"
                    ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                    : "hover:bg-muted",
                )}
                onClick={() => isExpanded && onSetView(period, "completed")}
              >
                <div className="flex justify-center mb-1">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-xs md:text-sm font-medium">Concluídas</div>
                <div className="text-xl md:text-2xl font-bold">{completedInPeriod}</div>
              </div>

              <div
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-colors border",
                  isExpanded && cardView === "pending"
                    ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700"
                    : "hover:bg-muted",
                )}
                onClick={() => isExpanded && onSetView(period, "pending")}
              >
                <div className="flex justify-center mb-1">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-xs md:text-sm font-medium">Pendentes</div>
                <div className="text-xl md:text-2xl font-bold">{pendingInPeriod}</div>
              </div>
            </div>

            {isExpanded && (
              <div className="pt-1 border-t">
                <h5 className="text-sm font-medium mb-2 text-center py-2">
                  {cardView === "completed" ? "Disciplinas Concluídas" : "Disciplinas Pendentes"}
                </h5>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1 text-xs md:text-sm">
                  {cardView === "completed"
                    ? periodCourses
                        .filter((course) => selectedCourseIds.has(course.id))
                        .map((course) => (
                          <div
                            key={course.id}
                            className="flex items-start gap-2 p-1.5 rounded-md bg-green-50 dark:bg-green-900/10"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium leading-tight">{course.name}</div>
                            </div>
                          </div>
                        ))
                    : periodCourses
                        .filter((course) => !selectedCourseIds.has(course.id))
                        .map((course) => {
                          const allPrerequisitesMet = arePrerequisitesCompleted(course, selectedCourseIds);
                          return (
                            <div
                              key={course.id}
                              className={cn(
                                "flex items-start gap-2 p-1.5 rounded-md",
                                allPrerequisitesMet
                                  ? "bg-amber-50 dark:bg-amber-900/10"
                                  : "bg-red-50 dark:bg-red-900/10",
                              )}
                            >
                              {allPrerequisitesMet ? (
                                <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="font-medium leading-tight">{course.name}</div>
                                {!allPrerequisitesMet && course.prerequisites && course.prerequisites.length > 0 && (
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                    Pré-requisitos pendentes
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                  {/* Empty state messages */}
                  {cardView === "completed" &&
                    periodCourses.filter((course) => selectedCourseIds.has(course.id))
                      .length === 0 && (
                      <div className="text-xs text-muted-foreground italic text-center py-2">
                        Nenhuma disciplina concluída neste período.
                      </div>
                    )}
                  {cardView === "pending" &&
                    periodCourses.filter((course) => !selectedCourseIds.has(course.id))
                      .length === 0 && (
                      <div className="text-xs text-muted-foreground italic text-center py-2">
                        Todas as disciplinas deste período foram concluídas.
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-1 px-3">
          <Button
            size="sm"
            className={cn(
              "w-full",
              isExpanded
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
            )}
            onClick={() => onToggleExpansion(period)}
          >
            {isExpanded ? "Recolher" : "Ver Disciplinas"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CarouselCard;
