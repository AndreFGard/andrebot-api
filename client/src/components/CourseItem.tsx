import React from 'react';
import { CourseDisplayInfo } from '@/api';
import { Button } from "@/components/ui/button";
import { CheckCircle, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseCode, getCourseCredits, getCourseTypeStyle } from '@/utils/courseUtils';

interface CourseItemProps {
  course: CourseDisplayInfo;
  isSelected: boolean;
  onToggleCourse: (id: number) => void;
}

const CourseItem: React.FC<CourseItemProps> = ({ course, isSelected, onToggleCourse }) => {
  const courseCode = getCourseCode(course);
  const courseCredits = getCourseCredits(course);
  const typeStyle = getCourseTypeStyle(courseCode);

  return (
    <div 
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 border-l-4", 
        typeStyle.borderL,
        isSelected 
          ? `${typeStyle.bg}` 
          : "bg-transparent hover:bg-muted/50"
      )}
    >
      {/* Main Content Area */}
      <div className="flex-1 space-y-0.5">
        {/* Combined Code and Name Line */}
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
            "font-medium text-sm leading-tight",
            !isSelected && "text-muted-foreground" 
          )}>
            {course.name}
          </h6>
        </div>
        {/* Credits */}
        <p className="text-xs text-muted-foreground">
          {courseCredits} créditos
        </p>
      </div>

      {/* Selection Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "h-7 w-7 flex-shrink-0 rounded-full",
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
    </div>
  );
};

export default CourseItem;
