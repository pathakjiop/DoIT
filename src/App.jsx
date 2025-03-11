"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckSquare, Grid, List, Plus, Search, Square, Star, X, ChevronLeft, ChevronRight, Trash, Clock, ChevronDown, RepeatIcon, Moon, Sun, Columns, LayoutList, Menu } from 'lucide-react'

function App() {
  // State for tasks
  const [tasks, setTasks] = useState([])

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

  // State for active sidebar item
  const [activeSidebar, setActiveSidebar] = useState("Today")

  // State for custom lists
  const [customLists, setCustomLists] = useState([
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" },
  ])

  // Default list
  const defaultList = { id: 0, name: "Default" }

  // State for new list input
  const [newListName, setNewListName] = useState("")
  const [showNewListInput, setShowNewListInput] = useState(false)

  // State for search
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    priority: [],
    list: [],
    tags: [],
    completed: null,
    recurring: null,
  })
  const [showSearchFilters, setShowSearchFilters] = useState(false)

  // State for task date picker
  const [showDatePicker, setShowDatePicker] = useState(false)

  // State for calendar modal
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null })
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // State for expanded task (for subtasks view)
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  // State for dark mode
  const [darkMode, setDarkMode] = useState(false)

  // State for view mode (list or kanban)
  const [viewMode, setViewMode] = useState("list") // "list" or "kanban"

  // State for kanban columns
  const [kanbanColumns, setKanbanColumns] = useState([
    { id: "todo", name: "To Do", tasks: [] },
    { id: "inprogress", name: "In Progress", tasks: [] },
    { id: "done", name: "Done", tasks: [] }
  ])

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Update Kanban columns when tasks change
  useEffect(() => {
    const todoTasks = tasks.filter(task => !task.completed && !task.inProgress)
    const inProgressTasks = tasks.filter(task => !task.completed && task.inProgress)
    const doneTasks = tasks.filter(task => task.completed)

    setKanbanColumns([
      { id: "todo", name: "To Do", tasks: todoTasks },
      { id: "inprogress", name: "In Progress", tasks: inProgressTasks },
      { id: "done", name: "Done", tasks: doneTasks }
    ])
  }, [tasks])

  // Check for tasks with due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      tasks.forEach(task => {
        if (task.reminder && !task.reminderShown) {
          const reminderTime = new Date(task.reminder)
          if (reminderTime <= now) {
            // In a real app, this would show a notification
            alert(`Reminder: ${task.text} is due soon!`)
            
            // Mark reminder as shown
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id ? { ...t, reminderShown: true } : t
              )
            )
          }
        }
      })
    }

    // Check reminders every minute
    const intervalId = setInterval(checkReminders, 60000)
    
    // Initial check
    checkReminders()
    
    return () => clearInterval(intervalId)
  }, [tasks])

  // Process recurring tasks
  useEffect(() => {
    const processRecurringTasks = () => {
      const today = new Date().toISOString().split('T')[0]
      
      tasks.forEach(task => {
        if (task.recurring && task.lastGenerated) {
          const lastGenerated = new Date(task.lastGenerated)
          const nextDate = new Date(lastGenerated)
          
          // Calculate next occurrence based on recurring pattern
          switch(task.recurring.type) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1)
              break
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7)
              break
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1)
              break
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1)
              break
          }
          
          const nextDateStr = nextDate.toISOString().split('T')[0]
          
          // If it's time to generate the next occurrence and we haven't already
          if (nextDateStr <= today) {
            const newTask = {
              id: Date.now(),
              text: task.text,
              completed: false,
              important: task.important,
              date: nextDateStr,
              priority: task.priority,
              list: task.list,
              lastGenerated: nextDateStr,
              parentId: task.id
            }
            
            setTasks(prevTasks => [...prevTasks, newTask])
            
            // Update the last generated date on the original task
            setTasks(prevTasks => 
              prevTasks.map(t => 
                t.id === task.id ? { ...t, lastGenerated: nextDateStr } : t
              )
            )
          }
        }
      })
    }
    
    // Process recurring tasks daily
    const intervalId = setInterval(processRecurringTasks, 86400000) // 24 hours
    
    // Initial processing
    processRecurringTasks()
    
    return () => clearInterval(intervalId)
  }, [tasks])

  // Filter tasks based on active sidebar and search
  const filteredTasks = () => {
    let filtered = tasks

    // Apply search filter if search is active
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((task) => task.text.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Apply additional search filters
      if (searchFilters.priority.length > 0) {
        filtered = filtered.filter(task => searchFilters.priority.includes(task.priority))
      }
      
      if (searchFilters.list.length > 0) {
        filtered = filtered.filter(task => searchFilters.list.includes(task.list))
      }
      
      if (searchFilters.tags.length > 0) {
        filtered = filtered.filter(task => 
          task.tags && task.tags.some(tag => searchFilters.tags.includes(tag))
        )
      }
      
      if (searchFilters.completed !== null) {
        filtered = filtered.filter(task => task.completed === searchFilters.completed)
      }
      
      if (searchFilters.recurring !== null) {
        filtered = filtered.filter(task => !!task.recurring === searchFilters.recurring)
      }
    } else {
      // Apply sidebar filters only if not searching
      switch (activeSidebar) {
        case "All Tasks":
          // No additional filtering needed
          break
        case "Today":
          filtered = filtered.filter((task) => task.date === today)
          break
        case "Important":
          filtered = filtered.filter((task) => task.important)
          break
        case "Planned":
          // Show tasks for today and upcoming days (next 30 days)
          const nextMonth = new Date()
          nextMonth.setDate(nextMonth.getDate() + 30)
          const nextMonthStr = nextMonth.toISOString().split("T")[0]
          
          filtered = filtered.filter((task) => 
            task.date && task.date >= today && task.date <= nextMonthStr
          )
          break
        case "Assigned to me":
          // For this demo, we'll consider all tasks as assigned
          break
        default:
          // Check if it's a custom list or the default list
          if (activeSidebar === "Default") {
            filtered = filtered.filter(task => task.list === "default")
          } else {
            const customList = customLists.find((list) => list.name === activeSidebar)
            if (customList) {
              filtered = filtered.filter(task => task.list === customList.name)
            }
          }
      }
    }

    // Sort by priority (high first, then medium, then low)
    return filtered.sort((a, b) => {
      const priorityValues = { high: 3, medium: 2, low: 1 }
      return priorityValues[b.priority || "medium"] - priorityValues[a.priority || "medium"]
    })
  }

  // Group tasks by date for Planned view
  const getTasksGroupedByDate = () => {
    const filtered = filteredTasks()
    const grouped = {}
    
    filtered.forEach(task => {
      if (task.date) {
        if (!grouped[task.date]) {
          grouped[task.date] = []
        }
        grouped[task.date].push(task)
      }
    })
    
    // Sort dates
    return Object.keys(grouped)
      .sort()
      .map(date => ({
        date,
        formattedDate: formatDateForDisplay(date),
        tasks: grouped[date]
      }))
  }

  // Format date for display in Planned view
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ""
    
    const taskDate = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Reset time part for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)
    
    if (taskDate.getTime() === today.getTime()) {
      return "Today"
    }
    if (taskDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    }
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeek = days[taskDate.getDay()]
    
    // Format date
    const options = { month: 'long', day: 'numeric' }
    const formattedDate = taskDate.toLocaleDateString('en-US', options)
    
    return `${dayOfWeek}, ${formattedDate}`
  }

  // Count of uncompleted tasks by priority
  const getPendingTasksByPriority = () => {
    const pendingTasks = tasks.filter((task) => !task.completed && task.date === today)
    return {
      high: pendingTasks.filter((task) => task.priority === "high").length,
      medium: pendingTasks.filter((task) => task.priority === "medium").length,
      low: pendingTasks.filter((task) => task.priority === "low").length,
    }
  }

  const pendingTasksData = getPendingTasksByPriority()
  const pendingTasksCount = pendingTasksData.high + pendingTasksData.medium + pendingTasksData.low

  // Toggle task completion
  const toggleComplete = (id) => {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        const newCompletedState = !task.completed
        
        // If task has dependencies, check if we can complete it
        if (newCompletedState && task.dependsOn) {
          const dependencyTask = tasks.find(t => t.id === task.dependsOn)
          if (dependencyTask && !dependencyTask.completed) {
            alert("You need to complete the dependency task first!")
            return task
          }
        }
        
        // If completing a task, also remove inProgress status
        if (newCompletedState) {
          return { ...task, completed: newCompletedState, inProgress: false }
        }
        
        return { ...task, completed: newCompletedState }
      }
      return task
    }))
  }


  // Move task between kanban columns
  const moveTaskToColumn = (taskId, columnId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (columnId === 'todo') {
          return { ...task, completed: false, inProgress: false }
        } else if (columnId === 'inprogress') {
          return { ...task, completed: false, inProgress: true }
        } else if (columnId === 'done') {
          return { ...task, completed: true, inProgress: false }
        }
      }
      return task
    }))
  }

  // Toggle subtask completion
  const toggleSubtaskComplete = (taskId, subtaskId) => {
    setTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        )
        return { ...task, subtasks: updatedSubtasks }
      }
      return task
    }))
  }

  // Toggle task importance
  const toggleImportant = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, important: !task.important } : task)))
  }

  // Delete task
  const deleteTask = (id) => {
    // Check if any tasks depend on this one
    const dependentTasks = tasks.filter(task => task.dependsOn === id)
    if (dependentTasks.length > 0) {
      const confirmDelete = window.confirm("This task has dependent tasks. Deleting it will remove the dependency. Continue?")
      if (!confirmDelete) return
      
      // Remove the dependency from dependent tasks
      setTasks(tasks.map(task => 
        task.dependsOn === id ? { ...task, dependsOn: null } : task
      ).filter(task => task.id !== id))
    } else {
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  // Delete subtask
  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId)
        return { ...task, subtasks: updatedSubtasks }
      }
      return task
    }))
  }

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
  const addTask = () => {
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
      setTasks([newTask, ...tasks])
      setNewTaskText("")
      setNewTaskDate("")
      setNewTaskPriority("medium")
      setNewTaskList("default")
      setNewTaskTags([])
      setNewSubtasks([])
      setNewTaskRecurring(null)
      setNewTaskReminder(null)
      setNewTaskDependsOn(null)
      setShowDatePicker(false)
      setShowSubtaskInput(false)
      setShowTagInput(false)
      setShowRecurringOptions(false)
      setShowReminderOptions(false)
      setShowDependencyOptions(false)
    }
  }

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    const date = new Date(currentMonth)
    date.setMonth(date.getMonth() - 1)
    setCurrentMonth(date)
  }

  const nextMonth = () => {
    const date = new Date(currentMonth)
    date.setMonth(date.getMonth() + 1)
    setCurrentMonth(date)
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      // Start new selection
      setSelectedDateRange({ start: clickedDate, end: null })
    } else {
      // Complete the selection
      if (clickedDate < selectedDateRange.start) {
        // If clicked before start, swap them
        setSelectedDateRange({ start: clickedDate, end: selectedDateRange.start })
      } else {
        setSelectedDateRange({ ...selectedDateRange, end: clickedDate })
      }
    }
  }

  const formatDate = (date) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  const applyDateRange = () => {
    // Filter tasks by date range and update view
    if (selectedDateRange.start && selectedDateRange.end) {
      const startDate = formatDate(selectedDateRange.start)
      const endDate = formatDate(selectedDateRange.end)

      // Create a custom filter based on date range
      setActiveSidebar(`${startDate} to ${endDate}`)

      // Close the calendar
      setShowCalendar(false)
    }
  }

  // Filter tasks by date range
  const filterTasksByDateRange = (tasks, start, end) => {
    if (!start || !end) return tasks

    return tasks.filter((task) => {
      if (!task.date) return false
      return task.date >= formatDate(start) && task.date <= formatDate(end)
    })
  }

  // Custom filter for date range
  const finalFilteredTasks = () => {
    let filtered = filteredTasks()

    // Apply date range filter if applicable
    if (activeSidebar.includes(" to ") && selectedDateRange.start && selectedDateRange.end) {
      filtered = filterTasksByDateRange(filtered, selectedDateRange.start, selectedDateRange.end)
    }

    return filtered
  }

  // Add a new list
  const addList = () => {
    if (newListName.trim() !== "") {
      const newList = {
        id: Date.now(), // Unique ID for each list
        name: newListName,
      }
      setCustomLists([...customLists, newList])
      setNewListName("")
      setShowNewListInput(false)
    }
  }

  // Handle cancel/close for Add List
  const cancelAddList = (e) => {
    // Stop event propagation to prevent triggering other click handlers
    if (e) e.stopPropagation()
    setShowNewListInput(false)
    setNewListName("")
  }

  // Delete a list
  const deleteList = (id) => {
    // If active sidebar is the list being deleted, switch to "Today"
    const listToDelete = customLists.find((list) => list.id === id)
    if (listToDelete && activeSidebar === listToDelete.name) {
      setActiveSidebar("Today")
    }
    
    // Update tasks that were in this list to move to default list
    if (listToDelete) {
      setTasks(tasks.map(task => 
        task.list === listToDelete.name ? { ...task, list: "default" } : task
      ))
    }
    
    setCustomLists(customLists.filter((list) => list.id !== id))
  }

  // Calculate the progress percentage for the chart
  const todayTasks = tasks.filter((task) => task.date === today)
  const completedPercentage =
    todayTasks.length > 0
      ? Math.round((todayTasks.filter((task) => task.completed).length / todayTasks.length) * 100)
      : 0

  // Get completion data by priority
  const getCompletionDataByPriority = () => {
    const highTasks = todayTasks.filter((task) => task.priority === "high")
    const mediumTasks = todayTasks.filter((task) => task.priority === "medium")
    const lowTasks = todayTasks.filter((task) => task.priority === "low")

    return {
      high: {
        total: highTasks.length,
        completed: highTasks.filter((task) => task.completed).length,
        percentage:
          highTasks.length > 0
            ? Math.round((highTasks.filter((task) => task.completed).length / highTasks.length) * 100)
            : 0,
      },
      medium: {
        total: mediumTasks.length,
        completed: mediumTasks.filter((task) => task.completed).length,
        percentage:
          mediumTasks.length > 0
            ? Math.round((mediumTasks.filter((task) => task.completed).length / mediumTasks.length) * 100)
            : 0,
      },
      low: {
        total: lowTasks.length,
        completed: lowTasks.filter((task) => task.completed).length,
        percentage:
          lowTasks.length > 0
            ? Math.round((lowTasks.filter((task) => task.completed).length / lowTasks.length) * 100)
            : 0,
      },
    }
  }

  const priorityCompletionData = getCompletionDataByPriority()

  // Get all unique tags from tasks
  const getAllTags = () => {
    const allTags = new Set()
    tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => allTags.add(tag))
      }
    })
    return Array.from(allTags)
  }

  // Toggle search filter
  const toggleSearchFilter = (type, value) => {
    setSearchFilters(prev => {
      const newFilters = { ...prev }
      
      if (type === 'priority' || type === 'list' || type === 'tags') {
        if (newFilters[type].includes(value)) {
          newFilters[type] = newFilters[type].filter(item => item !== value)
        } else {
          newFilters[type] = [...newFilters[type], value]
        }
      } else {
        // For boolean filters like completed and recurring
        newFilters[type] = newFilters[type] === value ? null : value
      }
      
      return newFilters
    })
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`flex flex-col md:flex-row h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } border-r`}>
        <div className={`p-4 flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
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
        </div>

        <div className="p-4">
          {/* Default Lists */}
          
          <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-2`}>My Tasks</div>
          <div className="space-y-1">
            {[
              { name: "All Tasks", icon: <List className="w-5 h-5 mr-3" /> },
              { name: "Today", icon: <Calendar className="w-5 h-5 mr-3" /> },
              { name: "Important", icon: <Star className="w-5 h-5 mr-3" /> },
              { name: "Planned", icon: <Calendar className="w-5 h-5 mr-3" /> },
              { name: "Assigned to me", icon: <List className="w-5 h-5 mr-3" /> },
            ].map((item) => (
              <div
                key={item.name}
                className={`flex items-center px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                  activeSidebar === item.name 
                    ? darkMode ? "bg-green-900" : "bg-green-50" 
                    : ""
                }`}
                onClick={() => setActiveSidebar(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Default List */}
          <div className="mt-4">
            <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-2`}>Default List</div>
            <div className="space-y-1">
              <div
                className={`flex items-center px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                  activeSidebar === "Default" 
                    ? darkMode ? "bg-green-900" : "bg-green-50" 
                    : ""
                }`}
                onClick={() => setActiveSidebar("Default")}
              >
                <List className="w-5 h-5 mr-3" />
                <span>{defaultList.name}</span>
              </div>
            </div>
          </div>

          {/* Custom Lists */}
          {customLists.length > 0 && (
            <div className="mt-4">
              <div className={`text-xs uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-semibold pl-2 mb-2`}>My Lists</div>
              <div className="space-y-1">
                {customLists.map((list) => (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between px-3 py-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'} rounded-md cursor-pointer ${
                      activeSidebar === list.name 
                        ? darkMode ? "bg-green-900" : "bg-green-50" 
                        : ""
                    }`}
                    onClick={() => setActiveSidebar(list.name)}
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
          <div className={`mt-3 p-3 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-10 border-gray-200'} rounded-2xl shadow-lg border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's Tasks</span>
              </div>
              <button>
                <div className={`w-6 h-6 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'} flex items-center justify-center text-xs font-bold cursor-pointer transition-colors`}>
                </div>
              </button>
            </div>
            <div className={`text-3xl font-extrabold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{pendingTasksCount}</div>

            <div className="mt-6">
              <div className="grid grid-cols-3 gap-4">
                {["high", "medium", "low"].map((priority) => (
                  <div key={priority} className="flex flex-col items-center gap-2">
                    <div
                      className={`relative w-16 h-16 rounded-full ${
                        priority === "high" 
                          ? darkMode ? "bg-red-900" : "bg-red-100" 
                          : priority === "medium" 
                            ? darkMode ? "bg-orange-900" : "bg-orange-100" 
                            : darkMode ? "bg-emerald-900" : "bg-emerald-100"
                      }`}
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          className={`${darkMode ? 'text-gray-700' : 'text-gray-200'} stroke-current`}
                          strokeWidth="6"
                          stroke="currentColor"
                          fill="transparent"
                          r="27"
                          cx="32"
                          cy="32"
                        />
                        <circle
                          className={`${
                            priority === "high"
                              ? "text-red-500"
                              : priority === "medium"
                                ? "text-orange-500"
                                : "text-emerald-500"
                          } stroke-current transition-all duration-1000 ease-in-out`}
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 27}
                          strokeDashoffset={2 * Math.PI * 27 * (1 - priorityCompletionData[priority].percentage / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="27"
                          cx="32"
                          cy="32"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-xs font-bold ${
                            priority === "high"
                              ? "text-red-500"
                              : priority === "medium"
                                ? "text-orange-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {priorityCompletionData[priority].percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          priority === "high"
                            ? "bg-red-500"
                            : priority === "medium"
                              ? "bg-orange-500"
                              : "bg-emerald-500"
                        }`}
                      ></div>
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                        {priority} ({pendingTasksData[priority]})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className={`flex justify-between items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Overall Completion</span>
                <span>{completedPercentage}%</span>
              </div>
              <div className={`w-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
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
              onKeyPress={(e) => e.key === "Enter" && addList()}
              autoFocus
            />
            <button className="p-2 text-green-600" onClick={addList}>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`h-16 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} border-b flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2`}>
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
                  setSearchFilters({
                    priority: [],
                    list: [],
                    tags: [],
                    completed: null,
                    recurring: null,
                  })
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
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setShowCalendar(!showCalendar)}>
              <Grid className="w-5 h-5" />
            </button>
            <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Search Filters */}
        {showSearch && showSearchFilters && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b p-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority Filters */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</h3>
                <div className="flex flex-wrap gap-2">
                  {["high", "medium", "low"].map(priority => (
                    <button
                      key={priority}
                      className={`px-3 py-1 text-xs rounded-full ${
                        searchFilters.priority.includes(priority)
                          ? priority === "high"
                            ? darkMode ? "bg-red-900 text-red-200 border-red-700" : "bg-red-100 text-red-800 border-red-300"
                            : priority === "medium"
                              ? darkMode ? "bg-orange-900 text-orange-200 border-orange-700" : "bg-orange-100 text-orange-800 border-orange-300"
                              : darkMode ? "bg-emerald-900 text-emerald-200 border-emerald-700" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      } border`}
                      onClick={() => toggleSearchFilter('priority', priority)}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* List Filters */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lists</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      searchFilters.list.includes("default")
                        ? darkMode ? "bg-blue-900 text-blue-200 border-blue-700" : "bg-blue-100 text-blue-800 border-blue-300"
                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    } border`}
                    onClick={() => toggleSearchFilter('list', "default")}
                  >
                    Default
                  </button>
                  {customLists.map(list => (
                    <button
                      key={list.id}
                      className={`px-3 py-1 text-xs rounded-full ${
                        searchFilters.list.includes(list.name)
                          ? darkMode ? "bg-blue-900 text-blue-200 border-blue-700" : "bg-blue-100 text-blue-800 border-blue-300"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      } border`}
                      onClick={() => toggleSearchFilter('list', list.name)}
                    >
                      {list.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tags Filters */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {getAllTags().map(tag => (
                    <button
                      key={tag}
                      className={`px-3 py-1 text-xs rounded-full ${
                        searchFilters.tags.includes(tag)
                          ? darkMode ? "bg-purple-900 text-purple-200 border-purple-700" : "bg-purple-100 text-purple-800 border-purple-300"
                          : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      } border`}
                      onClick={() => toggleSearchFilter('tags', tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Status Filters */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</h3>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      searchFilters.completed === true
                        ? darkMode ? "bg-green-900 text-green-200 border-green-700" : "bg-green-100 text-green-800 border-green-300"
                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    } border`}
                    onClick={() => toggleSearchFilter('completed', true)}
                  >
                    Completed
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      searchFilters.completed === false
                        ? darkMode ? "bg-yellow-900 text-yellow-200 border-yellow-700" : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    } border`}
                    onClick={() => toggleSearchFilter('completed', false)}
                  >
                    Pending
                  </button>
                </div>
              </div>
              
              {/* Recurring Filter */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recurring</h3>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      searchFilters.recurring === true
                        ? darkMode ? "bg-indigo-900 text-indigo-200 border-indigo-700" : "bg-indigo-100 text-indigo-800 border-indigo-300"
                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    } border`}
                    onClick={() => toggleSearchFilter('recurring', true)}
                  >
                    Recurring
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      searchFilters.recurring === false
                        ? darkMode ? "bg-gray-600 text-gray-200 border-gray-500" : "bg-gray-200 text-gray-800 border-gray-300"
                        : darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                    } border`}
                    onClick={() => toggleSearchFilter('recurring', false)}
                  >
                    One-time
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md shadow-sm mb-6`}>
      <div className="p-4">
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Enter Task here to add...."
            className={`w-full outline-none ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
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
                      ? darkMode ? "bg-orange-900 text-orange-200 border-orange-700" : "bg-orange-100 text-orange-800 border-orange-300"
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
                  {newSubtasks.map((subtask, index) => (
                    <li key={subtask.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Square className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-2`} />
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
          
          {/* Recurring Options */}
          {showRecurringOptions && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-3`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Recurring Schedule</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`px-3 py-2 text-sm rounded-md ${
                    newTaskRecurring && newTaskRecurring.type === 'daily'
                      ? darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  } border`}
                  onClick={() => setNewTaskRecurring({ type: 'daily' })}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded-md ${
                    newTaskRecurring && newTaskRecurring.type === 'weekly'
                      ? darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  } border`}
                  onClick={() => setNewTaskRecurring({ type: 'weekly' })}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded-md ${
                    newTaskRecurring && newTaskRecurring.type === 'monthly'
                      ? darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  } border`}
                  onClick={() => setNewTaskRecurring({ type: 'monthly' })}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded-md ${
                    newTaskRecurring && newTaskRecurring.type === 'yearly'
                      ? darkMode ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300'
                      : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  } border`}
                  onClick={() => setNewTaskRecurring({ type: 'yearly' })}
                >
                  Yearly
                </button>
              </div>
              {newTaskRecurring && (
                <button
                  className={`mt-2 px-3 py-1 text-xs ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                  onClick={() => setNewTaskRecurring(null)}
                >
                  Remove recurring
                </button>
              )}
            </div>
          )}
          
          {/* Reminder Options */}
          {showReminderOptions && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-3`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reminder</h3>
              <div className="flex items-center">
                <input
                  type="datetime-local"
                  value={newTaskReminder || ''}
                  onChange={(e) => setNewTaskReminder(e.target.value)}
                  className={`border ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} rounded-md px-2 py-1 text-sm`}
                />
                {newTaskReminder && (
                  <button
                    className={`ml-2 px-3 py-1 text-xs ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                    onClick={() => setNewTaskReminder(null)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Dependency Options */}
          {showDependencyOptions && (
            <div className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md p-3`}>
              <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Depends on</h3>
              {tasks.filter(task => !task.completed).length > 0 ? (
                <div>
                  <select
                    value={newTaskDependsOn || ''}
                    onChange={(e) => setNewTaskDependsOn(e.target.value ? Number(e.target.value) : null)}
                    className={`w-full border ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'} rounded-md px-2 py-1 text-sm`}
                  >
                    <option value="">Select a task</option>
                    {tasks
                      .filter(task => !task.completed)
                      .map(task => (
                        <option key={task.id} value={task.id}>
                          {task.text}
                        </option>
                      ))
                    }
                  </select>
                  {newTaskDependsOn && (
                    <button
                      className={`mt-2 px-3 py-1 text-xs ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                      onClick={() => setNewTaskDependsOn(null)}
                    >
                      Remove dependency
                    </button>
                  )}
                </div>
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No available tasks to depend on</p>
              )}
            </div>
          )}

          <button
            className={`${darkMode ? 'bg-green-800 text-green-100 hover:bg-green-700' : 'bg-green-100 text-green-800 hover:bg-green-200'} px-4 py-1 rounded-md text-sm font-medium`}
            onClick={addTask}
          >
            ADD TASK
          </button>
        </div>
      </div>
    </div>

    {/* Search Results Message */}
    {searchQuery && (
      <div className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Showing results for "{searchQuery}" ({finalFilteredTasks().length} tasks found)
      </div>
    )}

    {/* Task List or Kanban View */}
    {viewMode === 'list' ? (
      <>
        {/* List View */}
        {activeSidebar === "Planned" ? (
          /* Planned View - Group by Date */
          <div className="space-y-6">
            {getTasksGroupedByDate().map(group => (
              <div key={group.date} className="space-y-1">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                  {group.formattedDate}
                </h3>
                {group.tasks.filter(task => !task.completed).map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={() => toggleComplete(task.id)}
                    onToggleImportant={() => toggleImportant(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onToggleSubtaskComplete={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                    onDeleteSubtask={(subtaskId) => deleteSubtask(task.id, subtaskId)}
                    isExpanded={expandedTaskId === task.id}
                    onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    allTasks={tasks}
                    darkMode={darkMode}
                  />
                ))}
                {group.tasks.filter(task => task.completed).length > 0 && (
                  <div className="mt-2 pl-4">
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1 text-sm`}>Completed</div>
                    {group.tasks.filter(task => task.completed).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={() => toggleComplete(task.id)}
                        onToggleImportant={() => toggleImportant(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onToggleSubtaskComplete={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                        onDeleteSubtask={(subtaskId) => deleteSubtask(task.id, subtaskId)}
                        isExpanded={expandedTaskId === task.id}
                        onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        allTasks={tasks}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {getTasksGroupedByDate().length === 0 && (
              <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No upcoming tasks
              </div>
            )}
          </div>
        ) : (
          /* Regular List View */
          <div className="space-y-4">
            {/* Uncompleted Tasks */}
            <div className="space-y-1">
              {finalFilteredTasks().filter((task) => !task.completed).length === 0 ? (
                <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery ? "No matching tasks found" : "No tasks to show"}
                </div>
              ) : (
                finalFilteredTasks()
                  .filter((task) => !task.completed)
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={() => toggleComplete(task.id)}
                      onToggleImportant={() => toggleImportant(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onToggleSubtaskComplete={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                      onDeleteSubtask={(subtaskId) => deleteSubtask(task.id, subtaskId)}
                      isExpanded={expandedTaskId === task.id}
                      onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                      allTasks={tasks}
                      darkMode={darkMode}
                    />
                  ))
              )}
            </div>

            {/* Completed Section */}
            {finalFilteredTasks().some((task) => task.completed) && (
              <div className="mt-8">
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Completed</div>
                <div className="space-y-1">
                  {finalFilteredTasks()
                    .filter((task) => task.completed)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={() => toggleComplete(task.id)}
                        onToggleImportant={() => toggleImportant(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onToggleSubtaskComplete={(subtaskId) => toggleSubtaskComplete(task.id, subtaskId)}
                        onDeleteSubtask={(subtaskId) => deleteSubtask(task.id, subtaskId)}
                        isExpanded={expandedTaskId === task.id}
                        onToggleExpand={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        allTasks={tasks}
                        darkMode={darkMode}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </>
    ) : (
      /* Kanban View */
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kanbanColumns.map(column => (
          <div 
            key={column.id} 
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-md shadow-sm`}
          >
            <div className={`p-3 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} font-medium`}>
              {column.name} ({column.tasks.length})
            </div>
            <div className="p-2 min-h-[200px]">
              {column.tasks.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm italic`}>
                  No tasks
                </div>
              ) : (
                <div className="space-y-2">
                  {column.tasks.map(task => (
                    <KanbanCard 
                      key={task.id}
                      task={task}
                      onToggleComplete={() => toggleComplete(task.id)}
                      onToggleImportant={() => toggleImportant(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onMove={(columnId) => moveTaskToColumn(task.id, columnId)}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
        </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className={`fixed inset-0 ${darkMode ? 'bg-black' : 'bg-black'} bg-opacity-20 flex items-center justify-center z-50`}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Select Date Range</h2>
              <button className={`p-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setShowCalendar(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Calendar */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={prevMonth} className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  </button>
                  <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                  </h3>
                  <button onClick={nextMonth} className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className={`text-center font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm py-2`}>
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days of the week before the first day of the month */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map(
                    (_, index) => (
                      <div key={`empty-start-${index}`} className="h-10"></div>
                    ),
                  )}

                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map(
                    (_, index) => {
                      const day = index + 1
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                      const dateString = formatDate(date)
                      const isToday = dateString === today
                      const isStart = selectedDateRange.start && formatDate(selectedDateRange.start) === dateString
                      const isEnd = selectedDateRange.end && formatDate(selectedDateRange.end) === dateString
                      const isInRange =
                        selectedDateRange.start &&
                        selectedDateRange.end &&
                        dateString >= formatDate(selectedDateRange.start) &&
                        dateString <= formatDate(selectedDateRange.end)

                      return (
                        <div
                          key={`day-${day}`}
                          className={`h-10 flex items-center justify-center rounded-full cursor-pointer text-sm
                          ${isToday ? darkMode ? "border border-blue-500" : "border border-blue-400" : ""}
                          ${isStart || isEnd ? darkMode ? "bg-green-700 text-white" : "bg-green-600 text-white" : ""}
                          ${isInRange && !isStart && !isEnd ? darkMode ? "bg-green-900" : "bg-green-100" : ""}
                          ${!isStart && !isEnd && !isInRange ? darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-800" : ""}
                        `}
                          onClick={() => handleDateClick(day)}
                        >
                          {day}
                        </div>
                      )
                    },
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                {selectedDateRange.start && (
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Selected: {formatDate(selectedDateRange.start)}
                    {selectedDateRange.end ? ` to ${formatDate(selectedDateRange.end)}` : ""}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-md`}
                  onClick={() => setShowCalendar(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 ${darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md disabled:opacity-50`}
                  disabled={!selectedDateRange.start || !selectedDateRange.end}
                  onClick={applyDateRange}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskItem({
  task,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  onToggleSubtaskComplete,
  onDeleteSubtask,
  isExpanded,
  onToggleExpand,
  allTasks,
  darkMode
}) {
  // Format the date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) {
      return ""
    }

    const taskDate = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Reset time part for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)

    if (taskDate.getTime() === today.getTime()) {
      return "Today"
    }
    if (taskDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    }

    // Otherwise return formatted date
    const options = { month: "short", day: "numeric" }
    return taskDate.toLocaleDateString("en-US", options)
  }

  const priorityColors = {
    high: darkMode 
      ? "bg-red-900 text-red-200 border-red-700" 
      : "bg-red-100 text-red-800 border-red-300",
    medium: darkMode 
      ? "bg-orange-900 text-orange-200 border-orange-700" 
      : "bg-orange-100 text-orange-800 border-orange-300",
    low: darkMode 
      ? "bg-emerald-900 text-emerald-200 border-emerald-700" 
      : "bg-emerald-100 text-emerald-800 border-emerald-300",
  }

  // Get dependency task name if exists
  const getDependencyName = () => {
    if (!task.dependsOn) return null
    const dependencyTask = allTasks.find(t => t.id === task.dependsOn)
    return dependencyTask ? dependencyTask.text : "Unknown task"
  }

  // Format recurring type for display
  const getRecurringText = () => {
    if (!task.recurring) return null
    return `Repeats ${task.recurring.type}`
  }

  // Check if task has subtasks and if all are completed
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const allSubtasksCompleted = hasSubtasks && 
    task.subtasks.every(subtask => subtask.completed)
  
  // Calculate subtask completion percentage
  const subtaskCompletionPercentage = hasSubtasks
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0

  return (
    <div className={`border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div onClick={onToggleComplete} className="cursor-pointer">
            {task.completed ? (
              <CheckSquare className={`w-5 h-5 ${darkMode ? 'text-green-500' : 'text-green-600'} mr-3`} />
            ) : (
              <Square className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-3`} />
            )}
          </div>
          <div>
            <div className="flex items-center">
              <span className={task.completed 
                ? darkMode ? "text-gray-400 line-through" : "text-gray-500 line-through" 
                : darkMode ? "text-gray-200" : "text-gray-700"
              }>
                {task.text}
              </span>
              {hasSubtasks && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpand()
                  }}
                  className={`ml-2 text-xs px-2 py-0.5 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-full`}
                >
                  {subtaskCompletionPercentage}% ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {task.date && <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(task.date)}</div>}
              
              {/* List badge */}
              {task.list && (
                <div className={`text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'} px-2 py-0.5 rounded-full`}>
                  {task.list === "default" ? "Default" : task.list}
                </div>
              )}
              
              {/* Tags */}
              {task.tags && task.tags.map(tag => (
                <div key={tag} className={`text-xs ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-700'} px-2 py-0.5 rounded-full`}>
                  {tag}
                </div>
              ))}
              
              
              
              {/* In Progress badge */}
              {task.inProgress && !task.completed && (
                <div className={`text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'} px-2 py-0.5 rounded-full flex items-center`}>
                  <Clock className="w-3 h-3 mr-1" />
                  In Progress
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority]} border`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <button onClick={onToggleImportant} className="cursor-pointer">
            <Star className={`w-5 h-5 ${task.important ? "text-yellow-400 fill-yellow-400" : darkMode ? "text-gray-600" : "text-gray-300"}`} />
          </button>
          <button onClick={onDelete} className={`cursor-pointer ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}>
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Subtasks section */}
      {isExpanded && hasSubtasks && (
        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} p-3 pl-12 border-t`}>
          <h4 className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Subtasks</h4>
          <ul className="space-y-2">
            {task.subtasks.map(subtask => (
              <li key={subtask.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    onClick={() => onToggleSubtaskComplete(subtask.id)} 
                    className="cursor-pointer"
                  >
                    {subtask.completed ? (
                      <CheckSquare className={`w-4 h-4 ${darkMode ? 'text-green-500' : 'text-green-600'} mr-2`} />
                    ) : (
                      <Square className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-2`} />
                    )}
                  </div>
                  <span className={subtask.completed 
                    ? darkMode ? "text-gray-400 line-through text-sm" : "text-gray-500 line-through text-sm" 
                    : darkMode ? "text-gray-300 text-sm" : "text-gray-700 text-sm"
                  }>
                    {subtask.text}
                  </span>
                </div>
                <button 
                  onClick={() => onDeleteSubtask(subtask.id)}
                  className={`${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function KanbanCard({ task, onToggleComplete, onToggleImportant, onDelete, onMove, darkMode }) {
  const [showMenu, setShowMenu] = useState(false)
  
  // Format the date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return ""
    
    const taskDate = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Reset time part for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    taskDate.setHours(0, 0, 0, 0)
    
    if (taskDate.getTime() === today.getTime()) return "Today"
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow"
    
    // Otherwise return formatted date
    const options = { month: "short", day: "numeric" }
    return taskDate.toLocaleDateString("en-US", options)
  }
  
  const priorityColors = {
    high: darkMode 
      ? "bg-red-900 text-red-200 border-red-700" 
      : "bg-red-100 text-red-800 border-red-300",
    medium: darkMode 
      ? "bg-orange-900 text-orange-200 border-orange-700" 
      : "bg-orange-100 text-orange-800 border-orange-300",
    low: darkMode 
      ? "bg-emerald-900 text-emerald-200 border-emerald-700" 
      : "bg-emerald-100 text-emerald-800 border-emerald-300",
  }
  
  // Calculate subtask completion percentage
  const subtaskCompletionPercentage = task.subtasks && task.subtasks.length > 0
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : 0
  
  return (
    <div 
      className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-md p-3 shadow-sm relative`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`${task.completed ? (darkMode ? 'text-gray-400 line-through' : 'text-gray-500 line-through') : (darkMode ? 'text-gray-200' : 'text-gray-800')} font-medium`}>
          {task.text}
        </div>
        <div className="flex items-center">
          <button onClick={onToggleImportant} className="cursor-pointer mr-1">
            <Star className={`w-4 h-4 ${task.important ? "text-yellow-400 fill-yellow-400" : darkMode ? "text-gray-500" : "text-gray-300"}`} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div 
                className={`absolute right-0 top-6 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-md shadow-md py-1 w-40`}
              >
                <button 
                  className={`w-full text-left px-3 py-1 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => {
                    onToggleComplete()
                    setShowMenu(false)
                  }}
                >
                  {task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </button>
                
                {!task.completed && (
                  <>
                    <button 
                      className={`w-full text-left px-3 py-1 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => {
                        onMove('todo')
                        setShowMenu(false)
                      }}
                    >
                      Move to To Do
                    </button>
                    <button 
                      className={`w-full text-left px-3 py-1 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => {
                        onMove('inprogress')
                        setShowMenu(false)
                      }}
                    >
                      Move to In Progress
                    </button>
                  </>
                )}
                
                <button 
                  className={`w-full text-left px-3 py-1 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => {
                    onMove('done')
                    setShowMenu(false)
                  }}
                >
                  Move to Done
                </button>
                
                <div className={`my-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                
                <button 
                  className={`w-full text-left px-3 py-1 text-sm ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                  onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        <div className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]} border`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>
        
        {task.list && task.list !== 'default' && (
          <div className={`text-xs ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-50 text-blue-700'} px-2 py-0.5 rounded-full`}>
            {task.list}
          </div>
        )}
        
        {task.recurring && (
          <div className={`text-xs ${darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-700'} px-2 py-0.5 rounded-full flex items-center`}>
            <RepeatIcon className="w-3 h-3 mr-1" />
            {task.recurring.type}
          </div>
        )}
      </div>
      
      {task.subtasks && task.subtasks.length > 0 && (
        <div className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs flex items-center`}>
          <CheckSquare className="w-3 h-3 mr-1" />
          {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks ({subtaskCompletionPercentage}%)
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2 text-xs">
        {task.date && (
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formatDate(task.date)}
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map(tag => (
              <div key={tag} className={`text-xs ${darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-700'} px-1.5 py-0.5 rounded-full`}>
                {tag}
              </div>
            ))}
            {task.tags.length > 2 && (
              <div className={`text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} px-1.5 py-0.5 rounded-full`}>
                +{task.tags.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App