import database from '@react-native-firebase/database'
import {SET_ASSIGNMENT_STATE, SET_DUE_ASSIGNMENTS, SET_STUDENTS_SUBMISSIONS} from './action.types'
import {strLiterals} from '../utils/StringsInDatabase'

export const addListener_aCourseAssignments = (userDetails,course) => async(dispatch, getState) => {
  if(!userDetails){
    return
  }
  database()
    .ref(`${strLiterals.assignments}/${course}`)
    .on('value', (snapshot) => {
      const assignments = snapshot.val()
      const isStudent = userDetails[strLiterals.designation] === strLiterals.student
      if(assignments){
        
        const assignmentsArr = []
        const assignmentId_Seen = {}

        const ASSstate = getState().assignment
        let assignmentIdSeenState = (ASSstate.courses_assignmentId_seen && ASSstate.courses_assignmentId_seen[course]) ? ASSstate.courses_assignmentId_seen[course] : null
        if(isStudent && !assignmentIdSeenState && userDetails[strLiterals.receivedAssignments] &&
          userDetails[strLiterals.receivedAssignments][course] 
        )
        {
          assignmentIdSeenState = userDetails[strLiterals.receivedAssignments][course] 
        }


        for(var assignmentId in assignments){

          const assignment = assignments[assignmentId]
          assignment.assignmentId = assignmentId

          if(assignmentIdSeenState && Object.keys(assignmentIdSeenState).includes(assignmentId)) {
            assignmentsArr.push({...assignment})
            assignmentId_Seen[assignmentId] = true
            continue
          }
          
          //else:-

          const targetGroups = assignment[strLiterals.targetGroups]
          
          if(getReadFlag(userDetails, targetGroups, course)){
            assignmentsArr.push({...assignment})
            assignmentId_Seen[assignmentId] = true
          }

        }

        assignmentsArr.sort((a, b) => {
          // greater is the timestamp, more recent is the notice
          return b[strLiterals.timestamp] - a[strLiterals.timestamp]
        })

        if(isStudent){

          database()
          .ref(`users/${userDetails.uid}/${strLiterals.receivedAssignments}/${course}`)
          .set(assignmentId_Seen)
        }

        dispatch({
          type: SET_ASSIGNMENT_STATE,
          payload: {
            assignments:[...assignmentsArr], 
            aCourse_assignmentId_Seen: isStudent ? ({[course]: {...assignmentId_Seen}}): null,
            aCourse_newAssignmentCount: isStudent ? ({[course]: 0}): null
          }
        })
      }else{
        // there is no assignment in this course assignmentBoard

        if(isStudent){
          database()
          .ref(`users/${userDetails.uid}/${strLiterals.receivedAssignments}/${course}`)
          .set(null)
        }

        dispatch({
          type: SET_ASSIGNMENT_STATE,
          payload: {
            assignments:[], 
            aCourse_assignmentId_Seen: isStudent ? {[course]: {}} : null,
            aCourse_newAssignmentCount: isStudent ? {[course]: 0} : null
          }
        })
      }
    })
}

