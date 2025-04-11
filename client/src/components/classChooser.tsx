import React, { useEffect } from 'react';
//import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Check} from "lucide-react";
interface ClassChooserProps {
  major: string;
  onMajorChange: (value: string) => void;
  onNewCourseChange: (value: number) => void;
  selectedCourseIds: Set<number>;
}

import { CourseDisplayInfo, majorList } from '@/api';
import { coursesplaceholder, getCourseDisplayInfoList } from '@/api';


const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, onNewCourseChange, selectedCourseIds }: ClassChooserProps) => {
  const [courses, setCourses] = React.useState(coursesplaceholder);

  const [selectedTerms, setSelectedTerms] = React.useState<Set<number>>(new Set([1]));
  
  //filtered by term
  const filteredCourses:  Record<string, Record<number, CourseDisplayInfo[]>> =
    Object.fromEntries(
      Object.entries(courses).map(([major, terms]) => [
        major,
        Object.fromEntries(
          Object.entries(terms).filter(([term]) => selectedTerms.has(Number(term)))
        ),
      ])
    );


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
    <p>Selected terms: {Array.from(selectedTerms.values()).join(', ')}</p>
      <div className='w-full max-w-full truncate overflow-x-hidden'>
        <h2 className='text-2xl font-bold mb-4 text-left'>Choose your major</h2>
        <Tabs
          defaultValue={major}
          className="flex w-full"
          onValueChange={(value) => {
            onMajorChange(value);
          }}
        >
          <TabsList className='w-full h-12'>
            {majorList.map((major) => (
              <TabsTrigger key={major} value={major} className="flex-grow text-xl font-bold">{major}</TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(filteredCourses).map((mjr) => (

            <TabsContent value={mjr}>
              <Command className='w-full' >
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {Object.values(filteredCourses[mjr]).flat().map((course) => (
                      <CommandItem 
                          key={course.id} 
                          onSelect={() => onNewCourseChange(Number(course.id))}
                          className={(selectedCourseIds.has(course.id)) ? 'bg-muted' : ''}
                          >
                        <span className="truncate">
                          {course.name} - {course.professor}
                        </span>
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
