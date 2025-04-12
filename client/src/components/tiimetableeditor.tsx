import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager, fetchTimetable, TimetableRenderInfo, initialTimetable} from '@/api';
import Timetable from './timetable';
const TimetableEditor = () => {
  
  const [major,setmajor ] = React.useState("CC");
 // const [newCourseId, setNewCourseId] = React.useState(-1);
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<Set<number>>(new Set());

  const [courseManager, setCourseManager] = React.useState<CourseSelectionManager>(new CourseSelectionManager) ;
  const [timetableRenderInfo, setTimetableRenderInfo] = React.useState<TimetableRenderInfo>(initialTimetable);


  useEffect(() => {
      const manager = new CourseSelectionManager();
      setCourseManager(manager);
  }, []);

  function handleCourseAddition(value: number){
    //setNewCourseId(value);
    
    courseManager.toggle(value);
    console.log(`toggling ${value}: ${Array.from(courseManager.getSelectedCourseIds())}`);
    setSelectedCourseIds(courseManager.getSelectedCourseIds())
  }

  useEffect(() => { 
    fetchTimetable(Array.from(selectedCourseIds.values())).then((data: TimetableRenderInfo) => {
      setTimetableRenderInfo(data);
    }).
    catch((e: Error) => {
        console.log("error fetching timetable data", e)
    });
  }, [selectedCourseIds])


  return (
    <>
    <h2 className='text-xl font-bold mb-2 text-left'>Select Major</h2>
    <ClassChooser major={major} onMajorChange={setmajor}
      onCourseToggle={handleCourseAddition}
      selectedCourseIds={selectedCourseIds}
     />
    <p>Selected courses: {Array.from(selectedCourseIds.values()).join(', ')}</p>
    <Timetable renderinfo={timetableRenderInfo} onCourseToggle={handleCourseAddition} selectedCourseIds={selectedCourseIds}/>

  </>
  );
};

export default TimetableEditor;
