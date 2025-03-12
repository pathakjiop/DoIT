import { useTasks } from "../contexts/TaskContext"
import KanbanCard from "./KanbanCard"
import { useTheme } from "../contexts/ThemeContext"

const KanbanBoard = () => {
  const { darkMode } = useTheme()
  const { 
    kanbanColumns, 
    toggleComplete, 
    toggleImportant, 
    deleteTask, 
    moveTaskToColumn 
  } = useTasks()

  return (
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard
