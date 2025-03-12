import { CheckSquare, Square, Star, Trash, X, Clock } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"

const TaskItem = ({
  task,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  onToggleSubtaskComplete,
  onDeleteSubtask,
  isExpanded,
  onToggleExpand,
  allTasks
}) => {
  const { darkMode } = useTheme()

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

export default TaskItem
