import {combineReducers} from 'redux'
import auth from './auth'
import noticeBoard from './noticeBoard'
import coursesNoticeBoard from './coursesNoticeBoard'
import attendance from './attendance'
import assignment from './assignment'

export default combineReducers({
  auth,
  noticeBoard,
  coursesNoticeBoard,
  attendance,
  assignment
})