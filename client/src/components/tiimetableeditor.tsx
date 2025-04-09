import React, { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';



const TimetableEditor= () => {
 

  return (
    <ToggleGroup
      type="single"
      defaultValue="CC"
      className="w-full"

      onValueChange={(value) => {
        console.log(value);
      }}
    >
      <ToggleGroupItem value="CC" className="w-[100px]">
        CC
      </ToggleGroupItem>
  </ToggleGroup>
  )
}
export default TimetableEditor;