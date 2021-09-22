import React, {useEffect, } from 'react'

import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/database'

// Note when we import a named method which is exported without default keyword, we use {}
import {NavigationContainer, } from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'

import {useDispatch, connect} from 'react-redux'

import Home from './screens/Home'
import AddNoticeForm from './screens/AddNoticeForm'
import NoticeBoard from './screens/NoticeBoard'
import CoursesNoticeBoard from './screens/CoursesNoticeBoard'
import NoticeContent from './screens/NoticeContent'
import SignIn from './screens/SignIn'
import AddAssignmentForm from './screens/AddAssignmentForm'
import CreateAccount from './screens/CreateAccount'

import {SET_USER, IS_AUTHENTICATED} from './action/action.types'

import {requestPermission} from './utils/AskPermission'
import EmptyContainer from './components/EmptyContainer'
import Attendance from './screens/Attendance'
import AttendanceRegister from './screens/AttendanceRegister'
import AssignmentBoard from './screens/AssignmentBoard'
import AssignmentContent from './screens/AssignmentContent'
import AssignmentSubmissions from './screens/AssignmentSubmissions'


const Stack = createStackNavigator();

//in rootApp.js, PROVIDER component from redux has provided everything in redux store to App component
// that's why we are trying to get a redux state as a prop. 
// later on, we will describe exactly what this prop is (in REDUX config block)
const App = ({authState}) => {   

  const dispatch = useDispatch()
  
  const onAuthStateChanged = (user) => {
    if(user){
      dispatch({
        type: IS_AUTHENTICATED,
        payload: true
      })
      //NOTE----This user object comes from authentication state , not from realtime database

      // get user details from database and set user in redux store
      database()
      .ref(`/users/${user.uid}`)
      .once('value')
      .then((snapshot) => {
        //console.log("USER Details: ", snapshot.val())
        dispatch({
          type: SET_USER,
          payload: snapshot.val()
        })
      })

      
    } else {
      dispatch({
        type: IS_AUTHENTICATED,
        payload: false
      })
    }
  }


  //NOTE: react native Firebase SDKs provide the functionality using device native SDKs,
  // ensuring that a users previous authentication state between app sessions is persisted.
  
  // We get to know the previous user signed in this app through this device
  // using onAuthStateChanged
  useEffect(() => {
    requestPermission()
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber; // unsubscribe on unmount of this App
  }, [])

  if(authState.loading){
    return (
      <EmptyContainer />
    )
  }
  //else

  // <Stack.Navigator
  //     screenOptions = {{
  //       header: (props) => <CustomHeader {...props}/>
  //     }}
  return(
    <NavigationContainer>
      <Stack.Navigator
        screenOptions = {{
          headerShown: false
        }}
      >
        {authState.isAuthenticated ? (
          <>

            <Stack.Screen name = "Home" component = {Home} />
            <Stack.Screen name = "NoticeBoard" component = {NoticeBoard} />
            <Stack.Screen name = "CoursesNoticeBoard" component = {CoursesNoticeBoard} />
            <Stack.Screen name = "AddNoticeForm" component = {AddNoticeForm} />
            <Stack.Screen name = "NoticeContent" component = {NoticeContent} />
            
            <Stack.Screen name = "Attendance" component = {Attendance} />
            <Stack.Screen name = "AttendanceRegister" component = {AttendanceRegister} />
            
            <Stack.Screen name = "AssignmentBoard" component = {AssignmentBoard} />
            <Stack.Screen name = "AddAssignmentForm" component = {AddAssignmentForm} />
            <Stack.Screen name = "AssignmentContent" component = {AssignmentContent} />
            <Stack.Screen name = "AssignmentSubmissions" component = {AssignmentSubmissions} />

          </>
        ) : (
          <>
            <Stack.Screen name = "SignIn" component = {SignIn} />
            <Stack.Screen name = "CreateAccount" component = {CreateAccount} />
            
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

//......Redux config.........

const mapStateToProps = (state) => ({
  authState: state.auth,
})

export default connect(mapStateToProps, null)(App);