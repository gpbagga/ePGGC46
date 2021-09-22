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

import {strLiterals} from '../utils/StringsInDatabase'
import {SET_SELECTED_COURSE} from '../action/action.types'
import { addListener_aCourseNoticeBoard, addListeners_allCoursesNoticeBoard, removeListeners_allCoursesNoticeBoard } from '../action/coursesNoticeBoard';
import EmptyContainer from '../components/EmptyContainer';
import NoticeCard from '../components/NoticeCard';
import { useFocusEffect } from '@react-navigation/native';
const getTimeAgoStr = (timestamp) => {
  let timeAgo

  const currentDate = new Date();
  const currentTimestamp = currentDate.getTime();
  
  const seconds = Math.floor((currentTimestamp - timestamp)/1000)
  
  if(seconds < 60){
    timeAgo = seconds === 1 ? '1 second ago': seconds + ' seconds ago'
  }
  else{
    const min = Math.floor(seconds/60) 
    if(min < 60){
      timeAgo = min === 1 ? '1 minute ago': min + ' minutes ago'
    }else{
      const hours = Math.floor(min/60)

      if(hours < 24 ){
        timeAgo = hours === 1 ? '1 hour ago': hours + ' hours ago'
      }else{
        const days = Math.floor(hours/24)
        timeAgo = days === 1 ? '1 day ago': days + ' days ago'
      }
    }
  }
  return timeAgo
}

// {navigation, userDetails, courseNotices, courses_newNoticeCount}
const CoursesNoticeBoard = ({navigation, userDetails, courseNotices, courses_newNoticeCount,
  addListener_aCourseNoticeBoard, addListeners_allCoursesNoticeBoard, removeListeners_allCoursesNoticeBoard}) => {

  // const dispatch = useDispatch()

  const [courseSelected, setCourseSelected] = useState(null)

  const [courses] = useState([])

  if(courses.length === 0){
    if(userDetails[strLiterals.designation] === strLiterals.student){
      courses.push(...userDetails[strLiterals.courses])
    }
    else if(userDetails[strLiterals.designation] === strLiterals.teacher){
      courses.push(...Object.keys(userDetails[strLiterals.courses]))
    }
  }

  useFocusEffect(
    useCallback(() => {
      removeListeners_allCoursesNoticeBoard(userDetails)

      if(courseSelected){
        //removeListener_aCourseNoticeBoard(courseSelected)
        //no need of above statement because we have already removed listeners from all courses

        addListener_aCourseNoticeBoard(userDetails,courseSelected)
          
        
      }
      else if(userDetails[strLiterals.designation] === strLiterals.student){
        addListeners_allCoursesNoticeBoard(userDetails)
      }

      return () => removeListeners_allCoursesNoticeBoard(userDetails)
      
    }, [courseSelected])
  )

  // useEffect(() => {
  //   return ()=> {
  //     dispatch({
  //       type: SET_SELECTED_COURSE,
  //       payload: null
  //     })
  //   }
  // }, [])

  
  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {() => {navigation.goBack()}}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>Courses Notice Board</Title>
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
            // dispatch({
            //   type: SET_SELECTED_COURSE,
            //   payload: null
            // })
            setCourseSelected(null)
            
          }}
          background = {TouchableNativeFeedback.Ripple('#5737D6')}
          >
            <Text style = {{textTransform: 'capitalize'}}>Change</Text>
          </Button>

          <View style = {{flex: 1, justifyContent:'center'}}>
            <Text style = {{fontSize: 18, color: '#120E43'}} >{courseSelected}</Text>
          </View>
        </View>

        <FlatList
        contentContainerStyle = {{flexGrow: 1}}
        data = {courseNotices}
        showsVerticalScrollIndicator = {false}
        keyExtractor = {(item, index) => item[strLiterals.noticeId]}
        renderItem = {({item, index, separators}) => {
          const timeAgoStr = getTimeAgoStr(item[strLiterals.timestamp])
          return(
            
            <TouchableWithoutFeedback
            onPress = {() => 
              navigation.navigate("NoticeContent", { 
                notice : item,
                timeAgoStr: timeAgoStr
              })
            }>
              <View
              style = {{
                paddingTop: 15,
                paddingBottom: 15,
                paddingStart:10,
                paddingEnd:10
              }}
              >
                <NoticeCard notice = {item} timeAgoStr = {timeAgoStr} />
              </View>
            </TouchableWithoutFeedback>
          )
        }}
        ListEmptyComponent = {() => (
          <View style = {styles.emptyListComponent}>
            <H1>No Notice Found</H1>
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
              // dispatch({
              //   type: SET_SELECTED_COURSE,
              //   payload: item
              // })
              setCourseSelected(item)
            }}
            background = {TouchableNativeFeedback.Ripple('#5737D6')}
            style = {{justifyContent: 'space-between'}}
            >
              <Text style = {{fontSize: 19}}>{item}</Text>

              {courses_newNoticeCount && courses_newNoticeCount[item] > 0 &&
                
                <Badge>
                  <Text>{courses_newNoticeCount[item]}</Text>
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

CoursesNoticeBoard.propTypes = {
  userDetails: propTypes.object.isRequired,
}// isRequired makes sure that prop passed to Home must not be NULL
  
//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
  courseNotices: state.coursesNoticeBoard.courseNotices,
  courses_newNoticeCount: state.coursesNoticeBoard.courses_newNoticeCount,
})

const mapDispatchToProps = {
  addListener_aCourseNoticeBoard: (a, b) => addListener_aCourseNoticeBoard(a, b),
  addListeners_allCoursesNoticeBoard: (a) => addListeners_allCoursesNoticeBoard(a),
  removeListeners_allCoursesNoticeBoard: (a) => removeListeners_allCoursesNoticeBoard(a),
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursesNoticeBoard)

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