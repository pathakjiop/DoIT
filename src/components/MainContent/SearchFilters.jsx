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
  )
}

export default SearchFilters
