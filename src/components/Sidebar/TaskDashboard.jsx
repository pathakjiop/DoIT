import { Clock } from 'lucide-react'
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"

const TaskDashboard = () => {
  const { darkMode } = useTheme()
  const { getPendingTasksByPriority, today } = useTasks()

  // Count of uncompleted tasks by priority
  const pendingTasksData = getPendingTasksByPriority()
  const pendingTasksCount = pendingTasksData.high + pendingTasksData.medium + pendingTasksData.low

  // Calculate the progress percentage for the chart
  const { tasks } = useTasks()
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

  return (
    <div className={`mt-2 p-3 ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-10 border-gray-200'} rounded-2xl shadow-lg border`}>
      <div className="flex items-center justify-between mb-2">
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

    
  )
}

export default TaskDashboard
