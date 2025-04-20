
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import React from "react";
interface TermChooserProps{
  terms: Set<number>;
  selectedTerms: Set<number>;
  setSelectedTerms: (value: Set<number>) => void;

  multipleChoice?: boolean;
}

const TermChooser :React.FC<TermChooserProps> = ({terms, selectedTerms, setSelectedTerms, multipleChoice}) => {  
  // Derive available terms dynamically from course data
  const availableTerms = React.useMemo(() => {
    return Array.from(terms).sort((a, b) => a - b);  // Sort terms in ascending order
  }, []);
  
  const handleTermChange = (term: string) => {
    if (multipleChoice && term != '-1') {
      setSelectedTerms(new Set(selectedTerms.add(Number(term))));
    }
    else  setSelectedTerms(new Set([Number(term)]));
  };
  

  return (
    <>
      {/* Term selection dropdown */}
      <div className="my-4">
      <Select onValueChange={handleTermChange} defaultValue="1">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a term" />
        </SelectTrigger>
        <SelectContent>
          {availableTerms.map((term) => (
            <SelectItem key={term} value={term.toString()}>
            {term}º período
            </SelectItem>
          ))}
          <SelectItem key={-1} value="-1">
            Todos os períodos
          </SelectItem>
        </SelectContent>
      </Select>
      </div>
    </>
  );
}

export default TermChooser;