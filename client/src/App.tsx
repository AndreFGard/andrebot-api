import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
import CourseHistory from './components/coursehistory'
import { getCourseDisplayInfoList } from './api'
import { CourseDisplayInfoProvider } from './CourseDisplayInfoCtx'
function App() {



  return (
    <div className="w-full">
      <main className="w-full" id="course-history-section">
        <CourseDisplayInfoProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

          <div >
            <CourseHistory></CourseHistory>
          </div>
    
          <hr style={{marginTop: 200}}></hr>
          <div >
            <TimetableEditor></TimetableEditor>
            </div>
            
          </ThemeProvider>
        </CourseDisplayInfoProvider>
      </main>
    </div>
  )
}

export default App
