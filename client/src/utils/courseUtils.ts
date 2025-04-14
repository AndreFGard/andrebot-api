import { CourseDisplayInfo } from '@/api';

// Define an array of fallback colors for other course types 
// todo definir as cores baseado nas classificações da grade nova
export const fallbackCourseColors: { bg: string; text: string; border: string; borderL: string }[] = [
  { bg: "bg-pink-50 dark:bg-pink-950/20", text: "text-pink-800", border: "border-pink-300", borderL: "border-l-pink-500" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/20", text: "text-indigo-800", border: "border-indigo-300", borderL: "border-l-indigo-500" },
  { bg: "bg-lime-50 dark:bg-lime-950/20", text: "text-lime-800", border: "border-lime-300", borderL: "border-l-lime-500" },
  { bg: "bg-orange-50 dark:bg-orange-950/20", text: "text-orange-800", border: "border-orange-300", borderL: "border-l-orange-500" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/20", text: "text-cyan-800", border: "border-cyan-300", borderL: "border-l-cyan-500" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-800", border: "border-emerald-300", borderL: "border-l-emerald-500" },
];

// Simple hash function to get a consistent index from the course code
export const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getCourseTypeStyle = (code: string) => {
  // Otherwise, use the fallback colors based on a hash of the code
  const hash = hashCode(code);
  const index = hash % fallbackCourseColors.length;
  return fallbackCourseColors[index];
};

// todo add a course code and course credits in the backend so the frontend has the info to handle
// Function to generate a fictitious code
export const getCourseCode = (course: CourseDisplayInfo): string => {
  // Use existing code if available, otherwise generate one based on ID/name
  return `${course.name.substring(0,3).toUpperCase()}${String(course.id).padStart(3, '0')}`;
};

// Function to get fictitious credits if needed
export const getCourseCredits = (course: CourseDisplayInfo): number => {
  return 4;
  //return course.credits ?? 4; // Default to 4 credits if not specified
};

export interface PeriodProgress {
  completed: number;
  total: number;
  credits: number;
  totalCredits: number;
  percentage: number;
  isComplete: boolean;
}

export const calculatePeriodProgress = (courses: CourseDisplayInfo[], selectedCourseIds: Set<number>): PeriodProgress => {
  const totalCourses = courses.length;
  if (totalCourses === 0) {
    return { completed: 0, total: 0, credits: 0, totalCredits: 0, percentage: 0, isComplete: false };
  }

  let completedCount = 0;
  let currentCredits = 0;
  let totalPeriodCredits = 0;

  courses.forEach(course => {
    const credits = getCourseCredits(course);
    totalPeriodCredits += credits;
    if (selectedCourseIds.has(course.id)) {
      completedCount++;
      currentCredits += credits;
    }
  });

  const percentage = totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;
  const isComplete = completedCount === totalCourses;

  return {
    completed: completedCount,
    total: totalCourses,
    credits: currentCredits,
    totalCredits: totalPeriodCredits,
    percentage: percentage,
    isComplete: isComplete
  };
};
