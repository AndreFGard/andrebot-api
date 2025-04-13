import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ClassChooser from './classChooser';
import TermChooser from './termChooser';
import { CourseDisplayInfo } from '@/api';

interface VisualizationTabProps {
  major: string;
  selectedCourseIds: Set<number>;
  selectedTerms: Set<number>;
  allPeriods: number[];
  coursesData: Record<string, Record<number, CourseDisplayInfo[]>>;
  onMajorChange: (major: string) => void;
  onCourseToggle: (id: number) => void;
  onUpdateSelectedTerms: (terms: Set<number>) => void;
  onAddAllFromTerm: (term: number) => void;
}

const VisualizationTab: React.FC<VisualizationTabProps> = ({
  major,
  selectedCourseIds,
  selectedTerms,
  allPeriods,
  coursesData,
  onMajorChange,
  onCourseToggle,
  onUpdateSelectedTerms,
  onAddAllFromTerm
}) => {
  return (
    <Card className='w-full'>
      <CardContent className='py-3 grid grid-cols-1 md:grid-cols-2 gap-2'>
        <div className='outline rounded-md px-1.5'>
          <ClassChooser 
            major={major} 
            onMajorChange={onMajorChange}
            onCourseToggle={onCourseToggle}
            selectedCourseIds={selectedCourseIds}
          />
        </div>
        <div className='outline rounded-md px-1.5'>
          <TermChooser 
            terms={new Set(allPeriods)}
            selectedTerms={selectedTerms}
            setSelectedTerms={onUpdateSelectedTerms}
            multipleChoice={false}
          />
          <ul className="space-y-2 my-4">
            {Array.from(selectedTerms).map((term: number) => 
              (coursesData[major]?.[term] ?? []).map((course: { id: number; name: string }) => (
                <li 
                  key={course.id} 
                  className="flex flex-row justify-between py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  <span className="text-gray-700 px-2">{course.name}</span>
                </li>
              ))
            )}
          </ul>
          <Button 
            onClick={() => {
              const term = Array.from(selectedTerms)[0];
              if (term !== undefined) {
                onAddAllFromTerm(term);
              }
            }}
            disabled={selectedTerms.size === 0}
          >
            Add all
          </Button>
        </div>
        <p>Selected courses: {Array.from(selectedCourseIds).join(", ")}</p>
      </CardContent>
    </Card>
  );
};

export default VisualizationTab;
