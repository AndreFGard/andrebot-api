import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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


const ClassChooser: React.FC<ClassChooserProps> = ({major, onMajorChange, courses, onNewCourseChange}: ClassChooserProps) => {
  const majorList = ['CC', 'EC', 'SI', "todos"];
  
  return (
    <>
    <ToggleGroup
      type="single"
      defaultValue={major}
      className="justify-center"
      onValueChange={(value) => {
        onMajorChange(value);
      }}
    >
      {majorList.map((major) => (
        <ToggleGroupItem key={major} value={major} asChild>
          <Button
            variant="outline"
            className="w-18 h-[50px] text-lg"
          >
            {major}
          </Button>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
    <Command>
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup >
        {courses.map((course) => (
            <CommandItem key={course.id} onSelect={() => onNewCourseChange(Number(course.id))}>
                {course.name}
            </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </Command>
  </>
  );
};

export default ClassChooser;
