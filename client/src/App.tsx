import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { TimetableRenderInfo, fetchTimetable } from './api'
import TimetableEditor from './components/tiimetableeditor'

function App() {
  const [majors, setMajors] = useState<Record<string, boolean>>({
    CC: true,
    EC: false,
    SI: false
  });
  const [allClasses, setAllClasses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch initial classes for the default major (BCC)
    const fetchInitialClasses = async () => {
      try {
        const response = await fetch("http://localhost:3000/timetable/classes?program=CC");
        const data = await response.json();
        setAllClasses(data);
      } catch (error) {
        console.error("Failed to fetch initial classes:", error);
      }
    };
    
    fetchInitialClasses();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
      </header>
      
      <main>
        <TimetableEditor 
          majors={majors} 
          allClasses={allClasses} 
          initialMajor="CC" 
        />
      </main>
    </div>
  )
}

export default App;
