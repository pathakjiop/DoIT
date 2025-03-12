import { useState, useEffect } from "react"
import { ThemeProvider } from "./components/contexts/ThemeContext"
import { TaskProvider } from "./components/contexts/TaskContext"
import Sidebar from "./components/Sidebar/Sidebar"
import MainContent from "./components/MainContent/MainContent"
import CalendarModal from "./components/Modals/CalendarModal"

function App() {
  const [showCalendar, setShowCalendar] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="flex flex-col md:flex-row overflow-hidden h-screen w-screen">
          <Sidebar 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
          
          <MainContent 
            setShowCalendar={setShowCalendar} 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          
          {showCalendar && (
            <CalendarModal 
              setShowCalendar={setShowCalendar} 
            />
          )}
        </div>
      </TaskProvider>
    </ThemeProvider>
  )
}

export default App
