import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface ClassChooserProps {
  major: string;
  useMajorChooser?: boolean;
  onMajorChange: (value: string) => void;
  onCourseToggle: (value: number) => void;
  selectedCourseIds: Set<number>;
  hasToggle?:boolean;
}

import { CourseDisplayInfo, majorList } from '@/api';
import { coursesplaceholder, getCourseDisplayInfoList } from '@/api';
import TermChooser from './termChooser';
import CourseItem from './CourseItem'; 

const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, onCourseToggle, useMajorChooser, selectedCourseIds, hasToggle=true }: ClassChooserProps) => {
  const [courses, setCourses] = React.useState(coursesplaceholder);
  const [selectedTerms, setSelectedTerms] = React.useState<Set<number>>(new Set([1]));

  //filtered by term

  const filteredCourses:  Record<string, Record<number, CourseDisplayInfo[]>> =
    Object.fromEntries(
      Object.entries(courses).map(([coursemajor, terms]) => [
        coursemajor,
        Object.fromEntries(
          Object.entries(terms).filter(([term]) =>(selectedTerms.has(Number(term)) || selectedTerms.has(-1)))
        ),
      ])
    );
    console.log(`filtering term {Array.from(selectedTerms)}`);


  //const filteredCourses = Object.entries(courses).filter(([majcourse]) => { return selectedTerms.includes(course.term); }
  //fetch courses only once
  useEffect(() => {
    const f = () => {
      getCourseDisplayInfoList().then((data) => {
        setCourses(data);
      }).catch((error) => {
        console.error('Error fetching course data:', error);
      });
    }
    f();
  }, [])


  //todo if course id in selectedCourseIds, add a checkmark

  return (
    <>
      <div className='w-full max-w-full truncate overflow-x-hidden'>
          {/* Wrapping Tabs component */}
          <Tabs defaultValue={major} className="w-full">
            {/* Add MajorChooser if useMajorChooser is true */}
            {useMajorChooser && (
              <TabsList className='w-full h-12'>
                {majorList.map((mjr) => (
                  <TabsTrigger key={mjr} value={mjr} className="flex-grow text-xl font-bold" onClick={() => onMajorChange(mjr)}>
                    {mjr}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}
          <TermChooser terms={new Set([1,2,3,4,5,6,7,8,9])} selectedTerms={selectedTerms} setSelectedTerms={setSelectedTerms}></TermChooser>
          
          {Object.keys(filteredCourses).map((mjr) => (

            <TabsContent value={mjr}>
              <Command className='w-full' >
                <CommandInput placeholder="Pesquise uma disciplina para adicioná-la" />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {Object.values(filteredCourses[mjr]).flat().map((course) => (
                      <CommandItem 
                          key={course.id} 
                          onSelect={() => onCourseToggle(Number(course.id))}
                          className={(selectedCourseIds.has(course.id)) ? 'bg-muted' : ''}
                          >
                          <CourseItem 
                              course={course}
                              isSelected={selectedCourseIds.has(course.id)}
                              onToggleCourse={onCourseToggle}
                              hasToggle={hasToggle}
                          />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>

            </TabsContent>
          ))
          }
      </Tabs>

      </div>
    </>
  );
};

export default ClassChooser;
