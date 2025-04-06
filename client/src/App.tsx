import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CourseInfo, ITimetable, ScheduleDay, TimetableResponse, fetchTimetable } from './api'
import Timetable from './components/timetable'

function App() {
  const [count, setCount] = useState(0)
  const [timetableData, setTimetableData] = useState<TimetableResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        // You can change the IDs as needed
        const selectedClassIDs = [2]
        const data = await fetchTimetable([3,4,5,6,7,])
        setTimetableData(data)
      } catch (error) {
        console.error('Error fetching timetable:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTimetable()
  }, [])

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
        
        {loading ? (
          <p>Loading timetable...</p>
        ) : timetableData ? (
          <Timetable 
            currentlyChosenClasses={timetableData.currentlyChosenClasses}
            conflictsIDs={timetableData.conflictsIDs}
            timetable={timetableData.timetable}
            blamedConflicts={timetableData.blamedConflicts}
          />
        ) : (
          <p>Failed to load timetable</p>
        )}
      </header>
    </div>
  )
}

export default App;
