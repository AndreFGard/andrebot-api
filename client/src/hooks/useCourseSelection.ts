import { useState, useContext } from 'react';
import { CourseSelectionManager, CourseDisplayInfo } from '@/api';
import { CourseDisplayInfoCtx } from '@/CourseDisplayInfoCtx';
interface useCourseSelectionProps {
  selectedCourseIds: Set<number>;
  setSelectedCourseIds: (selectedCourseIds: Set<number>) => void;
  initialSelection?: number[];
}
export function useCourseSelection({initialSelection=[], selectedCourseIds, setSelectedCourseIds}: useCourseSelectionProps) {
  const courses = useContext(CourseDisplayInfoCtx);

  const [courseManager] = useState<CourseSelectionManager>(new CourseSelectionManager(initialSelection));
  
  // Toggle a single course
  const toggleCourse = (courseId: number) => {
    courseManager.toggle(courseId);
    setSelectedCourseIds(new Set(courseManager.getSelectedCourseIds()));
  };
  
  // Add all courses from a term
  const addCoursesByTerm = (major: string, term: number) => {
    const coursesInTerm = courses[major]?.[term] ?? [];
    coursesInTerm.forEach((course) => {
      if (!courseManager.isin(course.id)) {
        courseManager.toggle(course.id);
      }
    });
    setSelectedCourseIds(new Set(courseManager.getSelectedCourseIds()));
  };
  
  // Get courses for a specific period
  const getCoursesForPeriod = (major: string, period: number): CourseDisplayInfo[] => {
    return courses[major]?.[period] ?? [];
  };
  
  return {
    selectedCourseIds,
    setSelectedCourseIds,
    toggleCourse,
    addCoursesByTerm,
    getCoursesForPeriod,
    resetSelection: () => {
      courseManager.setSelectedCourseIds([]);
      setSelectedCourseIds(new Set());
    }
  };
}
