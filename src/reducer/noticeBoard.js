import {SET_NOTICEBOARD, EMPTY_NOTICEBOARD_STATE} from '../action/action.types'

const initialState = {
  notices: null,
  noticeId_Seen: null,
  newNoticeCount: null
}
//loading is there to indicate spinner on screen that onAuthStateChanged listening
//is listening to get authState 

export default (state = initialState, action) => {
  switch(action.type){
    case SET_NOTICEBOARD:
      return {
        ...state,
        notices: action.payload.notices,
        noticeId_Seen: action.payload.noticeId_Seen,
        newNoticeCount: action.payload.newNoticeCount
      }
    
    case EMPTY_NOTICEBOARD_STATE:
      return{
        notices: null,
        noticeId_Seen: null,
        newNoticeCount: null
      }

    default:
      return state; 
  }
}