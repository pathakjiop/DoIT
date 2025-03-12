"use client"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useTasks } from "../contexts/TaskContext"

const CalendarModal = ({ setShowCalendar }) => {
  const { darkMode } = useTheme()
  const { selectedDateRange, setSelectedDateRange, currentMonth, setCurrentMonth, setActiveSidebar, formatDate } =
    useTasks()

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    const date = new Date(currentMonth)
    date.setMonth(date.getMonth() - 1)
    setCurrentMonth(date)
  }

  const nextMonth = () => {
    const date = new Date(currentMonth)
    date.setMonth(date.getMonth() + 1)
    setCurrentMonth(date)
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
      // Start new selection
      setSelectedDateRange({ start: clickedDate, end: null })
    } else {
      // Complete the selection
      if (clickedDate < selectedDateRange.start) {
        // If clicked before start, swap them
        setSelectedDateRange({ start: clickedDate, end: selectedDateRange.start })
      } else {
        setSelectedDateRange({ ...selectedDateRange, end: clickedDate })
      }
    }
  }

  const applyDateRange = () => {
    // Filter tasks by date range and update view
    if (selectedDateRange.start && selectedDateRange.end) {
      const startDate = formatDate(selectedDateRange.start)
      const endDate = formatDate(selectedDateRange.end)

      // Create a custom filter based on date range
      setActiveSidebar(`${startDate} to ${endDate}`)

      // Close the calendar
      setShowCalendar(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 ${darkMode ? "bg-black" : "bg-black"} bg-opacity-20 flex items-center justify-center z-50`}
    >
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Select Date Range</h2>
          <button
            className={`p-2 ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setShowCalendar(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Calendar */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={prevMonth}
                className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <ChevronLeft className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
              </button>
              <h3 className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <button
                onClick={nextMonth}
                className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <ChevronRight className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className={`text-center font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} text-sm py-2`}
                >
                  {day}
                </div>
              ))}

              {/* Empty cells for days of the week before the first day of the month */}
              {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map(
                (_, index) => (
                  <div key={`empty-start-${index}`} className="h-10"></div>
                ),
              )}

              {/* Days of the month */}
              {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map(
                (_, index) => {
                  const day = index + 1
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const dateString = formatDate(date)
                  const isToday = dateString === new Date().toISOString().split("T")[0]
                  const isStart = selectedDateRange.start && formatDate(selectedDateRange.start) === dateString
                  const isEnd = selectedDateRange.end && formatDate(selectedDateRange.end) === dateString
                  const isInRange =
                    selectedDateRange.start &&
                    selectedDateRange.end &&
                    dateString >= formatDate(selectedDateRange.start) &&
                    dateString <= formatDate(selectedDateRange.end)

                  return (
                    <div
                      key={`day-${day}`}
                      className={`h-10 flex items-center justify-center rounded-full cursor-pointer text-sm
                      ${isToday ? (darkMode ? "border border-blue-500" : "border border-blue-400") : ""}
                      ${isStart || isEnd ? (darkMode ? "bg-green-700 text-white" : "bg-green-600 text-white") : ""}
                      ${isInRange && !isStart && !isEnd ? (darkMode ? "bg-green-900" : "bg-green-100") : ""}
                      ${!isStart && !isEnd && !isInRange ? (darkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-800") : ""}
                    `}
                      onClick={() => handleDateClick(day)}
                    >
                      {day}
                    </div>
                  )
                },
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            {selectedDateRange.start && (
              <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Selected: {formatDate(selectedDateRange.start)}
                {selectedDateRange.end ? ` to ${formatDate(selectedDateRange.end)}` : ""}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 border ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-md`}
              onClick={() => setShowCalendar(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 ${darkMode ? "bg-green-700 hover:bg-green-600" : "bg-green-600 hover:bg-green-700"} text-white rounded-md disabled:opacity-50`}
              disabled={!selectedDateRange.start || !selectedDateRange.end}
              onClick={applyDateRange}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal

