import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager, fetchTimetable, TimetableRenderInfo, initialTimetable} from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MajorChooser from './majorChooser';
import TermChooser from './termChooser';

import { coursesplaceholder } from '@/api';

const CourseHistory = () => {
  const terms = new Set([1,2,3,4,5,6,7,8]);
  const [major,setmajor ] = React.useState("CC");
 // const [newCourseId, setNewCourseId] = React.useState(-1);
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<Set<number>>(new Set());

  const [courseManager, setCourseManager] = React.useState<CourseSelectionManager>(new CourseSelectionManager) ;

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

  //todo substitute by actual courses, using createContext
  function batchAddCoursesByTerm(term: number){
    coursesplaceholder[major][term].forEach((course) => {
      //make sure it's only enabling
      if (!courseManager.isin(course.id)) courseManager.toggle(course.id);
    });
    setSelectedCourseIds(courseManager.getSelectedCourseIds()); 
  }

  //term chooser
  const [selectedTerms, setSelectedTerms] = React.useState<Set<number>>(new Set([1]));
  return (
    <>
    <h3>What major are you studying?</h3>
    <MajorChooser major={major} onMajorChange={setmajor} />
    <Card className='w-full '>
      <CardContent className='py-3 grid grid-cols-1 md:grid-cols-2 gap-2'>
        <div className='outline rounded-md px-1.5'>
          <ClassChooser major={major} onMajorChange={setmajor}
          onCourseToggle={handleCourseAddition}
          selectedCourseIds={selectedCourseIds}
          />
        </div>
        <div className='outline rounded-md px-1.5'>
        <TermChooser terms={terms}
                  selectedTerms={selectedTerms}
                  setSelectedTerms={setSelectedTerms}
                  multipleChoice={false} >
        </TermChooser>
            <ul className="space-y-2 my-4">
            {Array.from(selectedTerms).map((term: number) => 
            coursesplaceholder[major][term].map((course: { id: number; name: string }) => (
              <li key={course.id} className="flex flex-row justify-between py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
              <span className="text-gray-700 px-2">{course.name}</span>
              </li>
            ))
            )}
            </ul>
          <Button onClick={() => batchAddCoursesByTerm(Array.from(selectedTerms)[0])}>Add all</Button>
        </div>
        <p>Selected courses: {Array.from(selectedCourseIds).join(", ")}</p>
      </CardContent>
    </Card>
  </>
  );
};

export default CourseHistory;
