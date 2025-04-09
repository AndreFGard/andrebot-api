import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { TimetableRenderInfo, fetchTimetable } from './api'
import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
function App() {

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
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TimetableEditor ></TimetableEditor>
      </ThemeProvider>
        
      </main>
    </div>
  )
}

export default App;
