import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
import CourseHistory from './components/coursehistory'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useEffect } from 'react';
function App() {



  return (
    <div className="w-full">
      <main className="w-full" id="course-history-section">
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">

        <div >
          <CourseHistory></CourseHistory>
        </div>
  
        <hr style={{marginTop: 200}}></hr>
        <div >
          <TimetableEditor></TimetableEditor>
          </div>
          
        </ThemeProvider>
      </main>
    </div>
  )
}

export default App
