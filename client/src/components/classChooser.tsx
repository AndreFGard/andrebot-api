import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  courses: courseDisplayInfo[];
  onNewCourseChange: (value: number) => void;
}

import { majorList } from '@/api';
const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, courses, onNewCourseChange }: ClassChooserProps) => {
  
  return (
    <>
      <div className='w-full max-w-full truncate overflow-x-hidden'>
        <h2 className='text-2xl font-bold mb-4 text-left'>Choose your major</h2>
        <ToggleGroup
          type="single"
          defaultValue={major}
          className="flex w-full"
          onValueChange={(value) => {
            onMajorChange(value);
          }}
        >
          {majorList.map((major) => (
            <ToggleGroupItem key={major} value={major} asChild className="flex-1">
              <Button
                variant="secondary"
                className="h-[50px] text-lg w-full"
              >
                {major}
              </Button>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Command className='w-full' >
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {courses.map((course) => (
                <CommandItem key={course.id} onSelect={() => onNewCourseChange(Number(course.id))}>
                  <span className="truncate">
                    {course.name} - {course.professor}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </>
  );
};

export default ClassChooser;
