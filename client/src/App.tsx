import './App.css'
import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
function App() {

  return (
    <div className="App">
      <main className='max-w-full m-auto'>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TimetableEditor></TimetableEditor>
      </ThemeProvider>
      </main>
    </div>
  )
}

export default App;
