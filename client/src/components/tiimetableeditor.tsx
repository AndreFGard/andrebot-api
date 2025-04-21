import React, { useEffect} from 'react';

import ClassChooser from './classChooser';
import { CourseSelectionManager, fetchTimetable, TimetableRenderInfo, initialTimetable} from '@/api';
import Timetable from './timetable';
import { Recommendations } from './Recommendations';
import { getRecommendations } from '@/api';
import { PendingCourse } from '../../../backend/models/schemas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from './ui/card';

interface TimetableProps {
  completedCourseIds: Set<number>;
  selectedCourseIds: Set<number>;
  setSelectedCourseIds: (ids: Set<number>) => void;
}
const TimetableEditor = ({completedCourseIds, selectedCourseIds, setSelectedCourseIds}:TimetableProps) => {
  
  const [major,setmajor ] = React.useState("CC");
 // const [newCourseId, setNewCourseId] = React.useState(-1);

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
        <CardDescription className='text-lg'>Pesquise e adicione disciplinas ao seu horário, 
          verifique se há horários conflitantes e veja as disciplinas pendentes disponíveis considerando
          os requisitos que você já completou.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6  flex flex-col">
      <div className="flex flex-col gap-2">
        <h4 className='text-xl font-bold text-left'>Pesquisar disciplinas sendo ofertadas</h4>
        <ClassChooser major={major} onMajorChange={setmajor}
          onCourseToggle={handleCourseAddition}
          selectedCourseIds={selectedCourseIds}
          useMajorChooser={true}
          hasToggle={false}
        />
        <p className='text-gray-400'>Ids selecionados: {Array.from(selectedCourseIds.values()).join(', ')}</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full ">
        <AccordionItem value="recommendations" className=' rounded-lg outline'>
          <AccordionTrigger className="text-sm" style={{fontSize: "0.8em"}}>
            Ver disciplinas pendentes
            </AccordionTrigger>
          <AccordionContent className='p-3'>
            <p className='text-muted'>Disciplinas obrigatórias do curso de {major} ainda não cursadas</p>
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
