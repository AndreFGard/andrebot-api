import React from 'react';
import { CourseDisplayInfo } from '@/api';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { calculatePeriodProgress } from '@/utils/courseUtils';
import CourseItem from './CourseItem';

interface PeriodCardProps {
  period: number;
  courses: CourseDisplayInfo[];
  selectedCourseIds: Set<number>;
  isExpanded: boolean;
  onToggleExpand: (period: number) => void;
  onToggleCourse: (id: number) => void;
  onAddAllFromPeriod: (period: number) => void;
  isNewCurriculum?: boolean;
  hasToggle?:boolean;
  warnNoEquivalence?:boolean;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ 
  period, 
  courses, 
  selectedCourseIds, 
  isExpanded, 
  onToggleExpand, 
  onToggleCourse, 
  onAddAllFromPeriod,
  isNewCurriculum,
  hasToggle=true,
  warnNoEquivalence = false
}) => {
  const progress = calculatePeriodProgress(courses, selectedCourseIds);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
        <div className="flex items-center gap-3">
          <div onClick={() => onToggleExpand(period)} className="cursor-pointer p-1 -m-1">
            {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>
          <h5 className="text-base font-medium leading-none tracking-tight">{period}º Período</h5>
        </div>
        {hasToggle && (progress.isComplete ? (
          <span className="ml-4 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Completo</span>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddAllFromPeriod(period);
            }}
          >
            Adicionar Todas
          </Button>
        ))}
      </div>

      {/* Progress Info and Bar (Always Visible) */}
      <div className="px-4 pb-3 text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Progresso: {progress.completed}/{progress.total} disciplinas</span>
          <span>{progress.credits}/{progress.totalCredits} créditos</span>
        </div>
        <Progress value={progress.percentage} className="h-1.5 [&>div]:bg-black" />
      </div>

      {/* Expanded Content */}
      {isExpanded && courses.length > 0 && (
        <div className="px-4 pb-4 border-t">
          <div className="space-y-1.5 pt-3">
            {courses.map((course) => (
              <CourseItem 
                key={course.id}
                course={course}
                isSelected={selectedCourseIds.has(course.id)}
                onToggleCourse={onToggleCourse}
                oldCurriculum={(!course.isNewCurriculum)}
                hasNoEquivalence={warnNoEquivalence && course.hasEquivalence === false}
                hasToggle={hasToggle}
                showProfessor={false}
              />
            ))}
          </div>
        </div>
      )}
      {isExpanded && courses.length === 0 && (
        <div className="px-4 pb-4 border-t">
          <div className="text-muted-foreground text-center py-3 text-sm">
            Nenhuma disciplina encontrada para este período.
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodCard;
