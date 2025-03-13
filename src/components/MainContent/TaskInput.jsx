import { useState } from "react"
import { Calendar, CheckSquare, Plus, X } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"
import { format } from 'date-fns'

const TaskInput = () => {
  const { darkMode } = useTheme()
  const { today, customLists, addTask } = useTasks()

  // State for new task input
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium") // Default priority
  const [newTaskList, setNewTaskList] = useState("default") // Default list
  const [newTaskTags, setNewTaskTags] = useState([])
  const [newTaskTag, setNewTaskTag] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTaskRecurring, setNewTaskRecurring] = useState(null)
  const [newTaskReminder, setNewTaskReminder] = useState(null)
  const [newTaskDependsOn, setNewTaskDependsOn] = useState(null)
  const [showRecurringOptions, setShowRecurringOptions] = useState(false)
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  const [showDependencyOptions, setShowDependencyOptions] = useState(false)

  // State for subtasks
  const [newSubtasks, setNewSubtasks] = useState([])
  const [newSubtaskText, setNewSubtaskText] = useState("")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  // State for task date picker
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Add new subtask to the list of new subtasks
  const addNewSubtask = () => {
    if (newSubtaskText.trim() !== "") {
      const subtask = {
        id: Date.now(),
        text: newSubtaskText,
        completed: false
      }
      setNewSubtasks([...newSubtasks, subtask])
      setNewSubtaskText("")
    }
  }

  // Add new tag to the list of new tags
  const addNewTag = () => {
    if (newTaskTag.trim() !== "" && !newTaskTags.includes(newTaskTag.trim())) {
      setNewTaskTags([...newTaskTags, newTaskTag.trim()])
      setNewTaskTag("")
    }
  }

  // Date picker functions
  const handleDateSelection = (date) => {
    setSelectedDate(date)
    setNewTaskDate(format(date, 'yyyy-MM-dd'))
  }

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const startingDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
    
    const days = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>)
    }
    
    // Get today's date for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i)
      date.setHours(0, 0, 0, 0)
      
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() && 
        date.getMonth() === selectedDate.getMonth() && 
        date.getFullYear() === selectedDate.getFullYear()
      
      const isToday = 
        date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()
      
      days.push(
        <button
          key={i}
          onClick={() => handleDateSelection(date)}
          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs
            ${isSelected 
              ? 'bg-blue-500 text-white' 
              : isToday
                ? darkMode 
                  ? 'border border-gray-400 text-gray-200' 
                  : 'border border-gray-400 text-gray-800'
                : darkMode 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-gray-200 text-gray-800'
            }`}
        >
          {i}
        </button>
      )
    }
    
    return days
  }

  const changeMonth = (increment) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(selectedDate.getMonth() + increment)
    setSelectedDate(newDate)
  }

  // Add new task
  const handleAddTask = () => {
    if (newTaskText.trim() !== "") {
      const newTask = {
        id: Date.now(), // Use timestamp for unique ID
        text: newTaskText,
        completed: false,
        important: false,
        date: newTaskDate || today,
        priority: newTaskPriority,
        list: newTaskList,
        tags: newTaskTags.length > 0 ? newTaskTags : [],
        subtasks: newSubtasks.length > 0 ? newSubtasks : [],
        dependsOn: newTaskDependsOn,
        recurring: newTaskRecurring,
        reminder: newTaskReminder,
        lastGenerated: newTaskRecurring ? (newTaskDate || today) : null,
        inProgress: false,
      }
      
      if (addTask(newTask)) {
        // Reset form
        setNewTaskText("")
        setNewTaskDate("")
        setNewTaskPriority("medium")
        setNewTaskList("default")
        setNewTaskTags([])
        setNewSubtasks([])
        setNewTaskDependsOn(null)
        setShowDatePicker(false)
        setShowSubtaskInput(false)
        setShowTagInput(false)
        setShowRecurringOptions(false)
        setShowReminderOptions(false)
        setShowDependencyOptions(false)
      }
    }
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-sm mb-6`}>
      <div className="p-4">
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Enter Task here to add...."
            className={`w-full outline-none ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
          />

          <div className="flex justify-between items-center">
            {/* Priority Selection */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Priority:</span>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    newTaskPriority === "low"
                      ? darkMode ? "bg-emerald-900 text-emerald-200 border-emerald-700" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  } border`}
                  onClick={() => setNewTaskPriority("low")}
                >
                  Low
                </button>
                <button
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    newTaskPriority === "medium"
                      ? darkMode ? "bg-yellow-900 text-yellow-200 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  } border`}
                  onClick={() => setNewTaskPriority("medium")}
                >
                  Medium
                </button>
                <button
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    newTaskPriority === "high"
                      ? darkMode ? "bg-red-900 text-red-200 border-red-700" : "bg-red-100 text-red-800 border-red-300"
                      : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  } border`}
                  onClick={() => setNewTaskPriority("high")}
                >
                  High
                </button>
              </div>
            </div>

            {/* List Selection */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>List:</span>
              <select
                value={newTaskList}
                onChange={(e) => setNewTaskList(e.target.value)}
                className={`border ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} rounded-md px-2 py-1 text-sm`}
              >
                <option value="default">Default</option>
                {customLists.map(list => (
                  <option key={list.id} value={list.name}>{list.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="flex flex-wrap gap-2">
            {/* Date Picker Toggle */}
            <button
              className={`text-sm ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'} flex items-center px-3 py-1 rounded-full`}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {showDatePicker ? "Hide date" : "Add date"}
            </button>
            
            {/* Subtasks Toggle */}
            <button
              className={`text-sm ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'} flex items-center px-3 py-1 rounded-full`}
              onClick={() => setShowSubtaskInput(!showSubtaskInput)}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              {showSubtaskInput ? "Hide subtasks" : "Add subtasks"}
            </button>

           
          </div>

          {/* Date Picker */}
          {showDatePicker && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-2 max-w-xs`}>
              <div className="mb-1 flex justify-between items-center">
                <button 
                  onClick={() => changeMonth(-1)}
                  className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                >
                  &lt;
                </button>
                <div className={`text-xs font-medium text-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {format(selectedDate, 'MMMM yyyy')}
                </div>
                <button 
                  onClick={() => changeMonth(1)}
                  className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                >
                  &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className={`h-5 w-5 flex items-center justify-center text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {generateCalendarDays()}
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="text-xs truncate">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {format(selectedDate, 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    onClick={() => {
                      const today = new Date()
                      setSelectedDate(today)
                      setNewTaskDate(format(today, 'yyyy-MM-dd'))
                    }}
                  >
                    Today
                  </button>
                  <button
                    className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    onClick={() => {
                      setNewTaskDate("")
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Subtasks Input */}
          {showSubtaskInput && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-3`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subtasks</h3>
              {newSubtasks.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {newSubtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckSquare className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-2`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{subtask.text}</span>
                      </div>
                      <button 
                        className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                        onClick={() => setNewSubtasks(newSubtasks.filter(s => s.id !== subtask.id))}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Add a subtask"
                  className={`flex-1 border-b ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-800'} outline-none text-sm py-1`}
                  onKeyPress={(e) => e.key === "Enter" && addNewSubtask()}
                />
                <button 
                  className="ml-2 p-1 text-green-600"
                  onClick={addNewSubtask}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button
            className={`${darkMode ? 'bg-green-800 text-green-100 hover:bg-green-700' : 'bg-green-100 text-green-800 hover:bg-green-200'} px-4 py-1 rounded-md text-sm font-medium`}
            onClick={handleAddTask}
          >
            ADD TASK
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskInput