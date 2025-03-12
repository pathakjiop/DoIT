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
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-60 transition-transform duration-300 ease-in-out ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } border-r`}>
        <div className={`p-3 flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b`}>
          <div className="text-green-600 font-bold text-lg flex items-center">
            <span className="text-green-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-check"><path d="M12 21V7"/><path d="m16 12 2 2 4-4"/><path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3"/></svg>
            </span>
          Taskly
          </div>
          {/* Close button for mobile view */}
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2">
          {/* Default Lists */}
          <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1 mt-1`}>My Tasks</div>
          <div className="space-y-1">
            {[
              { name: "All Tasks", icon: <List className="w-4 h-4 mr-2" /> },
              { name: "Today", icon: <Calendar className="w-4 h-4 mr-2" /> },
              { name: "Important", icon: <Star className="w-4 h-4 mr-2" /> },
              { name: "Planned", icon: <Calendar className="w-4 h-4 mr-2" /> },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center px-3 py-1.5 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-md cursor-pointer ${
                  activeSidebar === item.name 
                    ? darkMode ? "bg-green-800 text-white" : "bg-green-100 text-green-700"
                    : ""
                }`}
                onClick={() => handleSidebarItemClick(item.name)}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Default List */}
          <div className="mt-4">
            <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1`}>Default List</div>
            <div className="space-y-1">
              <div
                className={`flex items-center px-3 py-1.5 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-md cursor-pointer ${
                  activeSidebar === "Default" 
                    ? darkMode ? "bg-green-800 text-white" : "bg-green-100 text-green-700"
                    : ""
                }`}
                onClick={() => handleSidebarItemClick("Default")}
              >
                <List className="w-4 h-4 mr-2" />
                <span className="text-sm">{defaultList.name}</span>
              </div>
            </div>
          </div>

          {/* Custom Lists */}
          {customLists.length > 0 && (
            <div className="mt-4">
              <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-1`}>My Lists</div>
              <div className="space-y-1">
                {customLists.map((list) => (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between px-3 py-1.5 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-md cursor-pointer ${
                      activeSidebar === list.name 
                        ? darkMode ? "bg-green-800 text-white" : "bg-green-100 text-green-700"
                        : ""
                    }`}
                    onClick={() => handleSidebarItemClick(list.name)}
                  >
                    <div className="flex items-center">
                      <List className="w-4 h-4 mr-2" />
                      <span className="text-sm">{list.name}</span>
                    </div>
                    <button
                      className={`p-0.5 rounded ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-500 hover:text-red-500 hover:bg-gray-200'}`}
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
          <div className="mt-4">
            <TaskDashboard />
          </div>
        </div>
      </div>

      {/* Add List Section - Moved Outside Sidebar */}
      <div className="absolute left-60 bottom-4 z-10">
        {showNewListInput ? (
          <div className={`flex items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-2 rounded-md shadow-md ml-2 border`}>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name"
              className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} border rounded-md mr-1 w-40 text-sm`}
              onKeyPress={(e) => e.key === "Enter" && addList(newListName)}
              autoFocus
            />
            <button className="p-1 text-green-600 hover:bg-green-50 rounded" onClick={() => {
              if (addList(newListName)) {
                setNewListName("")
                setShowNewListInput(false)
              }
            }}>
              <Plus className="w-4 h-4" />
            </button>
            <button className={`p-1 ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} rounded`} onClick={cancelAddList}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            className={`flex items-center px-3 py-1.5 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-md shadow-md ml-2 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onClick={() => setShowNewListInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm">Add List</span>
          </button>
        )}
      </div>
    </>
  )
}

export default Sidebar