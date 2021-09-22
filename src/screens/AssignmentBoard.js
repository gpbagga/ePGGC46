import React, {useRef,useState, useEffect, useCallback}  from 'react'
import {FlatList, Image,View, ScrollView, StyleSheet, 
  TouchableWithoutFeedback, TouchableNativeFeedback} from 'react-native'

import {
    Card,
    Content,
    Badge,
    ListItem,
    Text,
    Button,
    Icon,
    Left,
    Body,
    Right,
    Row, Col,
    Container,
    H1,
    Header,
    Title,
    Spinner
  } from 'native-base';

import propTypes from 'prop-types'
import {connect, useDispatch} from 'react-redux'
import { monthsShort } from '../utils/dateUtils';
import {strLiterals} from '../utils/StringsInDatabase'
import AssignmentCard from '../components/AssignmentCard';
import { removeListeners_allCoursesAssignments, addListeners_allCoursesAssignments,
  addListener_aCourseAssignments, removeListener_aCourseAssignments } from '../action/assignment';
import {
  useFocusEffect,
} from '@react-navigation/native'
import { removeListeners_allCoursesNoticeBoard } from '../action/coursesNoticeBoard';
  
const AssignmentBoard = ({navigation, userDetails,
  assignments, courses_newAssignmentCount,
  addListeners_allCoursesAssignments, removeListeners_allCoursesAssignments,
  addListener_aCourseAssignments, removeListener_aCourseAssignments
}) => {

  const isStudent = userDetails[strLiterals.designation] === strLiterals.student

  const [courseSelected, setCourseSelected] = useState(null)

  const [courses] = useState([])

  if(courses.length === 0){
    if(isStudent){
      courses.push(...userDetails[strLiterals.courses])
    }
    else if(userDetails[strLiterals.designation] === strLiterals.teacher){
      courses.push(...Object.keys(userDetails[strLiterals.courses]))
    }
  }
  
  // const getCoursesAssignmentIdSeenState = () => courses_assigmentId_seen ? {...courses_assigmentId_seen}: null  
  // const getACourseAssignmentIdSeenState = () => (courses_assigmentId_seen && courses_assigmentId_seen[courseSelected] && {...courses_assigmentId_seen[courseSelected]}) || null

  useFocusEffect(
    useCallback(() => {
      removeListeners_allCoursesAssignments(userDetails) 
      
      if(courseSelected){
        addListener_aCourseAssignments(userDetails, courseSelected)
      }
      else{
        if(isStudent){
          addListeners_allCoursesAssignments(userDetails)
        }
      }

      // listeners are removed when navigation goes to another screen or this screen gets blurred
      return () => {
        removeListeners_allCoursesAssignments(userDetails)
      }
    }, [courseSelected])
  )

  // useEffect(() => {
  //   // listeners are removed when navigation goes to another screen (see useNavigationState() in Home.js)
  //   if(route.params?.isAssignmentContent){
  //     // means we are coming from assignment content screen
  //     // listen again to a course's assignments
  //     removeListener_aCourseAssignments(courseSelected)
  //     addListener_aCourseAssignments(userDetails, courseSelected, getACourseAssignmentIdSeenState)
  //     route.params.isAssignmentContent = false
  //   }

  //   //for teacher
  //   if(route.params?.isAssignmentSubmissions){
  //     // means we are coming from Assignment Submissions screen
  //     removeListener_aCourseAssignments(courseSelected)
  //     addListener_aCourseAssignments(userDetails, courseSelected, getACourseAssignmentIdSeenState)
  //     route.params.isAssignmentSubmissions = false
  //   }
  // }, [route.params?.isAssignmentContent, route.params?.isAssignmentSubmissions])

  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {() => {navigation.goBack()}}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>AssignmentBoard</Title>
        </Body>
      </Header>

      
      {courseSelected ? (
        <View style = {{flex: 1}}>
        <View style = {{
          padding: 15,
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
        }}>

          <Button bordered 
          onPress = {() => {
            setCourseSelected(null)
          }}
          background = {TouchableNativeFeedback.Ripple('#5737D6')}
          >
            <Text style = {{textTransform: 'capitalize'}}>Change</Text>
          </Button>

          <View style = {{flex: 1, justifyContent:'center'}}>
            <Text >{courseSelected}</Text>
          </View>
        </View>

        <FlatList
        contentContainerStyle = {{flexGrow: 1}}
        data = {assignments}
        showsVerticalScrollIndicator = {false}
        keyExtractor = {(item, index) => item[strLiterals.assignmentId]}
        renderItem = {({item, index, separators}) => {
          
          return(
            
            <TouchableWithoutFeedback
            onPress = {() => {
              navigation.navigate("AssignmentContent", { 
                assObj : item,
                course: courseSelected
              })
            }}
            >
              <View
              style = {{
                paddingTop: 15,
                paddingBottom: 15,
                paddingStart:10,
                paddingEnd:10
              }}
              >
                <AssignmentCard assignment = {item} userDetails = {userDetails} 
                onPressSubmissionsBtn = {() => {
                  navigation.navigate('AssignmentSubmissions', {
                    assignmentId: item[strLiterals.assignmentId],
                    course: courseSelected
                  })
                }}
                />
              </View>
            </TouchableWithoutFeedback>
          )
        }}
        ListEmptyComponent = {() => (
          <View style = {styles.emptyListComponent}>
            <H1>No Assignment Found</H1>
          </View>
        )}
        />
        </View>
      ): (
        <ScrollView>
        {courses.map((item, index) => {
          return(
            
            <ListItem //list item is extension of touchableNativefeedBack in android
            key = {index} 
            onPress = {() => {
              setCourseSelected(item)
              
            }}
            background = {TouchableNativeFeedback.Ripple('#5737D6')}
            style = {{justifyContent: 'space-between'}}
            >
              <Text style = {{fontSize: 19}}>{item}</Text>

              {isStudent && courses_newAssignmentCount && courses_newAssignmentCount[item] > 0 &&
                
                <Badge>
                  <Text>{courses_newAssignmentCount[item]}</Text>
                </Badge>
              }
            </ListItem>
          
          )
        })}
        </ScrollView>
      )}
    
      

    </Container>

  )
}

AssignmentBoard.propTypes = {
  userDetails: propTypes.object.isRequired,
}// isRequired makes sure that prop passed to Home must not be NULL
  
//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
  assignments: state.assignment.assignments,
  courses_newAssignmentCount: state.assignment.courses_newAssignmentCount,
  courses_assigmentId_seen: state.assignment.courses_assigmentId_seen
})

const mapDispatchToProps = {
  addListeners_allCoursesAssignments: (a) => addListeners_allCoursesAssignments(a),
  removeListeners_allCoursesAssignments: (a) => removeListeners_allCoursesAssignments(a),
  addListener_aCourseAssignments: (a,b) => addListener_aCourseAssignments(a,b),
  removeListener_aCourseAssignments: (a) => removeListener_aCourseAssignments(a)
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentBoard)

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  emptyListComponent:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})