// never used
export const removeListener_aCourseAssignments = (course) => async(dispatch) => {
  database()
    .ref(`${strLiterals.assignments}/${course}`)
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

export const addListeners_allCoursesAssignments = (userDetails) => async(dispatch, getState) =>{

  if(!userDetails || userDetails[strLiterals.designation] !== strLiterals.student){
    return
  }

  //////Here only student can occur because this function is called only when user is a student
  
  const courses = getCourses(userDetails)
  
  for( i = 0; i< courses.length; i++){

    const course = courses[i]

    database()
    .ref(`${strLiterals.assignments}/${course}`)
    .on('value', (snapshot) => {
      const assignments = snapshot.val()
      const course = snapshot.key
      const ref = database()
      .ref(`users/${userDetails.uid}/${strLiterals.receivedAssignments}/${course}`)
            
      const ASSstate = getState().assignment

      if(assignments){
        let newAssignmentCount = 0
        
        const dueAssignments = []
        const assignmentId_Seen = {}

        let assignmentIdSeenState = (ASSstate.courses_assignmentId_seen && ASSstate.courses_assignmentId_seen[course]) ? ASSstate.courses_assignmentId_seen[course] : null
        //console.log(ASSstate,'\n', course, ASSstate.courses_assignmentId_seen )
        
        if(!assignmentIdSeenState && userDetails[strLiterals.receivedAssignments] &&
          userDetails[strLiterals.receivedAssignments][course]  
        )
        {
          assignmentIdSeenState = userDetails[strLiterals.receivedAssignments][course] 
        }

        for(var assignmentId in assignments){

          const assignment = assignments[assignmentId]
          assignment.assignmentId = assignmentId

          if(assignmentIdSeenState && Object.keys(assignmentIdSeenState).includes(assignmentId)) {
            //noticesArr.push({...notice})
            assignmentId_Seen[assignmentId] = assignmentIdSeenState[assignmentId]
            if(!assignmentId_Seen[assignmentId]){
              newAssignmentCount += 1
            }

            if(!assignment[strLiterals.submissions] || !assignment[strLiterals.submissions][userDetails.uid]){
              dueAssignments.push(assignment)
            }

            continue
          }
          
          //else:-

          const targetGroups = assignment[strLiterals.targetGroups]
          
          if(getReadFlag(userDetails, targetGroups, course)){
            //noticesArr.push({...notice})
            assignmentId_Seen[assignmentId] = false
            newAssignmentCount += 1

            if(!assignment[strLiterals.submissions] || !assignment[strLiterals.submissions][userDetails.uid]){
              dueAssignments.push(assignment)
            }
          }

        }

        if((!ASSstate.courses_assignmentId_seen && Object.keys(assignmentId_Seen).length !== 0) 
            || areNotEqual(assignmentId_Seen, assignmentIdSeenState) ){
          
          ref.set(assignmentId_Seen)  
  
          //Here only student can occur because this function is called only when user is a student
          dispatch({
            type: SET_ASSIGNMENT_STATE,
            payload: {
              assignments: [],
              aCourse_assignmentId_Seen: {[course]: {...assignmentId_Seen}},
              aCourse_newAssignmentCount: {[course]: newAssignmentCount}
            }
          })
        }

        if((!ASSstate.dueAssignments && dueAssignments.length !== 0) || 
            (ASSstate.dueAssignments && 
              ( (ASSstate.dueAssignments[course] && ASSstate.dueAssignments[course].toString() !== dueAssignments.toString()) 
              || (!ASSstate.dueAssignments[course] && dueAssignments.length !== 0)  )
            ) 
        ){
          
          dispatch({
            type: SET_DUE_ASSIGNMENTS,
            payload: {course: course, dueAssignments: (dueAssignments.length > 0 && [...dueAssignments]) || null }
          })
        }


      }else{
        // there is no assignment in this course assignment board

        ref.set(null)

        if(ASSstate.courses_assignmentId_seen && ASSstate.courses_assignmentId_seen[course] && Object.keys(ASSstate.courses_assignmentId_seen[course]).length !== 0 ){
          
          dispatch({
            type: SET_ASSIGNMENT_STATE,
            payload: {
              assignments:[],
              aCourse_assignmentId_Seen: {[course]: {}},
              aCourse_newAssignmentCount: {[course]: 0}
            }
          })
        }
        
        if(ASSstate.dueAssignments && ASSstate.dueAssignments[course]){   // we haven't stored an empty array in dueAssignments[course] in state
          
          dispatch({
            type: SET_DUE_ASSIGNMENTS,
            payload: {course: course, dueAssignments: null }
          })
        }

      }
    })
  }
} 

export const removeListeners_allCoursesAssignments = (userDetails) => async(dispatch) => {
  
  if(!userDetails){
    return
  }

  const courses = getCourses(userDetails)
  for(i = 0; i< courses.length; i++){
    const course = courses[i]
    database()
    .ref(`${strLiterals.assignments}/${course}`)
    .off()
  }
  
}

export const addStudentsSubmissionsListener = (assignmentId, course) => async(dispatch) => {
  
  const reqArray = []
  database().ref(`${strLiterals.assignments}/${course}/${assignmentId}/${strLiterals.submissions}`)
  .on('value', (snapshot) => {
    if(snapshot.val()){
      const submissionsObj = snapshot.val() 
      for(var id in submissionsObj){
        const studentId = id
        const obj = {studentId, filesObj: submissionsObj[studentId]}
        database()
        .ref(`users/${studentId}/${strLiterals.name}`)
        .once('value')
        .then(snapshot => {
          if(snapshot.val()){
            obj.name = snapshot.val() 
          }
          database().ref(`users/${studentId}/${strLiterals.rollNo}`)
          .once('value')
          .then(snapshot=>{
            if(snapshot.val()){
              obj.rollNo = parseInt(snapshot.val().split('/')[0])
            }
            reqArray.push({...obj})
            if(reqArray.length === Object.keys(submissionsObj).length){
              dispatch({
                type: SET_STUDENTS_SUBMISSIONS,
                payload: reqArray
              })
            }
            //console.log('End from listeners of attendanceRegister')
          })
        })
      }
    }
    else{
      dispatch({
        type: SET_STUDENTS_SUBMISSIONS,
        payload: []
      })
    }
  })

}

export const removeStudentsSubmissionsListener = (assignmentId, course) => async(dispatch) => {
  database().ref(`${strLiterals.assignments}/${course}/${assignmentId}/${strLiterals.submissions}`)
  .off()
}
