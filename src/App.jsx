import { useState } from 'react';
import { Calendar, CheckSquare, Grid, List, Plus, Search, Square, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  // State for tasks
  const [tasks, setTasks] = useState([]);

  // State for new task input
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  
  // State for active sidebar item
  const [activeSidebar, setActiveSidebar] = useState("Today");
  
  // State for custom lists
  const [customLists, setCustomLists] = useState([
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" }
  ]);
  
  // State for new list input
  const [newListName, setNewListName] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  
  // State for task date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // State for calendar modal
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter tasks based on active sidebar and search
  const filteredTasks = () => {
    let filtered = tasks;
    
    // Apply search filter if search is active
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(task => 
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Apply sidebar filters only if not searching
      switch(activeSidebar) {
        case "All Tasks":
          // No additional filtering needed
          break;
        case "Today":
          filtered = filtered.filter(task => task.date === today);
          break;
        case "Important":
          filtered = filtered.filter(task => task.important);
          break;
        case "Planned":
          filtered = filtered.filter(task => task.date && task.date >= today);
          break;
        case "Assigned to me":
          // For this demo, we'll consider all tasks as assigned
          break;
        default:
          // Check if it's a custom list
          const customList = customLists.find(list => list.name === activeSidebar);
          if (customList) {
            // In a real app, you would filter by list ID
            // For demo, we'll just show all tasks
          }
      }
    }
    
    return filtered;
  };

  // Count of uncompleted tasks
  const pendingTasksCount = tasks.filter(task => !task.completed && task.date === today).length;
  
  // Toggle task completion
  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Toggle task importance
  const toggleImportant = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, important: !task.important } : task
    ));
  };
  
  // Add new task
  const addTask = () => {
    if (newTaskText.trim() !== "") {
      const newTask = {
        id: Date.now(), // Use timestamp for unique ID
        text: newTaskText,
        completed: false,
        important: false,
        date: newTaskDate || today
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText("");
      setNewTaskDate("");
      setShowDatePicker(false);
    }
  };
  
  // Add new list
  const addList = () => {
    if (newListName.trim() !== "") {
      const newList = {
        id: customLists.length + 1,
        name: newListName
      };
      setCustomLists([...customLists, newList]);
      setNewListName("");
      setShowNewListInput(false);
    }
  };
  
  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - 1);
    setCurrentMonth(date);
  };

  const nextMonth = () => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + 1);
    setCurrentMonth(date);
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      // Start new selection
      setSelectedDateRange({ start: clickedDate, end: null });
    } else {
      // Complete the selection
      if (clickedDate < selectedDateRange.start) {
        // If clicked before start, swap them
        setSelectedDateRange({ start: clickedDate, end: selectedDateRange.start });
      } else {
        setSelectedDateRange({ ...selectedDateRange, end: clickedDate });
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const applyDateRange = () => {
    // Filter tasks by date range and update view
    if (selectedDateRange.start && selectedDateRange.end) {
      const startDate = formatDate(selectedDateRange.start);
      const endDate = formatDate(selectedDateRange.end);
      
      // Create a custom filter based on date range
      setActiveSidebar(`${startDate} to ${endDate}`);
      
      // Close the calendar
      setShowCalendar(false);
    }
  };

  // Filter tasks by date range
  const filterTasksByDateRange = (tasks, start, end) => {
    if (!start || !end) return tasks;
    
    return tasks.filter(task => {
      if (!task.date) return false;
      return task.date >= formatDate(start) && task.date <= formatDate(end);
    });
  };

  // Custom filter for date range
  const finalFilteredTasks = () => {
    let filtered = filteredTasks();
    
    // Apply date range filter if applicable
    if (activeSidebar.includes(' to ') && selectedDateRange.start && selectedDateRange.end) {
      filtered = filterTasksByDateRange(
        filtered,
        selectedDateRange.start,
        selectedDateRange.end
      );
    }
    
    return filtered;
  };
  
  // Calculate the progress percentage for the chart
  const todayTasks = tasks.filter(task => task.date === today);
  const completedPercentage = todayTasks.length > 0 
    ? Math.round((todayTasks.filter(task => task.completed).length / todayTasks.length) * 100) 
    : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100">
        <div className="p-4 flex items-center">
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

          <div className="space-y-1">
            {[
              { name: "All Tasks", icon: <List className="w-5 h-5 mr-3" /> },
              { name: "Today", icon: <Calendar className="w-5 h-5 mr-3" /> },
              { name: "Important", icon: <Star className="w-5 h-5 mr-3" /> },
              { name: "Planned", icon: <Calendar className="w-5 h-5 mr-3" /> },
              { name: "Assigned to me", icon: <List className="w-5 h-5 mr-3" /> }
            ].map(item => (
              <div 
                key={item.name}
                className={`flex items-center px-3 py-2 text-gray-700 rounded-md cursor-pointer ${
                  activeSidebar === item.name ? "bg-green-50" : ""
                }`}
                onClick={() => setActiveSidebar(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          
          {/* Custom Lists */}
          {customLists.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase text-gray-500 font-semibold pl-2 mb-2">My Lists</div>
              <div className="space-y-1">
                {customLists.map(list => (
                  <div 
                    key={list.id}
                    className={`flex items-center px-3 py-2 text-gray-700 rounded-md cursor-pointer ${
                      activeSidebar === list.name ? "bg-green-50" : ""
                    }`}
                    onClick={() => setActiveSidebar(list.name)}
                  >
                    <List className="w-5 h-5 mr-3" />
                    <span>{list.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            {showNewListInput ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md mr-2"
                  onKeyPress={(e) => e.key === 'Enter' && addList()}
                  autoFocus
                />
                <button 
                  className="p-2 text-green-600"
                  onClick={addList}
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-500"
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListName("");
                  }}
                >
                  <X className="w-5 h-5" 
                  onClick={() => setShowNewListInput(false)}
                  />
                </button>
              </div>
            ) : (
              <button 
                className="flex items-center px-3 py-2 text-gray-700 rounded-md w-full hover:bg-gray-50"
                onClick={() => setShowNewListInput(true)}
              >
                <Plus className="w-3 h-5 mr-3" />
                <span>Add list</span>
              </button>
            )}
          </div>

          <div className="mt-8 p-4 bg-white rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Today Tasks</div>
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">i</div>
            </div>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>

            <div className="mt-4 relative w-full h-24 flex justify-center">
              <div className="w-24 h-24 rounded-full border-[16px] border-green-200 absolute"></div>
              <div 
                className="w-24 h-24 rounded-full absolute"
                style={{
                  background: `conic-gradient(#047857 ${completedPercentage}%, transparent 0%)`,
                  clipPath: 'circle(50% at 50% 50%)',
                  transform: 'scale(0.75)'
                }}
              ></div>
              <div className="absolute flex items-center justify-center h-24 text-lg font-bold">
                {completedPercentage}%
              </div>
            </div>

            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                <span>Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white">
          {/* Search Bar */}
          {showSearch ? (
            <div className="flex-1 flex items-center">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 outline-none"
                autoFocus
              />
              <button 
                className="p-2 text-gray-500"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1"></div>
          )}
          
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Task Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* To Do Dropdown */}
            <div className="mb-6">
              <button className="flex items-center text-gray-700 font-medium">
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
            <div className="bg-white rounded-md shadow-sm mb-6 ">
              <div className="p-4 ">
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Enter Task here to add...."
                    className="w-full outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                  <button 
                    className="bg-green-100 text-green-800 px-4 py-1 rounded-md text-sm"
                    onClick={addTask}
                  >
                    ADD TASK
                  </button>
                  
                  {/* Date Picker */}
                  {showDatePicker && (
                    <div className="flex items-center mt-2">
                      <label className="mr-2 text-gray-600">Due date:</label>
                      <input
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        min={today}
                        className="border border-gray-200 rounded-md px-2 py-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results Message */}
            {searchQuery && (
              <div className="mb-4 text-gray-500">
                Showing results for "{searchQuery}" ({finalFilteredTasks().length} tasks found)
              </div>
            )}

            {/* Task List */}
            <div className="space-y-4">
              {/* Uncompleted Tasks */}
              <div className="space-y-1">
                {finalFilteredTasks().filter(task => !task.completed).length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {searchQuery ? "No matching tasks found" : "No tasks to show"}
                  </div>
                ) : (
                  finalFilteredTasks().filter(task => !task.completed).map(task => (
                    <TaskItem 
                      key={task.id} 
                      text={task.text} 
                      date={task.date}
                      completed={task.completed} 
                      isImportant={task.important}
                      onToggleComplete={() => toggleComplete(task.id)}
                      onToggleImportant={() => toggleImportant(task.id)}
                    />
                  ))
                )}
              </div>

              {/* Completed Section */}
              {finalFilteredTasks().some(task => task.completed) && (
                <div className="mt-8">
                  <div className="text-gray-700 mb-2">Completed</div>
                  <div className="space-y-1">
                    {finalFilteredTasks().filter(task => task.completed).map(task => (
                      <TaskItem 
                        key={task.id} 
                        text={task.text} 
                        date={task.date}
                        completed={task.completed} 
                        isImportant={task.important}
                        onToggleComplete={() => toggleComplete(task.id)}
                        onToggleImportant={() => toggleImportant(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Date Range</h2>
              <button 
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowCalendar(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {/* Calendar 1 */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-medium">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 text-sm py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days of the week before the first day of the month */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, index) => (
                    <div key={`empty-start-${index}`} className="h-10"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateString = formatDate(date);
                    const isToday = dateString === today;
                    const isStart = selectedDateRange.start && formatDate(selectedDateRange.start) === dateString;
                    const isEnd = selectedDateRange.end && formatDate(selectedDateRange.end) === dateString;
                    const isInRange = selectedDateRange.start && selectedDateRange.end && 
                                    dateString >= formatDate(selectedDateRange.start) && 
                                    dateString <= formatDate(selectedDateRange.end);
                    
                    return (
                      <div 
                        key={`day-${day}`}
                        className={`h-10 flex items-center justify-center rounded-full cursor-pointer text-sm
                          ${isToday ? 'border border-blue-400' : ''}
                          ${isStart || isEnd ? 'bg-green-600 text-white' : ''}
                          ${isInRange && !isStart && !isEnd ? 'bg-green-100' : ''}
                          ${!isStart && !isEnd && !isInRange ? 'hover:bg-gray-100' : ''}
                        `}
                        onClick={() => handleDateClick(day)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
              
             
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div>
                {selectedDateRange.start && (
                  <div className="text-sm text-gray-600">
                    Selected: {formatDate(selectedDateRange.start)} 
                    {selectedDateRange.end ? ` to ${formatDate(selectedDateRange.end)}` : ''}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowCalendar(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
  );
}

function TaskItem({ text, date, completed = false, isImportant = false, onToggleComplete, onToggleImportant }) {
  // Format the date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    const taskDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time part for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) return "Today";
    if (taskDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    
    // Otherwise return formatted date
    const options = { month: 'short', day: 'numeric' };
    return taskDate.toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
      <div className="flex items-center">
        <div onClick={onToggleComplete} className="cursor-pointer">
          {completed ? (
            <CheckSquare className="w-5 h-5 text-green-600 mr-3" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 mr-3" />
          )}
        </div>
        <div>
          <span className={completed ? "text-gray-500 line-through" : "text-gray-700"}>{text}</span>
          {date && (
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(date)}
            </div>
          )}
        </div>
      </div>
      <div onClick={onToggleImportant} className="cursor-pointer">
        <Star className={`w-5 h-5 ${isImportant ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      </div>
    </div>
  );
}

export default App;