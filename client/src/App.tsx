import TimetableEditor from './components/tiimetableeditor'
import { ThemeProvider } from "@/components/theme-provider"
function App() {
  return (
    <div className="w-full">
      <main className="w-full">
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TimetableEditor></TimetableEditor>
        </ThemeProvider>
      </main>
    </div>
  )
}

export default App
