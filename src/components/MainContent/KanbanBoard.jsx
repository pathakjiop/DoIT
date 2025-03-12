import { useTasks } from "../contexts/TaskContext"
import { useTheme } from "../contexts/ThemeContext"
import KanbanCard from "./KanbanCard"
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Column component with drop functionality
const KanbanColumn = ({ id, name, tasks, onToggleComplete, onToggleImportant, onDelete, onMove }) => {
  const { darkMode } = useTheme()
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => onMove(item.id, id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })
  
  return (
    <div 
      ref={drop}
      className={`flex-1 min-w-[200px] ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-md p-3 ${
        isOver ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{name}</h3>
        <span className={`text-sm px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <KanbanCard 
            key={task.id}
            task={task}
            onToggleComplete={() => onToggleComplete(task.id)}
            onToggleImportant={() => onToggleImportant(task.id)}
            onDelete={() => onDelete(task.id)}
            onMove={(columnId) => onMove(task.id, columnId)}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className={`border-2 border-dashed rounded-md p-4 text-center ${
            darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
          }`}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}

const KanbanBoard = () => {
  const { darkMode } = useTheme()
  const { 
    kanbanColumns, 
    toggleComplete, 
    toggleImportant, 
    deleteTask, 
    moveTaskToColumn 
  } = useTasks()
  
  // Handle moving a task to a different column
  const handleMoveTask = (taskId, columnId) => {
    moveTaskToColumn(taskId, columnId)
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              name={column.name}
              tasks={column.tasks}
              onToggleComplete={toggleComplete}
              onToggleImportant={toggleImportant}
              onDelete={deleteTask}
              onMove={handleMoveTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  )
}

export default KanbanBoard
