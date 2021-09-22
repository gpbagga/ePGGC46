import auth from "@react-native-firebase/auth";

import {SET_USER, IS_AUTHENTICATED,EMPTY_ASSIGNMENT_STATE, EMPTY_NOTICEBOARD_STATE, EMPTY_COURSES_NOTICEBOARD_STATE} from './action.types'
//import Snackbar from "react-native-snackbar"
import showSnackbar from '../utils/showSnackbar'

//async(dispatch) function is a 'thunk'.
export const signIn = (data) => async (dispatch) => {
    console.log(data)
    const {username, password} = data
    const email = username + '@epggc.com'
    try{

      if(username.trim().length === 0 || password.trim().length === 0){
        showSnackbar('Please enter both fields','white','red')
        return
      }

      auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        //console.log("Sign In success")
        showSnackbar('Account signed in', 'white', '#1b262c')
      })
      .catch((error) => {
        console.error(error)
        showSnackbar('Sign-In failed. Maybe check ur Internet', 'white', 'red')
      })
    }catch(e){
      
    }
}

export const signOut = () => async (dispatch) => {
    auth()
    .signOut()
    .then(() => {
      dispatch({
        type: IS_AUTHENTICATED,
        payload: false
      })
      dispatch({
        type: SET_USER,
        payload: null
      })
      dispatch({
        type: EMPTY_NOTICEBOARD_STATE,
        payload: null
      })
      dispatch({
        type: EMPTY_COURSES_NOTICEBOARD_STATE,
        payload: null
      })
      dispatch({
        type: EMPTY_ASSIGNMENT_STATE,
        payload: null
      })

      console.log('signOut all null values dispatched')
        showSnackbar('SignOut success', 'white', '#1b262c')
    })
    .catch((error) => {
        console.log(error)
        showSnackbar('SignOut failed', 'white', 'red')
    })
}