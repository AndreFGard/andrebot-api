import { useState, useContext } from 'react';
import { CourseSelectionManager, CourseDisplayInfo } from '@/api';
import { CourseDisplayInfoCtx } from '@/CourseDisplayInfoCtx';
import { ClassDisplayInfoCtx } from '@/CourseClassInfoProvider';

export function useCourseSelection(initialSelection: number[] = [], uniqueByClassCodes:boolean=false) {
  console.log(`uniqueByClassCodes is ${uniqueByClassCodes}`)
  const courses = useContext(CourseDisplayInfoCtx);
  const classInfo = useContext(ClassDisplayInfoCtx);

  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set(initialSelection));
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
  const getCoursesForPeriodNotUnique = (major: string, period: number): CourseDisplayInfo[] => {
    return courses[major]?.[period] ?? [];
  };
  
  const getCoursesForPeriodUnique = (major: string, period: number): CourseDisplayInfo[] => {
    return classInfo[major]?.[period]  ?? [];
  }

  
  return {
    selectedCourseIds,
    toggleCourse,
    addCoursesByTerm,
    getCoursesForPeriod: uniqueByClassCodes ? getCoursesForPeriodUnique : getCoursesForPeriodNotUnique,
    resetSelection: () => {
      courseManager.setSelectedCourseIds([]);
      setSelectedCourseIds(new Set());
    }
  };
}
