import React, { useEffect, useState } from 'react';

interface TimetableEditorProps {
  majors: Record<string, boolean>;
  allClasses: any[];
  initialMajor: string;
}

const TimetableEditor: React.FC<TimetableEditorProps> = ({ majors, allClasses, initialMajor }) => {
  const [major, setMajor] = useState(initialMajor);
  const [classes, setClasses] = useState<number[]>([]);
  const [timetableHtml, setTimetableHtml] = useState<string>('');
  const [availableClasses, setAvailableClasses] = useState(allClasses);
  const [searchTerm, setSearchTerm] = useState('');

  const getmajor = () => major;

  function addClass(clss: number) {
    const storedclasses = localStorage.getItem("classes") || "";
    const old_classes = storedclasses ? storedclasses.split(",") : [];

    if (clss) {
      const newClasses = [...new Set(old_classes.concat([String(clss)]))];
      localStorage.setItem("classes", newClasses.toString());
      console.log("Class added");
      return newClasses.map(Number);
    }
    else return old_classes.map(Number);
  }

  function getClasses() {
    const storedclasses = localStorage.getItem('classes') || "";
    if (storedclasses) {
      return storedclasses.split(',').filter(Boolean).map(Number);
    }
    else return [];
  }

  function deleteClass(x: number) {
    let storedClasses = getClasses();
    console.log(`deleting id ${x} from ${storedClasses}`);
    const idx = storedClasses.indexOf(x);
    if (idx > -1) storedClasses.splice(idx, 1);
    localStorage.setItem('classes', storedClasses.toString());
  }

  async function fetchTimetable(newClassId?: number) {
    const selectedClassIDs = getClasses() || [];
    const newSelectedClassID = newClassId || 0;
    
    if (newSelectedClassID) {
      addClass(newSelectedClassID);
    }
    
    const majorValue = getmajor();
    const major = majorValue; // Using major as major since radio buttons select major
    
    try {
      const response = await fetch(`http://localhost:3000/timetable/timetable?SelectedClassIDs=${selectedClassIDs}&NewSelectedClassIDs=${[newSelectedClassID]}&major=${majorValue}&major=${major}`, {
        method: 'GET'
      });
      const tableHTML = await response.text();
      setTimetableHtml(tableHTML);
      setClasses(getClasses());
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
    }
  }

  async function fetchClassesByProgram(major: string) {
    setMajor(major);
    try {
      const response = await fetch(`http://localhost:3000/timetable/classes?major=${major}`);
      const data = await response.json();
      setAvailableClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }

  const filteredClasses = availableClasses.filter(classItem => 
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    classItem.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <h1 className="my-4">Class Timetable Selector</h1>

      {/* Program Selection Radio Buttons */}
      <div className="mb-3">
        <label className="form-label">Select Program:</label>
        <div className="major-buttons">
          {Object.entries(majors).map(([major, isChecked]) => (
            <React.Fragment key={major}>
              <input 
                className="btn-check" 
                type="radio" 
                name="major" 
                id={`${major}btn`} 
                onClick={() => {
                  setSearchTerm('');
                  fetchClassesByProgram(major);
                }}
                value={major}
                defaultChecked={isChecked}
              />
              <label className="btn btn-primary btn-lg btn-lg-custom" htmlFor={`${major}btn`}>
                {major}
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form for Class Selection */}
      <form onSubmit={(event) => {
        event.preventDefault();
        const selectElement = document.getElementById('class-select') as HTMLSelectElement;
        fetchTimetable(Number(selectElement.value));
        selectElement.value = ''; // Reset selection
      }}>
        <div className="mb-3">
          <label htmlFor="class-select" className="form-label">Select Classes:</label>

          {/* Search input for filtering classes */}
          <input 
            type="text" 
            id="class-search" 
            className="form-control mb-2" 
            placeholder="Search classes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Dynamic Class Selection Container */}
          <div id="class-select-container">
            <select id="class-select" className="form-select">
              <option value="">Select a class</option>
              {filteredClasses.map(classItem => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.professor}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="d-grid gap-2 d-md-inline-flex mt-2">
          <button type="submit" className="btn btn-primary">Add class</button>
          <button type="button" className="btn btn-primary" onClick={() => fetchTimetable()}>
            Refresh Timetable
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            onClick={() => {
              localStorage.clear();
              fetchTimetable();
            }}
          >
            Wipe Timetable
          </button>
        </div>
      </form>

      {/* Container for the Table */}
      <div 
        id="timetable-container" 
        className="mt-4" 
        dangerouslySetInnerHTML={{ __html: timetableHtml }}
      />
    </div>
  );
};

export default TimetableEditor;