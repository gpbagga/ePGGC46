import {SET_COURSES_NOTICEBOARD,
  SET_SELECTED_COURSE,
  EMPTY_COURSES_NOTICEBOARD_STATE
} from '../action/action.types'

const initialState = {
  selectedCourse: null,   //not used
  courseNotices: null,
  courses_noticeId_Seen: null,  //only for students  {course:{noticeId: true/false},}
  courses_newNoticeCount: null  //only for students
}

export default (state = initialState, action) => {
  switch(action.type){
    case SET_SELECTED_COURSE:
      console.log('dispatch received coursesNoticeBoard',action.type, action.payload)
      return{
        ...state,
        selectedCourse: action.payload
      }
    case SET_COURSES_NOTICEBOARD:
      return {
        ...state,
        courseNotices: action.payload.courseNotices,
        courses_noticeId_Seen: {...state.courses_noticeId_Seen, ...action.payload.aCourse_noticeId_Seen},
        courses_newNoticeCount: {...state.courses_newNoticeCount, ...action.payload.aCourse_newNoticeCount}
      }
    
    case EMPTY_COURSES_NOTICEBOARD_STATE:
      return{
        selectedCourse: null,
        courseNotices: null,
        courses_noticeId_Seen: null,
        courses_newNoticeCount: null
      }
    default:
      return state; 
  }
}