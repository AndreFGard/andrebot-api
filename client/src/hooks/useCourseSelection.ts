import { useState, useEffect } from 'react';
import { CourseSelectionManager, CourseDisplayInfo } from '@/api';
import { coursesplaceholder } from '@/api';

export function useCourseSelection(initialSelection: number[] = []) {
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set(initialSelection));
  const [courseManager] = useState<CourseSelectionManager>(new CourseSelectionManager(initialSelection));
  
  // Toggle a single course
  const toggleCourse = (courseId: number) => {
    courseManager.toggle(courseId);
    setSelectedCourseIds(new Set(courseManager.getSelectedCourseIds()));
  };
  
  // Add all courses from a term
  const addCoursesByTerm = (major: string, term: number) => {
    const coursesInTerm = coursesplaceholder[major]?.[term] ?? [];
    coursesInTerm.forEach((course) => {
      if (!courseManager.isin(course.id)) {
        courseManager.toggle(course.id);
      }
    });
    setSelectedCourseIds(new Set(courseManager.getSelectedCourseIds()));
  };
  
  // Get courses for a specific period
  const getCoursesForPeriod = (major: string, period: number): CourseDisplayInfo[] => {
    return coursesplaceholder[major]?.[period] ?? [];
  };
  
  return {
    selectedCourseIds,
    toggleCourse,
    addCoursesByTerm,
    getCoursesForPeriod,
    resetSelection: () => {
      courseManager.setSelectedCourseIds([]);
      setSelectedCourseIds(new Set());
    }
  };
}
