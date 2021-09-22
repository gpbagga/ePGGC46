import {SET_ATTENDANCE_TAKEN_DAYS} from './action.types'
import database from "@react-native-firebase/database"
import {strLiterals} from '../utils/StringsInDatabase'
import Snackbar from 'react-native-snackbar'

// export const getSelectedClassAttendance = (selectedCourse, selectedClass) => async(dispatch) => {
//   try{
//     database()
//     .ref(`${strLiterals.attendance}/${selectedCourse}/${selectedClass.department_year}/${selectedClass.section}`)
//     .once('value')
//     .then((snapshot) => {
//       if(snapshot.val()){
//         const dbObj = snapshot.val()
//         const attendanceTakenDays = dbObj[strLiterals.attendanceTakenDays] ? dbObj[strLiterals.attendanceTakenDays] : []
//         const studentsInfo  = []

//         const studentIdsArray = Object.keys(dbObj).filter((item)=> item !== strLiterals.attendanceTakenDays )

//         for(const studentId of studentIdsArray.values()){
//           database()
//           .ref(`users/${studentId}`)
//           .once('value')
//           .then(snapshot => {
//             if(snapshot.val()){
//               const studentInfoObj = {
//                 studentId: studentId, 
//                 attendanceArray: Array.isArray(dbObj[studentId]) ? [...dbObj[studentId]]: [], // its value can be 'N' when there is no attendance taken
//               }
//               const {name, rollNo} = snapshot.val()
//               studentInfoObj.name = name
//               studentInfoObj.rollNo = rollNo
//               studentsInfo.push(studentInfoObj)

//               if(studentsInfo.length === studentIdsArray.length){

//                 dispatch({
//                   type: SET_SELECTED_CLASS_ATTENDANCE,
//                   payload: {
//                     attendanceTakenDays: attendanceTakenDays, 
//                     studentsInfo: studentsInfo
//                   }
//                 })

//               }
//             }
//           })
//         }

        
//       }else{
//         Snackbar.show({
//           text: 'This class does not exist in database',
//           textColor: 'white',
//           backgroundColor: 'red'
//         })
//       }
//     })
//   }catch(e){
//     console.log(e)
//   }
// }