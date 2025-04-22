import React from 'react';
import { CourseDisplayInfo } from '@/api';
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseCode, getCourseCredits, getCourseCH, getCourseTypeStyle } from '@/utils/courseUtils';
import { Badge } from './ui/badge';

interface CourseItemProps {
  course: CourseDisplayInfo;
  isSelected: boolean;
  onToggleCourse: (id: number) => void;
  hasToggle?: boolean; // Optional prop to indicate if the course has a toggle button
  oldCurriculum?: boolean; // Optional prop to indicate if the course should be greyed out
  showProfessor?:boolean;
  hasNoEquivalence?: boolean;
}

const CourseItem: React.FC<CourseItemProps> = ({ course, isSelected, onToggleCourse, oldCurriculum= false, hasToggle = true, showProfessor = true, hasNoEquivalence = false }) => {
  const courseCode = getCourseCode(course);
  const courseCredits = getCourseCredits(course);
  const courseCH = getCourseCH(course);
  const typeStyle = getCourseTypeStyle(courseCode);
  const professor=course.professor;

  const isStyleSelected = isSelected;

  return (
    <div 
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 border-l-4 w-full", 
        typeStyle.borderL,
        isSelected 
          ? `${typeStyle.bg}` 
          : "bg-transparent hover:bg-muted/50",
            isStyleSelected ? 'bg-othercurriculum' : '' 
      )}
    >
      {/* Main Content Area */}
      <div className="flex-1 space-y-0.5 overflow-hidden mr-1">
        {/* Combined Code and Name Line */}
        <div className="flex items-center gap-2 justify-between"> 
          <div className="flex items-center gap-2">
            {/* Code Callout */}
            <span className={cn(
              "text-xs font-mono px-1.5 py-1 rounded",
              isSelected ? `${typeStyle.bg} border ${typeStyle.border}` : "bg-muted"
            )}>
              {courseCode}
            </span>
            {/* Course Name */}
            <h6 className={cn(
              "font-medium text-sm leading-tight truncate",
              !isSelected && "text-muted-foreground"
            )}>
              {course.name}
            </h6>
          </div>
          <div className='flex gap-2'>

            {oldCurriculum && <span className={cn(
              "text-xs font-mono px-1.5 py-1 rounded",
              "bg-yellow-100"
            )}>
              Grade antiga
            </span>}


            {hasNoEquivalence &&<span className={cn(
              "text-xs font-mono px-1.5 py-1 rounded",
              "bg-red-400"
            )}>
              Sem equivalência
            </span>}
          </div>
        </div>
        <div className="flex gap-2">
        {/* Professor */}
        {showProfessor && 
        <p className="text-xs text-muted-foreground max-w-[200px] truncate">
         ({professor}) -
        </p> 
        }
        {/* CH */
        (courseCH &&
        <p className="text-xs text-muted-foreground">
          {courseCH} h
        </p>) || ''
        }
        {/* Credits */ (courseCredits &&
        <p className="text-xs text-muted-foreground">
          {courseCredits} créditos
        </p>) || ""
        }
        </div>
      </div>

      {/* Selection Toggle Button */}
      {hasToggle &&
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-7 w-7 flex-shrink-0 rounded-full ml-4", 
            isSelected ? "text-red-500 hover:bg-red-100 hover:text-red-600" : "text-muted-foreground hover:text-primary hover:bg-muted" 
          )}
          onClick={(e) => {
            e.stopPropagation(); 
            onToggleCourse(course.id);
          }}
        >
          {isSelected 
            ? <CircleX size={16} />
            : <CheckCircle size={16} />
          }
          <span className="sr-only">{isSelected ? "Remover" : "Adicionar"}</span>
        </Button>
      }
    </div>
  );
};

export default CourseItem;
