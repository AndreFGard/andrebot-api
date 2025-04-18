import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
import CourseHistory from './components/coursehistory'
import { CourseDisplayInfoProvider } from './CourseDisplayInfoCtx'
import { useState } from 'react';
function App() {
  const [completedCourseIds, setCompletedCourseIds ] = useState<Set<number>>(new Set());


  return (
    <div className="w-full">
      <main className="w-full" id="course-history-section">
        <CourseDisplayInfoProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

          <div >
            <CourseHistory completedCourseIds={completedCourseIds} setCompletedCourseIds={setCompletedCourseIds}></CourseHistory>
          </div>
    
          <hr style={{marginTop: 200}}></hr>
          <div >
            <TimetableEditor completedCourseIds={completedCourseIds}></TimetableEditor>
            </div>
            
          </ThemeProvider>
        </CourseDisplayInfoProvider>
      </main>
    </div>
  )
}

export default App
