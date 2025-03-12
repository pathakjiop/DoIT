import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"

const SearchFilters = () => {
  const { darkMode } = useTheme()
  const { 
    searchFilters, 
    toggleSearchFilter, 
    customLists, 
    getAllTags 
  } = useTasks()

  return (
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
       </div>
    </div>
  )
}

export default SearchFilters
