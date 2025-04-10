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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {Check} from "lucide-react";
interface ClassChooserProps {
  major: string;
  onMajorChange: (value: string) => void;
  onCourseToggle: (value: number) => void;
  selectedCourseIds: Set<number>;
}

import { CourseDisplayInfo, majorList } from '@/api';
import { coursesplaceholder, getCourseDisplayInfoList } from '@/api';


const ClassChooser: React.FC<ClassChooserProps> = ({ major, onMajorChange, onCourseToggle, selectedCourseIds }: ClassChooserProps) => {
  const [courses, setCourses] = React.useState(coursesplaceholder);

  const [selectedTerms, setSelectedTerms] = React.useState<Set<number>>(new Set([1]));
  
  // Derive available terms dynamically from course data
  const availableTerms = React.useMemo(() => {
    const terms = new Set<number>();
    Object.values(courses).forEach((majorTerms) => {
      Object.keys(majorTerms).forEach((term) => {
        terms.add(Number(term));
      });
    });
    return Array.from(terms).sort((a, b) => a - b);  // Sort terms in ascending order
  }, [courses]);
  
  const handleTermChange = (term: string) => {
    setSelectedTerms(new Set([Number(term)]));
  };
  
  //filtered by term
  const filteredCourses:  Record<string, Record<number, CourseDisplayInfo[]>> =
    Object.fromEntries(
      Object.entries(courses).map(([major, terms]) => [
        major,
        Object.fromEntries(
          Object.entries(terms).filter(([term]) =>(selectedTerms.has(Number(term)) || term == '-1'))
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
          
          {/* Term selection dropdown */}
          <div className="my-4">
            <h3 className='text-xl font-bold mb-2 text-left'>Select Term</h3>
            <Select onValueChange={handleTermChange} defaultValue="1">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                {availableTerms.map((term) => (
                  <SelectItem key={term} value={term.toString()}>
                    Term {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
                          onSelect={() => onCourseToggle(Number(course.id))}
                          className={(selectedCourseIds.has(course.id)) ? 'bg-muted' : ''}
                          >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{course.name}</span>
                            <span className="text-xs text-muted-foreground">Prof: {course.professor}</span>
                          </div>
                          {selectedCourseIds.has(course.id) && 
                            <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                          }
                        </div>
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
