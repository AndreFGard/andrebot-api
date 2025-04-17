import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager, fetchTimetable, TimetableRenderInfo, initialTimetable} from '@/api';
import Timetable from './timetable';
import { Recommendations } from './Recommendations';
import { getRecommendations } from '@/api';
import { PendingCourse } from '../../../backend/models/schemas';

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

  //recommendations
  const [recommendations, setRecommendations] = React.useState<Record<number, PendingCourse[]>>({});

  useEffect(() => {
    getRecommendations(major, 4, true, Array.from(selectedCourseIds.values())).then((data: Record<number, PendingCourse[]>) => {
      setRecommendations(data);
    }).catch((e: Error) => {
        console.log("error fetching recommendations data", e)
    });
  }
  , [major, selectedCourseIds]);

  return (
    <>
    <h2 className='text-xl font-bold mb-2 text-left'>Select Major</h2>
    <ClassChooser major={major} onMajorChange={setmajor}
      onCourseToggle={handleCourseAddition}
      selectedCourseIds={selectedCourseIds}
      useMajorChooser={true}
     />
    <p>Selected courses: {Array.from(selectedCourseIds.values()).join(', ')}</p>
    <Timetable renderinfo={timetableRenderInfo} onCourseToggle={handleCourseAddition} selectedCourseIds={selectedCourseIds}/>
    
    
    <Recommendations currentTerm={1} recommendations={recommendations}/>
  </>
  );
};

export default TimetableEditor;
