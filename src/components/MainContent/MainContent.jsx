import { useState } from "react"
import { Search, Grid, Moon, Sun, Columns, LayoutList, Menu, X, ChevronDown } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"
import TaskInput from "./TaskInput"
import TaskList from "./TaskList"
import KanbanBoard from "./KanbanBoard"
import SearchFilters from "./SearchFilters"

const MainContent = ({ setShowCalendar, mobileMenuOpen, setMobileMenuOpen }) => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { 
    searchQuery, 
    setSearchQuery, 
    showSearch, 
    setShowSearch, 
    viewMode, 
    setViewMode,
    activeSidebar
  } = useTasks()

  const [showSearchFilters, setShowSearchFilters] = useState(false)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className={`p-3 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} border-b flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2`}>
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        {showSearch ? (
          <div className="w-full md:flex-1 flex items-center">
            <Search className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'} mr-2`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className={`flex-1 outline-none ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
              autoFocus
            />
            <button
              className={`p-2 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded-full`}
              onClick={() => setShowSearchFilters(!showSearchFilters)}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button
              className={`p-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              onClick={() => {
                setShowSearch(false)
                setSearchQuery("")
                setShowSearchFilters(false)
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className={`flex items-center p-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
            <button 
              className={`p-1.5 rounded ${viewMode === 'list' ? (darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800 shadow') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button 
              className={`p-1.5 rounded ${viewMode === 'kanban' ? (darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800 shadow') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
              onClick={() => setViewMode('kanban')}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
          
          <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5" />
          </button>
          <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setShowCalendar(true)}>
            <Grid className="w-5 h-5" />
          </button>
          <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Search Filters */}
      {showSearch && showSearchFilters && (
        <SearchFilters />
      )}

      {/* Task Content */}
      <div className={`flex-1 overflow-auto p-3 md:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto">
          {/* To Do Dropdown */}
          <div className="mb-6">
            <button className={`flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
              {searchQuery ? "Search Results" : activeSidebar}
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Add Task Input */}
          <TaskInput />

          {/* Task List or Kanban View */}
          {viewMode === 'list' ? (
            <TaskList />
          ) : (
            <KanbanBoard />
          )}
        </div>
      </div>
    </div>
  )
}

export default MainContent
