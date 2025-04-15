import { coursesplaceholder, getCourseDisplayInfoList } from "./api";
import { createContext, ReactNode, useEffect, useState } from "react";

export const CourseDisplayInfoCtx = createContext({} as Record<string, Record<number, any[]>>);

export const CourseDisplayInfoProvider = ({ children }: {children: ReactNode}) => {
  const [courseDisplayInfo, setCourseDisplayInfo] = useState(coursesplaceholder);

  useEffect(() => {
    getCourseDisplayInfoList().then(data => {
      setCourseDisplayInfo(data);
      console.log("succesfuly loaded history")
    });
  }, []);

  return (
    <CourseDisplayInfoCtx.Provider value={courseDisplayInfo}>
      {children}
    </CourseDisplayInfoCtx.Provider>
  );
};