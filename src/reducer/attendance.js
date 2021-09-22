import {SET_ATTENDANCE_TAKEN_DAYS, SET_STUDENTS_AND_ATTENDANCE,
SET_SELECTED_CLASS, SET_SELECTED_ATTENDANCE_COURSE, SET_SELECTED_DAY} from '../action/action.types'

const initialState = {
  selectedCourse: null,
  selectedClass: null,   //{department_year: BCA 1, section: B}
  selectedDay: null,     // day from the first day of attendance
  attendanceTakenDays: null,
  studentsInfo: null,    // [{studentId: ,name: , rollNo: , attendance(onSelectedDay): }]
}

export default (state = initialState, action) => {
  switch(action.type){
    case SET_SELECTED_ATTENDANCE_COURSE:
      return {
        ...state,
        selectedCourse: action.payload  
      }

    case SET_SELECTED_CLASS:
      return{
        ...state,
        selectedClass: action.payload
      }
    case SET_SELECTED_DAY:
      return{
        ...state,
        selectedDay: action.payload
      }
    case SET_ATTENDANCE_TAKEN_DAYS:
      return{
        ...state,
        attendanceTakenDays: action.payload
      }
    
    case SET_STUDENTS_AND_ATTENDANCE: 
      return{
        ...state,
        studentsInfo: action.payload
      }

    default:
        return state; 
  }
}