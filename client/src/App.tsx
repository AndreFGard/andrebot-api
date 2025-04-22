import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
import CourseHistory from './components/coursehistory'
import { CourseDisplayInfoProvider } from './CourseDisplayInfoCtx'
import { useState, useEffect} from 'react';


function App() {
  const [completedCourseIds, setCompletedCourseIds ] = useState<Set<number>>(new Set());

  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());

  //gambiarra to avoid a misterious autoscroll
  useEffect(() => {
    new Promise(resolve => setTimeout(resolve, 50)).then(() => {
      ;
    window.scrollTo(0, 0);
    });
  }, []);


  useEffect(() => {
    const completed = localStorage.getItem('completedCourseIds');
    const selected = localStorage.getItem('selectedCourseIds');
    if (completed) {
      setCompletedCourseIds(new Set(JSON.parse(completed)));
    }
    if (selected) {
      setSelectedCourseIds(new Set(JSON.parse(selected)));
    }
    
  }, []);

  useEffect(() => {
    if (completedCourseIds.size) localStorage.setItem('completedCourseIds', JSON.stringify(Array.from(completedCourseIds)));
    if (selectedCourseIds.size) localStorage.setItem('selectedCourseIds', JSON.stringify(Array.from(selectedCourseIds)));
  }, [completedCourseIds, selectedCourseIds]);


  return (
    <div className="w-full">
      <main className="w-full" id="course-history-section">
        <CourseDisplayInfoProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

          <div id='course-history-section' >
            <CourseHistory completedCourseIds={completedCourseIds} setCompletedCourseIds={setCompletedCourseIds}></CourseHistory>
          </div>
    
          <div >
            <TimetableEditor selectedCourseIds={selectedCourseIds}
              setSelectedCourseIds={setSelectedCourseIds} 
              completedCourseIds={completedCourseIds}>

              </TimetableEditor>
          </div>
            
          </ThemeProvider>
        </CourseDisplayInfoProvider>
      </main>
      <footer className='pt-10 text-muted text-center'>Made by Bianca, Fatima and Andre<br></br>Powered by Linux</footer>
    </div>
  )
}

export default App
