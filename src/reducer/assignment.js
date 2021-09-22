import {SET_ASSIGNMENT_STATE,
  EMPTY_ASSIGNMENT_STATE, SET_STUDENTS_SUBMISSIONS, SET_DUE_ASSIGNMENTS
} from '../action/action.types'

const initialState = {
  assignments : null,    //assignments obj for one course
  courses_assignmentId_seen: null,  //only for students  {course:{assignmentId: true/false},}
  courses_newAssignmentCount: null,  //only for students
  newAssignmentCountOverall: null,

  studentsSubmissions : null, //[{studentId:, name, rollNo, filesObj: {downloadURLs, names, types, timestamp} }]     //it will be an array with elements having students info and their submittedFiles

  dueAssignments: null      // for students {course1: [assignmentObj1, assignmentObj2,], }
}

export default (state = initialState, action) => {
  switch(action.type){
    case SET_ASSIGNMENT_STATE:
      let count = 0
      if(action.payload.aCourse_newAssignmentCount){
        count = Object.values(action.payload.aCourse_newAssignmentCount)[0]
        const course = Object.keys(action.payload.aCourse_newAssignmentCount)[0]
        if(state.courses_newAssignmentCount){
          for(var c in state.courses_newAssignmentCount){
            if(c !== course){
              count += state.courses_newAssignmentCount[c]
            }
          }
        }
      }  
      
      return{
        ...state,
        assignments: action.payload.assignments,
        courses_assignmentId_seen: {...state.courses_assignmentId_seen, ...action.payload.aCourse_assignmentId_Seen},
        courses_newAssignmentCount: {...state.courses_newAssignmentCount, ...action.payload.aCourse_newAssignmentCount},
        newAssignmentCountOverall: count
      }
    
    case SET_STUDENTS_SUBMISSIONS:
      return{
        ...state,
        studentsSubmissions: action.payload
      }
    case SET_DUE_ASSIGNMENTS:
      // here payload is {course: course, dueAssignments: null or [assObj1, assObj2,] } 
      const dueAssignmentsState = {...state.dueAssignments}
      if(action.payload.dueAssignments == null){
        delete dueAssignmentsState[action.payload.course]
      }else{
        dueAssignmentsState[action.payload.course] = [...action.payload.dueAssignments]
      }
      return{
        ...state,
        dueAssignments: {...dueAssignmentsState}
      }
    
    case EMPTY_ASSIGNMENT_STATE:
      return{
        assignments : null,
        courses_assignmentId_seen: null,  
        courses_newAssignmentCount: null,
        newAssignmentCountOverall: 0 ,
        studentsSubmissions:null ,
        dueAssignments: null,
      }

    default:
      return state; 
  }
}