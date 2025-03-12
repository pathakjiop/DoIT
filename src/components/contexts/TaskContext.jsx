import { createContext, useState, useContext, useEffect } from "react"

const TaskContext = createContext()

export const useTasks = () => useContext(TaskContext)

export const TaskProvider = ({ children }) => {
  // State for tasks
  const [tasks, setTasks] = useState([])
  
  // State for active sidebar item
  const [activeSidebar, setActiveSidebar] = useState("Today")
  
  // State for custom lists
  const [customLists, setCustomLists] = useState([
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" },
  ])
  
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
  
  // State for expanded task (for subtasks view)
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  
  // State for view mode (list or kanban)
  const [viewMode, setViewMode] = useState("list") // "list" or "kanban"
  
  // State for kanban columns
  const [kanbanColumns, setKanbanColumns] = useState([
    { id: "todo", name: "To Do", tasks: [] },
    { id: "inprogress", name: "In Progress", tasks: [] },
    { id: "done", name: "Done", tasks: [] }
  ])
  
  // State for calendar
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

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
      if (!confirmDelete) {
        return
      }
      
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

  // Add new list
  const addList = (newListName) => {
    if (newListName.trim() !== "") {
      const newList = {
        id: Date.now(), // Unique ID for each list
        name: newListName,
      }
      setCustomLists([...customLists, newList])
      return true
    }
    return false
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

  // Filter tasks by date range
  const filterTasksByDateRange = (tasksToFilter, start, end) => {
    if (!start || !end) {
      return tasksToFilter
    }

    return tasksToFilter.filter((task) => {
      if (!task.date) {
        return false
      }
      return task.date >= formatDate(start) && task.date <= formatDate(end)
    })
  }

  // Format date
  const formatDate = (date) => {
    if (!date) {
      return ""
    }
    return date.toISOString().split("T")[0]
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

  // Add a new task
  const addTask = (newTask) => {
    if (newTask.text.trim() !== "") {
      setTasks([newTask, ...tasks])
      return true
    }
    return false
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      today,
      activeSidebar,
      setActiveSidebar,
      customLists,
      searchQuery,
      setSearchQuery,
      showSearch,
      setShowSearch,
      searchFilters,
      viewMode,
      setViewMode,
      kanbanColumns,
      expandedTaskId,
      setExpandedTaskId,
      selectedDateRange,
      setSelectedDateRange,
      currentMonth,
      setCurrentMonth,
      filteredTasks,
      getTasksGroupedByDate,
      formatDateForDisplay,
      getPendingTasksByPriority,
      toggleComplete,
      moveTaskToColumn,
      toggleSubtaskComplete,
      toggleImportant,
      deleteTask,
      deleteSubtask,
      addList,
      deleteList,
      getAllTags,
      toggleSearchFilter,
      formatDate,
      finalFilteredTasks,
      addTask
    }}>
      {children}
    </TaskContext.Provider>
  )
}
