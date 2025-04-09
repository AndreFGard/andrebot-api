import React from 'react';
//import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import type { courseDisplayInfo } from '@/api';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface ClassChooserProps {
  major: string;
  onMajorChange: (value: string) => void;
  courses: Record<string, courseDisplayInfo[]>;
  onNewCourseChange: (value: number) => void;
}

import { majorList } from '@/api';
const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, courses, onNewCourseChange }: ClassChooserProps) => {

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
