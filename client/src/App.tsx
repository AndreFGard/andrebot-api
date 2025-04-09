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
      <main className='max-w-full m-auto'>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TimetableEditor></TimetableEditor>
      </ThemeProvider>
        \
      </main>
    </div>
  )
}

export default App;
