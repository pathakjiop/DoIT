"use client"

import { useState } from "react"
import { Star, Trash, CheckSquare } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useDrag } from "react-dnd"

const KanbanCard = ({ task, onToggleComplete, onToggleImportant, onDelete, onMove }) => {
  const { darkMode } = useTheme()
  const [showMenu, setShowMenu] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

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
    high: darkMode ? "bg-red-900 text-red-200 border-red-700" : "bg-red-100 text-red-800 border-red-300",
    medium: darkMode
      ? "bg-orange-900 text-orange-200 border-orange-700"
      : "bg-orange-100 text-orange-800 border-orange-300",
    low: darkMode
      ? "bg-emerald-900 text-emerald-200 border-emerald-700"
      : "bg-emerald-100 text-emerald-800 border-emerald-300",
  }

  // Calculate subtask completion percentage
  const subtaskCompletionPercentage =
    task.subtasks && task.subtasks.length > 0
      ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)
      : 0

  return (
    <div
      ref={drag}
      className={`${darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-650" : "bg-white border-gray-200 hover:bg-gray-50"} 
    border rounded-md p-3 shadow-sm relative cursor-grab ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div
          className={`${task.completed ? (darkMode ? "text-gray-400 line-through" : "text-gray-500 line-through") : darkMode ? "text-gray-200" : "text-gray-800"} font-medium`}
        >
          {task.text}
        </div>
        <div className="flex items-center">
          <button onClick={onToggleImportant} className="cursor-pointer mr-1">
            <Star
              className={`w-4 h-4 ${task.important ? "text-yellow-400 fill-yellow-400" : darkMode ? "text-gray-500" : "text-gray-300"}`}
            />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Trash 
                className="w-4 h-4"
                onClick={() => {
                    onDelete()
                    setShowMenu(false)
                  }}
                />
            </button>

            
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <div className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]} border`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>

        {task.list && task.list !== "default" && (
          <div
            className={`text-xs ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-700"} px-2 py-0.5 rounded-full`}
          >
            {task.list}
          </div>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className={`mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"} text-xs flex items-center`}>
          <CheckSquare className="w-3 h-3 mr-1" />
          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks (
          {subtaskCompletionPercentage}%)
        </div>
      )}

      <div className="flex justify-between items-center mt-2 text-xs">
        {task.date && <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>{formatDate(task.date)}</div>}

        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <div
                key={tag}
                className={`text-xs ${darkMode ? "bg-purple-900 text-purple-200" : "bg-purple-50 text-purple-700"} px-1.5 py-0.5 rounded-full`}
              >
                {tag}
              </div>
            ))}
            {task.tags.length > 2 && (
              <div
                className={`text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"} px-1.5 py-0.5 rounded-full`}
              >
                +{task.tags.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanCard

