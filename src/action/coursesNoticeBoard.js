import database from '@react-native-firebase/database'
import {SET_COURSES_NOTICEBOARD} from './action.types'
import {strLiterals} from '../utils/StringsInDatabase'

const areNotEqual = (obj1, obj2) => {
  if( !obj2){    //if obj2 is null
    return Object.keys(obj1).length !== 0    // obj1 can never be null)
      
  } 
  if(Object.keys(obj1).length !== Object.keys(obj2).length){
    return true
  }
  for(var k1 in obj1){
    if(obj1[k1] !== obj2[k1]){
      return true
    }
  }
  return false
}

export const addListener_aCourseNoticeBoard = (userDetails,course) => async(dispatch, getState) => {
  if(!userDetails){
    return
  }
  database()
    .ref(`${strLiterals.coursesNoticeBoard}/${course}`)
    .on('value', (snapshot) => {
      
      const noticeBoard = snapshot.val()
      if(noticeBoard){
        
        const noticesArr = []
        const noticeId_Seen = {}
        let CNBstate = getState().coursesNoticeBoard
        let noticeIdSeenState = CNBstate.courses_noticeId_Seen && CNBstate.courses_noticeId_Seen[course] ? CNBstate.courses_noticeId_Seen[course]: null
        if(!noticeIdSeenState && userDetails[strLiterals.receivedNotices] &&
          userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard] &&
          userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard][course]  
        )
        {
          noticeIdSeenState = userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard][course]
        }


        for(var noticeId in noticeBoard){

          const notice = noticeBoard[noticeId]

          if(noticeIdSeenState && Object.keys(noticeIdSeenState).includes(noticeId)) {
            noticesArr.push({...notice})
            noticeId_Seen[noticeId] = true
            continue
          }
          
          //else:-

          const targetGroups = notice[strLiterals.targetGroups]
          
          if(getReadFlag(userDetails, targetGroups, course)){
            noticesArr.push({...notice})
            noticeId_Seen[noticeId] = true
          }

        }

        noticesArr.sort((a, b) => {
          // greater is the timestamp, more recent is the notice
          return b[strLiterals.timestamp] - a[strLiterals.timestamp]
        })

        if(userDetails[strLiterals.designation] === strLiterals.student){

          database()
          .ref(`users/${userDetails.uid}/${strLiterals.receivedNotices}/${strLiterals.coursesNoticeBoard}/${course}`)
          .set(noticeId_Seen)
        }

        dispatch({
          type: SET_COURSES_NOTICEBOARD,
          payload: {
            courseNotices:[...noticesArr], 
            aCourse_noticeId_Seen: {[course]: {...noticeId_Seen}},
            aCourse_newNoticeCount: {[course]: 0}
          }
        })
      }else{
        // there is no notice in this course noticeBoard 

        database()
        .ref(`users/${userDetails.uid}/${strLiterals.receivedNotices}/${strLiterals.coursesNoticeBoard}/${course}`)
        .set(null)

        dispatch({
          type: SET_COURSES_NOTICEBOARD,
          payload: {
            courseNotices:[], 
            aCourse_noticeId_Seen: {[course]: {}},
            aCourse_newNoticeCount: {[course]: 0}
          }
        })

      }
    })
}

export const removeListener_aCourseNoticeBoard = (course) => async(dispatch) => {
  database()
    .ref(`${strLiterals.coursesNoticeBoard}/${course}`)
    .off()
}

const getReadFlag = (userDetails, targetGroups, course) => {
  let readFlag = false
  
  const target_Dept_YearArr = Object.keys(targetGroups)
  
  if(userDetails.designation === strLiterals.teacher){

    const myGroups = userDetails[strLiterals.courses][course]
    const my_Dept_YearArr = Object.keys(myGroups)
    
    for(const item of my_Dept_YearArr.values()){
      if(target_Dept_YearArr.includes(item)){
        
        //now check targetSections
        const targetSections = targetGroups[item].split(',')
        const mySections = myGroups[item].split(',')

        for(const section of mySections.values()){
          if(targetSections.includes(section)){

            readFlag = true
            break
          }
        }
        if(readFlag){
          break
        }
      }
    }

  }
  else if(userDetails[strLiterals.designation] === strLiterals.student){
    for(const targetDeptYear of target_Dept_YearArr.values()){
      const a = targetDeptYear.split(' ')
      
      if(a[0] === userDetails[strLiterals.dept] && a[1] === userDetails[strLiterals.year]){
        //now check section
        const targetSections = targetGroups[targetDeptYear].split(',')
        if(targetSections.includes(userDetails[strLiterals.section])){
          readFlag = true
          break
        }
      }
    }
  }

  return readFlag
}

