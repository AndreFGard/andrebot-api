import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager } from '@/api';
const TimetableEditor = () => {
  
  const [major,setmajor ] = React.useState("CC");
  const [newCourseId, setNewCourseId] = React.useState(-1);
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<Set<number>>(new Set());

  const [courseManager, setCourseManager] = React.useState<CourseSelectionManager>(new CourseSelectionManager) ;

  useEffect(() => {
      const manager = new CourseSelectionManager();
      setCourseManager(manager);
  }, []);

  function handleCourseAddition(value: number){
    setNewCourseId(value);
    console.log(value);
    courseManager.toggle(value);
    setSelectedCourseIds(courseManager.getSelectedCourseIds())
  }

  return (
    <>
    <ClassChooser major={major} onMajorChange={setmajor}
      onNewCourseChange={handleCourseAddition}
      selectedCourseIds={selectedCourseIds}
     />

  </>
  );
};

export default TimetableEditor;
