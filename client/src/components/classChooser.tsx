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
  selectedCourseIds: number[];
}

import { majorList } from '@/api';
import { coursesplaceholder, getCourseDisplayInfoList } from '@/api';
const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, onNewCourseChange, selectedCourseIds }: ClassChooserProps) => {
  const [courses, setCourses] = React.useState(coursesplaceholder);

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
          {Object.keys(courses).map((mjr) => (

            <TabsContent value={mjr}>
              <Command className='w-full' >
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {courses[mjr].map((course) => (
                      <CommandItem key={course.id} onSelect={() => onNewCourseChange(Number(course.id))}>
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