const getCourses = (userDetails) =>{
  if(userDetails.designation === strLiterals.teacher){
    return Object.keys(userDetails[strLiterals.courses])
  }
  else if(userDetails.designation === strLiterals.student){
    return userDetails[strLiterals.courses]
  }
}

//export const addListeners_allCoursesNoticeBoard = (userDetails, getCoursesNoticeIdSeenState) => async(dispatch) =>{
export const addListeners_allCoursesNoticeBoard = (userDetails) => async(dispatch, getState) =>{

  if(!userDetails){
    return
  }
  
  const courses = getCourses(userDetails)
  for( i = 0; i< courses.length; i++){

    const course = courses[i]

    database()
    .ref(`${strLiterals.coursesNoticeBoard}/${course}`)
    .on('value', (snapshot) => {
      const noticeBoard = snapshot.val()
      const course = snapshot.key
      const ref = database()
      .ref(`users/${userDetails.uid}/${strLiterals.receivedNotices}/${strLiterals.coursesNoticeBoard}/${course}`)
      
      const CNBstate = getState().coursesNoticeBoard   

      if(noticeBoard){
        let newNoticeCount = 0
        //const noticesArr = []
        const noticeId_Seen = {}

        let noticeIdSeenState = (CNBstate.courses_noticeId_Seen && CNBstate.courses_noticeId_Seen[course]) ? CNBstate.courses_noticeId_Seen[course]: null

        if(!noticeIdSeenState && userDetails[strLiterals.receivedNotices] &&
          userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard] &&
          userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard][course]  
        )
        {
          noticeIdSeenState = userDetails[strLiterals.receivedNotices][strLiterals.coursesNoticeBoard][course]
        }


        for(var noticeId in noticeBoard){

          const notice = noticeBoard[noticeId]

          if(noticeIdSeenState && Object.keys(noticeIdSeenState).includes(noticeId)) {
            //noticesArr.push({...notice})
            noticeId_Seen[noticeId] = noticeIdSeenState[noticeId]
            if(!noticeId_Seen[noticeId]){
              newNoticeCount += 1
            }

            continue
          }
          
          //else:-

          const targetGroups = notice[strLiterals.targetGroups]
          
          if(getReadFlag(userDetails, targetGroups, course)){
            //noticesArr.push({...notice})
            noticeId_Seen[noticeId] = false
            newNoticeCount += 1
          }

        }

        // noticesArr.sort((a, b) => {
        //   // greater is the timestamp, more recent is the notice
        //   return b[strLiterals.timestamp] - a[strLiterals.timestamp]
        // })

        if( userDetails[strLiterals.designation] === strLiterals.student &&
          ( (!CNBstate.courses_noticeId_Seen && Object.keys(noticeId_Seen).length !== 0) 
            || areNotEqual(noticeId_Seen, noticeIdSeenState) ) )
        {
                  
          ref.set(noticeId_Seen)          
  
          dispatch({
            type: SET_COURSES_NOTICEBOARD,
            payload: {
              courseNotices: [],
              aCourse_noticeId_Seen: {[course]: {...noticeId_Seen}},
              aCourse_newNoticeCount: {[course]: newNoticeCount}
            }
          })
        }
        
      }else{
        // there is no notice in this course noticeBoard 

        if(userDetails[strLiterals.designation] === strLiterals.student && 
          (CNBstate.courses_noticeId_Seen && CNBstate.courses_noticeId_Seen[course] && Object.keys(CNBstate.courses_noticeId_Seen[course]).length !== 0 )  
        ){

          ref.set(null)
  
          dispatch({
            type: SET_COURSES_NOTICEBOARD,
            payload: {
              courseNotices:[],
              aCourse_noticeId_Seen: {[course]: {}},
              aCourse_newNoticeCount: {[course]: 0}
            }
          })
        }
        
      }
    })
  }
} 

export const removeListeners_allCoursesNoticeBoard = (userDetails) => async(dispatch) => {
  
  if(!userDetails){
    return
  }

  const courses = getCourses(userDetails)
  for(i = 0; i< courses.length; i++){
    const course = courses[i]
    database()
    .ref(`${strLiterals.coursesNoticeBoard}/${course}`)
    .off()
  }
  
}
