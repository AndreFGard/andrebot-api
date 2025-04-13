

import React from 'react';
import { majorList } from '@/api';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
interface majorChooserProps {
    major: string;
    onMajorChange: (value: string) => void;
}
const majorChooser: React.FC<majorChooserProps> = ({ major, onMajorChange }: majorChooserProps) => {
    return(
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
        </Tabs>

    )
}   
export default majorChooser;