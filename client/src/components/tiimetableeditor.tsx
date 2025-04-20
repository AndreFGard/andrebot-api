import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager, fetchTimetable, TimetableRenderInfo, initialTimetable} from '@/api';
import Timetable from './timetable';
import { Recommendations } from './Recommendations';
import { getRecommendations } from '@/api';
import { PendingCourse } from '../../../backend/models/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from './ui/card';
import { Car } from 'lucide-react';

interface TimetableProps {
  completedCourseIds: Set<number>;
}
const TimetableEditor = ({completedCourseIds}:TimetableProps) => {
  
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
    getRecommendations(major, 11, true, Array.from(completedCourseIds.values())).then((data: Record<number, PendingCourse[]>) => {
      setRecommendations(data);
    }).catch((e: Error) => {
        console.log("error fetching recommendations data", e)
    });
  }
  , [major, completedCourseIds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Editor de Horários</h2></CardTitle>
        <CardDescription className='text-lg'>Pesquise e adicione as disicplinas no seu horário, 
          verifique a existência de conflitos de horários, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6  flex flex-col">
      <div className="flex flex-col gap-2">
        <h4 className='text-xl font-bold text-left'>Filtrar cursos</h4>
        <ClassChooser major={major} onMajorChange={setmajor}
          onCourseToggle={handleCourseAddition}
          selectedCourseIds={selectedCourseIds}
          useMajorChooser={true}
          hasToggle={false}
        />
        <p>Selected courses: {Array.from(selectedCourseIds.values()).join(', ')}</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full rounded-lg outline">
        <AccordionItem value="recommendations">
          <AccordionTrigger className="text-sm pt-2" style={{fontSize: "0.8em"}}>Ver disciplinas pendentes disponíveis</AccordionTrigger>
          <AccordionContent className='p-3'>
            <Recommendations currentTerm={11} recommendations={recommendations}/>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Timetable 
        renderinfo={timetableRenderInfo} 
        onCourseToggle={handleCourseAddition}
        selectedCourseIds={selectedCourseIds}
        />

      </CardContent>
    </Card>
  );
};

export default TimetableEditor;
