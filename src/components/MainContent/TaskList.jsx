import { useTasks } from "../contexts/TaskContext"
import TaskItem from "./TaskItem"
import { useTheme } from "../contexts/ThemeContext"

const TaskList = () => {
  const { darkMode } = useTheme()
  const { 
    activeSidebar, 
    searchQuery, 
    finalFilteredTasks, 
    getTasksGroupedByDate,
    expandedTaskId,
    setExpandedTaskId,
    toggleComplete,
    toggleImportant,
    deleteTask,
    toggleSubtaskComplete,
    deleteSubtask,
    tasks
  } = useTasks()

  return (
    <>
      {/* Search Results Message */}
      {searchQuery && (
        <div className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing results for "{searchQuery}" ({finalFilteredTasks().length} tasks found)
        </div>
      )}

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
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default TaskList
