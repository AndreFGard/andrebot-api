import React from 'react';

import ClassChooser from './classChooser';
const TimetableEditor = () => {
  
  const [major,setmajor ] = React.useState("CC");

  const [courses, setCourses] = React.useState([
    {id: 0, name: "Alice Johnson"},
    {id: 1, name: "Bob Williams"},
    {id: 2, name: "Charlie Brown"},
    {id: 3, name: "Diana Miller"},
    {id: 4, name: "Ethan Davis"},
    {id: 5, name: "Fiona Wilson"},
    {id: 6, name: "George Garcia"},
    {id: 7, name: "Hannah Rodriguez"},
    {id: 8, name: "Isaac Martinez"},
    {id: 9, name: "Jack Anderson"},
    {id: 10, name: "Kelly Thomas"},
    {id: 11, name: "Liam Jackson"},
    {id: 12, name: "Mia White"},
    {id: 13, name: "Noah Harris"},
    {id: 14, name: "Olivia Martin"},
    {id: 15, name: "Peter Thompson"},
    {id: 16, name: "Quinn Lewis"},
    {id: 17, name: "Ryan Clark"},
    {id: 18, name: "Sophia Hall"},
    {id: 19, name: "Tyler Young"}
  ]);


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
