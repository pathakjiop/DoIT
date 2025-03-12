import { useState } from "react"
import { Calendar, CheckSquare, Plus, X } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"

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
  const [showRecurringOptions, setShowRecurringOptions] = useState(false)
  const [newTaskReminder, setNewTaskReminder] = useState(null)
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  const [newTaskDependsOn, setNewTaskDependsOn] = useState(null)
  const [showDependencyOptions, setShowDependencyOptions] = useState(false)

  // State for subtasks
  const [newSubtasks, setNewSubtasks] = useState([])
  const [newSubtaskText, setNewSubtaskText] = useState("")
  const [showSubtaskInput, setShowSubtaskInput] = useState(false)

  // State for task date picker
  const [showDatePicker, setShowDatePicker] = useState(false)

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
            <div className="flex items-center mt-2">
              <label className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Due date:</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                min={today}
                className={`border ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} rounded-md px-2 py-1 text-sm`}
              />
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
          
          {/* Tags Input */}
          {showTagInput && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-3`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags</h3>
              {newTaskTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {newTaskTags.map(tag => (
                    <div key={tag} className={`${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded-full text-xs flex items-center`}>
                      {tag}
                      <button 
                        className={`ml-1 ${darkMode ? 'text-purple-300 hover:text-purple-100' : 'text-purple-800 hover:text-purple-900'}`}
                        onClick={() => setNewTaskTags(newTaskTags.filter(t => t !== tag))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  placeholder="Add a tag"
                  className={`flex-1 border-b ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-800'} outline-none text-sm py-1`}
                  onKeyPress={(e) => e.key === "Enter" && addNewTag()}
                />
                <button 
                  className="ml-2 p-1 text-green-600"
                  onClick={addNewTag}
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
