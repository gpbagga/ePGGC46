import database from '@react-native-firebase/database'
import {SET_NOTICEBOARD} from './action.types'
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
  
// async(dispatch, getState) => {} is a function called 'thunk'
// addListener_NoticeBoard is called action creators
export const addListener_NoticeBoard = (userDetails, isNoticeBoardScreen) => async(dispatch, getState) => {
  
  if(!userDetails){     //means if userDetails is null   
    return
  }
  
  database()
  .ref(`${strLiterals.noticeBoard}`)
  .on('value', (snapshot) => {
  
    const noticeBoard = snapshot.val()
    
    const ref = database()
    .ref(`users/${userDetails.uid}/${strLiterals.receivedNotices}/${strLiterals.noticeBoard}`)
    
    let NBstate = getState().noticeBoard
    
    if(noticeBoard){
      const noticesArr = []
      const noticeId_Seen = {}
      let newNoticeCount = 0

      //let noticeIdSeenState = getNoticeIdSeenState()
      
      let noticeIdSeenState = NBstate.noticeId_Seen ? {...NBstate.noticeId_Seen} : null
      
      if(!noticeIdSeenState && userDetails[strLiterals.receivedNotices] &&
        userDetails[strLiterals.receivedNotices][strLiterals.noticeBoard])
      {
        noticeIdSeenState = userDetails[strLiterals.receivedNotices][strLiterals.noticeBoard]    
      }

      for(var noticeId in noticeBoard){
        //here notice is an object
        const notice = noticeBoard[noticeId]

        if(noticeIdSeenState && Object.keys(noticeIdSeenState).includes(noticeId)) {
          noticesArr.push({...notice})
          noticeId_Seen[noticeId] = isNoticeBoardScreen ? true : noticeIdSeenState[noticeId]

          if(!noticeId_Seen[noticeId]){
            newNoticeCount += 1
          }

          continue
        }

        let readFlag = false
        
        const targetDeptArr = notice[strLiterals.dept].split(',')
        const targetYearArr = notice[strLiterals.year].split(',')
        
        //students don't have noticeBoardPermissions in their user database

        // so first check if noticeBoardPermissions exist and then 
        // check read options of noticeBoardPermissions
        if(userDetails[strLiterals.noticeBoardPersmissions] && 
          userDetails[strLiterals.noticeBoardPersmissions][strLiterals.read]){

          // now we will try to find if my dept Arr and targetDeptArr have common element
          const readOptions = userDetails[strLiterals.noticeBoardPersmissions][strLiterals.read]
          for(const d of readOptions[strLiterals.dept].split(',').values()){
            if(targetDeptArr.includes(d)){
                // now we will try to find if myYearArr and targetYearArr have common element
              for(const y of readOptions[strLiterals.year].split(',').values()){
                if(targetYearArr.includes(y)){
                  
                  if(notice[strLiterals.section]){
                    
                    if(readOptions[strLiterals.section]){
                      for(const s of readOptions[strLiterals.section].split(',').values()){
                        if(notice[strLiterals.section].split(',').includes(s)){
                          //this means notice is meant to be for 's' too
                          readFlag = true
                          break
                        }
                      }
                      if(readFlag){
                        break //break from year loop
                      }
                      
                    }else{
                      // teacher can read notice meant for any section
                      readFlag = true
                      break //break from year loop
                    }
                  }else{

                    //notice is meant for all sections
                    readFlag = true
                    break
                  }
                  
                }  
              }
              if(readFlag){
                break
              }  
            }
          }

        }
        else if(userDetails[strLiterals.designation] === strLiterals.student){
          
          if(targetDeptArr.includes(userDetails[strLiterals.dept])){
            
            if(targetYearArr.includes(userDetails[strLiterals.year])){
              
              // if section does not exist in notice object or if it exists and also it contains my section in it
              if( !notice[strLiterals.section] ||
                (notice[strLiterals.section] &&
                notice[strLiterals.section].split(',').includes(userDetails[strLiterals.section])
                )
              ){
                
                readFlag = true
              }
            }
          }
        }
        
        if(readFlag){
          noticesArr.push({...notice})
          noticeId_Seen[noticeId] = isNoticeBoardScreen   //here false means new or not seen yet
          if(!isNoticeBoardScreen){
            newNoticeCount += 1
          }
        }

      }
      noticesArr.sort((a, b) => {
        // greater is the timestamp, more recent is the notice
        return b[strLiterals.timestamp] - a[strLiterals.timestamp]
      })

      if( (!NBstate.noticeId_Seen && Object.keys(noticeId_Seen).length !== 0) ||
          areNotEqual(noticeId_Seen, noticeIdSeenState))
      {

        ///Database UserDetails UPDATE/////////////
        ref.set(noticeId_Seen)
        
        /////////UPDATE REDUX STATE////////////////
        dispatch({
          type: SET_NOTICEBOARD,
          payload: {notices: [...noticesArr], 
            noticeId_Seen: {...noticeId_Seen}, newNoticeCount}
        })
        
      }

    }else{
      // there is no notice in noticeBoard in database

      ref.set(null)

      if(NBstate.noticeId_Seen && Object.keys(NBstate.noticeId_Seen).length !== 0 ){

        dispatch({
          type: SET_NOTICEBOARD,
          payload: {notices: [], 
            noticeId_Seen: {}, newNoticeCount: 0}
        })
      }
    }
  })
  
}



export const removeListener_NoticeBoard = () => async(dispatch) => {
  database()
  .ref(`${strLiterals.noticeBoard}`)
  .off()
}