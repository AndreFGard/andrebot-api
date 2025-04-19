import { coursesplaceholder, getCourseClassInfoList } from "./api";
import { createContext, ReactNode, useEffect, useState } from "react";

export const ClassDisplayInfoCtx = createContext({} as Record<string, Record<number, any[]>>);

export const CourseClassDisplayInfoProvider = ({ children }: {children: ReactNode}) => {
  const [classDisplayInfo, setClassDisplayInfo] = useState<Record<string, Record<number, any[]>>>(coursesplaceholder);

  useEffect(() => {

    getCourseClassInfoList().then(data => {
      setClassDisplayInfo(data);
      console.log("succesfuly loaded history")
    }).catch((e:Error) => console.log("error fetching course class info", e));

  }, []);

  return (
    <ClassDisplayInfoCtx.Provider value={classDisplayInfo}>
      {children}
    </ClassDisplayInfoCtx.Provider>
  );
};  