import { useState } from "react"
import { List, Calendar, Star, Plus, X, Trash } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"
import TaskDashboard from "./TaskDashboard"

const Sidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { darkMode } = useTheme()
  const { 
    activeSidebar, 
    setActiveSidebar, 
    customLists, 
    deleteList,
    addList
  } = useTasks()

  const [newListName, setNewListName] = useState("")
  const [showNewListInput, setShowNewListInput] = useState(false)

  // Default list
  const defaultList = { id: 0, name: "Default" }

  // Handle cancel/close for Add List
  const cancelAddList = (e) => {
    // Stop event propagation to prevent triggering other click handlers
    if (e) {
      e.stopPropagation()
    }
    setShowNewListInput(false)
    setNewListName("")
  }

  // Handle sidebar item click
  const handleSidebarItemClick = (name) => {
    setActiveSidebar(name)
    // Close mobile menu when an item is selected
    if (window.innerWidth < 768) { // md breakpoint in Tailwind
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      <div className={`${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } border-r`}>
        <div className={`p-2 flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="text-green-600 font-bold text-xl flex items-center">
            <span className="text-green-600 mr-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                  fill="currentColor"
                />
                <path d="M12 7L9 11H15L12 7Z" fill="currentColor" />
              </svg>
            </span>
            Dolt
          </div>
          {/* Close button for mobile view */}
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-1">
          {/* Default Lists */}
          <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1`}>My Tasks</div>
          <div className="space-y-1">
            {[
              { name: "All Tasks", icon: <List className="w-5 h-5 mr-3" /> },
              { name: "Today", icon: <Calendar className="w-5 h-5 mr-3" /> },
              { name: "Important", icon: <Star className="w-5 h-5 mr-3" /> },
              { name: "Planned", icon: <Calendar className="w-5 h-5 mr-3" /> },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                  activeSidebar === item.name 
                    ? darkMode ? "bg-green-900" : "bg-green-50" 
                    : ""
                }`}
                onClick={() => handleSidebarItemClick(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Default List */}
          <div className="mt-2">
            <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1`}>Default List</div>
            <div className="space-y-1">
              <div
                className={`flex items-center px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                  activeSidebar === "Default" 
                    ? darkMode ? "bg-green-900" : "bg-green-50" 
                    : ""
                }`}
                onClick={() => handleSidebarItemClick("Default")}
              >
                <List className="w-5 h-5 mr-3" />
                <span>{defaultList.name}</span>
              </div>
            </div>
          </div>

          {/* Custom Lists */}
          {customLists.length > 0 && (
            <div className="mt-2">
              <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1`}>My Lists</div>
              <div className="space-y-1">
                {customLists.map((list) => (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                      activeSidebar === list.name 
                        ? darkMode ? "bg-green-900" : "bg-green-50" 
                        : ""
                    }`}
                    onClick={() => handleSidebarItemClick(list.name)}
                  >
                    <div className="flex items-center">
                      <List className="w-5 h-5 mr-3" />
                      <span>{list.name}</span>
                    </div>
                    <button
                      className={`p-1 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the parent onClick
                        deleteList(list.id)
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today Tasks Dashboard */}
          <TaskDashboard />
        </div>
      </div>

      {/* Add List Section - Moved Outside Sidebar */}
      <div className="absolute left-64 bottom-6 z-10">
        {showNewListInput ? (
          <div className={`flex items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-2 rounded-md shadow-md ml-2`}>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className={`px-3 py-2 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} border rounded-md mr-2 w-48`}
              onKeyPress={(e) => e.key === "Enter" && addList(newListName)}
              autoFocus
            />
            <button className="p-2 text-green-600" onClick={() => {
              if (addList(newListName)) {
                setNewListName("")
                setShowNewListInput(false)
              }
            }}>
              <Plus className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} onClick={cancelAddList}>
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            className={`flex items-center px-3 py-2 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-md shadow-md ml-2`}
            onClick={() => setShowNewListInput(true)}
          >
            <Plus className="w-5 h-5 mr-3" />
            <span>Add List</span>
          </button>
        )}
      </div>
    </>
  )
}

export default Sidebar