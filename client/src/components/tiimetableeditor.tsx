import React from 'react';

import ClassChooser from './classChooser';
import {coursesplaceholder} from '../api';
const TimetableEditor = () => {
  
  const [major,setmajor ] = React.useState("CC");

  const [courses, setCourses] = React.useState(coursesplaceholder);


  const [newCourseId, setNewCourseId] = React.useState(-1);
  function handleCourseAddition(value: number){
    setNewCourseId(value);
    console.log(value);
  }
  return (
    <ClassChooser major={major} onMajorChange={setmajor} courses={courses} onNewCourseChange={handleCourseAddition} />
  );
};

export default TimetableEditor;
