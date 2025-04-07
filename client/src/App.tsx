import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { TimetableRenderInfo, fetchTimetable } from './api'
import Timetable from './components/timetable'

function App() {
  const [timetableData, setTimetableData] = useState<TimetableRenderInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        // You can change the IDs as needed
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
            conflictlessClasses={timetableData.conflictlessClasses}
            conflictIds={timetableData.conflictIds}
            timetable={timetableData.timetable}
            conflicts={timetableData.conflicts}
            conflictlessIds={timetableData.conflictlessIds}
          />
        ) : (
          <p>Failed to load timetable</p>
        )}
      </header>
    </div>
  )
}

export default App;
