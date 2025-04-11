import React, { useEffect } from 'react';

import ClassChooser from './classChooser';
const TimetableEditor = () => {
  
  const [major,setmajor ] = React.useState("CC");
  const [newCourseId, setNewCourseId] = React.useState(-1);
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<number[]>([]);

  function handleCourseAddition(value: number){
    setNewCourseId(value);
    console.log(value);
  }
  return (
    <ClassChooser major={major} onMajorChange={setmajor}
      onNewCourseChange={handleCourseAddition}
      selectedCourseIds={selectedCourseIds}
     />
  );
};

export default TimetableEditor;
