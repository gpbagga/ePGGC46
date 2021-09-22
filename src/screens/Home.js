import React, {useState, useCallback} from 'react';
import {StyleSheet,View, Animated, SafeAreaView, TouchableOpacity, Modal,
    useWindowDimensions} from 'react-native';
import {
    Container,Spinner,
    Content,
    Header,
    Left,
    Right,
    Body,
    Badge, Text, Icon, Title, Item, Row, Col, Button
} from 'native-base';

import {strLiterals} from '../utils/StringsInDatabase'
//import { monthsShort } from '../utils/dateUtils';
import {connect} from 'react-redux'
import propTypes from 'prop-types'

import DueAssignmentCard from '../components/DueAssignmentCard'
import {
  useFocusEffect,
} from '@react-navigation/native';
import {signOut} from '../action/auth'
import {addListener_NoticeBoard, removeListener_NoticeBoard} from '../action/noticeBoard'
import {
  addListeners_allCoursesNoticeBoard, removeListeners_allCoursesNoticeBoard} from '../action/coursesNoticeBoard'

import {addListeners_allCoursesAssignments, removeListeners_allCoursesAssignments} from '../action/assignment'
import Color from 'color';

/**
 ///////IMPORTANT/////////
By default, useEffect is called after every render (first render and after every
update of react and redux states)
But passing [] empty array as a second argument to useEffect will run the effect and
clean it up only once (on mount and unmount)
 
 */

//userDetails is the details of the user who is logged in
const Home = ({navigation,signOut, userDetails, 
  newNoticeCount,  courses_newNoticeCount_state,
  addListener_NoticeBoard, removeListener_NoticeBoard,
  addListeners_allCoursesNoticeBoard, removeListeners_allCoursesNoticeBoard,
  newAssignmentCountOverall, dueAssignmentsState,
  addListeners_allCoursesAssignments, removeListeners_allCoursesAssignments
}) => {

  const [spinnerVisible, setSpinnerVisible] = useState(true)
  if(spinnerVisible && newNoticeCount!== null && (userDetails[strLiterals.designation] === strLiterals.teacher || courses_newNoticeCount_state!==null && newAssignmentCountOverall!==null && dueAssignmentsState!==null)){
    setSpinnerVisible(false)
  }

  const courses_newNoticeCount_Obj = courses_newNoticeCount_state
  let courses_newNoticeCount = 0
  if(courses_newNoticeCount_Obj){

    for(const item of Object.values(courses_newNoticeCount_Obj).values()){
      courses_newNoticeCount += item
    }
    
  }
  
  console.log('Rendering Home Component')

  useFocusEffect(
    useCallback(() => {
      if(userDetails){
        //console.log('useEffect')
        removeListener_NoticeBoard()
        addListener_NoticeBoard(userDetails, false)
        
        removeListeners_allCoursesNoticeBoard(userDetails)
        if(userDetails[strLiterals.designation] === strLiterals.student){
          addListeners_allCoursesNoticeBoard(userDetails)
        }
        //else if teacher then no need to listen new course notices because I myself have added that notice
        
        removeListeners_allCoursesAssignments(userDetails)
        if(userDetails[strLiterals.designation] === strLiterals.student){
          addListeners_allCoursesAssignments(userDetails)
        }
        
      }

      return () => {
        //apparantly this function is called after navigated route is focused and its useCallback is executed
        const focusedRouteName = navigation.dangerouslyGetState().routes[navigation.dangerouslyGetState().index].name
        //console.log(focusedRouteName)
        
        if(focusedRouteName === 'Home'){
          return null
        }
        
        if(userDetails){
          
          if(focusedRouteName !== 'NoticeBoard'){

            removeListener_NoticeBoard()
            
          }
          if(focusedRouteName !== 'CoursesNoticeBoard'){
            removeListeners_allCoursesNoticeBoard(userDetails)
            
          }
          if(focusedRouteName !== 'AssignmentBoard'){
            
            removeListeners_allCoursesAssignments(userDetails)
          }

        }
      };
    }, [userDetails])
  ) 
  
  // useEffect(() => {
  //   /**
  //   NOTE- By default, useEffect is called after every render (first render and after every
  //   update of react and redux states)
  //   But passing [] empty array as a second argument to useEffect will run the effect and
  //   clean it up only once (on mount and unmount)
  //   */
  //   return () => {
  //     //console.log('Home umounting')
  //     removeListener_NoticeBoard()
  //     removeListeners_allCoursesNoticeBoard(userDetails)
  //     removeListeners_allCoursesAssignments(userDetails)
  //   }
        
  // }, [])   

  return(
    <Container>
      <Header>
        <Left>
          <Icon name = 'menu' style = {{color: 'white'}} />
        </Left>
        <Body>
          <Title>ePGGC-46</Title>
        </Body>
        <Right>
          <TouchableOpacity onPress = {signOut}>
            <Icon 
            style = {{color:'white'}}
            type = 'MaterialCommunityIcons' name ='logout' />
          </TouchableOpacity>
        </Right>
      </Header>
      
      <Content>
        <View style = {{marginVertical: 10}}>
          {spinnerVisible && 
            
            <Spinner color = 'blue'/>
            
          }
          <Row style = {{alignItems: 'center'}}>
            <View 
            style = {{ width: '50%',padding:10}}>
              
              <View style = {{margin: 10, alignItems:'center'}}>
                
                <Button 
                style = {styles.buttonsStyle}
                onPress = {() => {
                  if(!userDetails){
                    return
                  }
                  navigation.navigate("NoticeBoard")
                }}
                >
                  <Text style = {styles.buttonText}>
                  Notice Board 
                  </Text>
                </Button>
                {userDetails && userDetails[strLiterals.noticeBoardPersmissions] &&
                <Button info 
                onPress = {() => {
                  navigation.navigate("AddNoticeForm", { isCourseNotice: false })
                }}
                style = {styles.addButton}>
                  <Icon type = 'MaterialIcons' name = 'add' style = {{color:'white'}} />
                </Button>
                }
              </View>
              
              {newNoticeCount !== null && newNoticeCount > 0 &&
                <Badge style = {styles.badgeStyle}>
                  <Text>{newNoticeCount}</Text>
                </Badge>    
              }
              
            </View>

            <View 
            style = {{ width: '50%',padding:10}}>

              <View style = {{margin: 10, alignItems:'center'}}>
                <Button style = {styles.buttonsStyle}
                onPress = {() => {
                  if(!userDetails){
                    return
                  }
                  navigation.navigate("CoursesNoticeBoard")
                }}
                >
                  <Text style = {styles.buttonText}>
                  Courses{'\n'}NoticeBoard
                  </Text>
                </Button>
                {userDetails && userDetails[strLiterals.designation] === strLiterals.teacher 
                  && userDetails[strLiterals.courses] &&
                <Button info 
                onPress = {() => {navigation.navigate("AddNoticeForm", { isCourseNotice: true })}}
                style = {styles.addButton}>
                  <Icon type = 'MaterialIcons' name = 'add' style = {{color:'white'}} />
                </Button>
                }
              </View>
            
              {courses_newNoticeCount !== null && courses_newNoticeCount > 0 &&
                <Badge style = {styles.badgeStyle}>
                  <Text>{courses_newNoticeCount}</Text>
                </Badge>    
              }  
            </View>
          
          </Row>
          <Row style = {{alignItems: 'center'}}>
            <View 
            style = {{ width: '50%',padding:10}}>
              <View style = {{margin: 10, alignItems:'center'}}>
                <Button 
                style = {styles.buttonsStyle}
                onPress = {() => {
                  if(!userDetails){
                    return
                  }
                  navigation.navigate("Attendance")
                }}
                >
                  <Text style = {styles.buttonText}>
                  Attendance</Text>
                </Button>
                
              </View>
            </View>
            
            <View 
            style = {{ width: '50%',padding:10}}>
              <View style = {{margin: 10, alignItems:'center'}}>
                <Button style = {styles.buttonsStyle}
                onPress = {() => {
                  if(!userDetails){
                    return
                  }
                  navigation.navigate("AssignmentBoard")
                }}
                >
                  <Text style = {styles.buttonText}>
                  Assignments</Text>
                </Button>
                {userDetails && userDetails[strLiterals.designation] === strLiterals.teacher 
                  && userDetails[strLiterals.courses] &&
                <Button info 
                onPress = {() => {navigation.navigate("AddAssignmentForm")}}
                style = {styles.addButton}>
                  <Icon type = 'MaterialIcons' name = 'add' style = {{color:'white'}} />
                </Button>
                }
              </View>

              {newAssignmentCountOverall !== null && newAssignmentCountOverall > 0 &&
                <Badge style = {styles.badgeStyle}>
                  <Text>{newAssignmentCountOverall}</Text>
                </Badge>    
              }

            </View>
          </Row>
          <Row style = {{alignItems: 'center'}}>
            <View 
            style = {{ width: '50%',padding:10}}>
              <View style = {{margin: 10, alignItems:'center'}}>
                <Button style = {styles.buttonsStyle}>
                  <Text style = {styles.buttonText}>
                  Books Borrow/Lend</Text>
                </Button>
              </View>
            </View>
            
            <View 
            style = {{ width: '50%',padding:10}}>
              <View style = {{margin: 10, alignItems:'center'}}>
                <Button style = {styles.buttonsStyle}>
                  <Text style = {styles.buttonText}>
                  Lost/Found</Text>
                </Button>
              </View>
            </View>
          </Row>
          
        </View>

        {dueAssignmentsState && Object.keys(dueAssignmentsState).length > 0 &&
          <View style = {styles.dueAssignmentsContainer}>
            <Text style={styles.dueAssignmentsHeading}>Due Assignments</Text>
            {Object.keys(dueAssignmentsState).map((item, index) => {
              return(
                <View key = {index} style = {{paddingBottom:10 ,backgroundColor:'#f9f9f9'}}>
                  <View style = {styles.separationLine}/>
                  <Text style = {styles.course}>{item}</Text>
                  <View style = {{padding:10}}>
                    {dueAssignmentsState[item].map((assObj, i) => {
                      //console.log(item, i);
                      return(
                        <TouchableOpacity key = {i}
                        onPress = {() => {
                          navigation.navigate('AssignmentContent', {
                            assObj,
                            course: item,
                            isComingFromHome: true
                          })
                        }}>
                          <DueAssignmentCard assignment = {assObj} />
                        </TouchableOpacity>
                        
                      )
                    })}
                  </View>
                </View>
              )
            })}
          </View>
        }

      </Content>
        
    </Container>
        
    )
}
Home.propTypes = {
  signOut: propTypes.func.isRequired,
  addListener_NoticeBoard: propTypes.func.isRequired,
  removeListener_NoticeBoard: propTypes.func.isRequired,
  addListeners_allCoursesNoticeBoard: propTypes.func.isRequired,
  removeListeners_allCoursesNoticeBoard: propTypes.func.isRequired,
  //userDetails: propTypes.object.isRequired    
  //don't make it required because on reStart of app userDetails are retrieved slowly
  // (after listening asynchronous onAuthStateChanged listener used in useEffect() of App 
  // component) hence giving warning that userDetails is null

}// isRequired makes sure that prop passed to Home must not be NULL

//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
  newNoticeCount: state.noticeBoard.newNoticeCount,
  courses_newNoticeCount_state: state.coursesNoticeBoard.courses_newNoticeCount,
  newAssignmentCountOverall: state.assignment.newAssignmentCountOverall,
  dueAssignmentsState: state.assignment.dueAssignments
})

const mapDispatchToProps = {
  signOut: () => signOut(),
  addListener_NoticeBoard: (a,b) => addListener_NoticeBoard(a,b),
  removeListener_NoticeBoard: () => removeListener_NoticeBoard(),

  addListeners_allCoursesNoticeBoard: (a) => addListeners_allCoursesNoticeBoard(a),
  removeListeners_allCoursesNoticeBoard: (a) => removeListeners_allCoursesNoticeBoard(a),
  
  addListeners_allCoursesAssignments: (a) => addListeners_allCoursesAssignments(a),
  removeListeners_allCoursesAssignments: (a) => removeListeners_allCoursesAssignments(a)
}/// getPosts will be expanded as getPosts: getPosts

export default connect(mapStateToProps, mapDispatchToProps)(Home)

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#1b262c',
      justifyContent: 'flex-start',
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: '#1b262c',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dueAssignmentsContainer:{
      margin: 10,marginBottom:0,
      // elevation: 3,   // to put shadow under row (ANDROID)
      // //marginBottom: 8, //if you don't put margin then shadow won't be visible
      // shadowColor: '#000',                      //(IOS)
      // shadowOffset: { width: 0, height: -3 },   //(IOS)
      // shadowOpacity: 0.3,                       //(IOS)
      // shadowRadius: 2,                          //(IOS)
    },
    separationLine:{
      borderBottomColor:'#3F51B5', borderBottomWidth:10
    },
    dueAssignmentsHeading:{
      fontSize:17,
      textAlign:'center',
      backgroundColor:'#3F51B5', //#207398  3F51B5
      color:'#fff',  //E5D68A
      padding: 5,
      borderTopLeftRadius:10,
      borderTopRightRadius:10,
    }, 
    course:{
      fontSize:18,
      
      padding:5,
      backgroundColor: Color('#23C4ED').lighten(0.5).hex(),  //(0.6
    }, 
    aboutAndDueDateContainer:{
      padding: 5,
      alignItems:'center'
    },
    aboutAss:{
      flex: 2,
    },
    dueDate:{
      flex: 1,
      color: '#6A1B4D',
      textAlign:'center',
      fontSize: 15     //normal font size is 16
    },
    imageListContainer: {
        flex: 1,
        position: 'absolute',
        zIndex: 1
    },
    closeButton: {
        position: 'absolute',
        zIndex: 2,
        top: 30,
        right: 30
    },
    buttonsStyle:{
      
      flex : 1,
      justifyContent:'center',
      height: 70,
      width: '100%',
      zIndex: 2,
      borderRadius: 10,

      elevation: 5,   // to put shadow under row (ANDROID)
      //marginBottom: 8, //if you don't put margin then shadow won't be visible
      shadowColor: '#000',                      //(IOS)
      shadowOffset: { width: 0, height: -3 },   //(IOS)
      shadowOpacity: 0.3,                       //(IOS)
      shadowRadius: 2,                          //(IOS)
    },
    badgeStyle:{
      position:'absolute',
      zIndex: 3,
      elevation:10, 
      top: 8, end: 8
    },
    addButton:{
      zIndex: 1,
      top: -4,
      width: '100%',
      justifyContent:'center',
      borderRadius: 10,
      
      elevation: 5,   // to put shadow under row (ANDROID)
      //marginBottom: 8, //if you don't put margin then shadow won't be visible
      shadowColor: '#000',                      //(IOS)
      shadowOffset: { width: 0, height: -3 },   //(IOS)
      shadowOpacity: 0.3,                       //(IOS)
      shadowRadius: 2,                          //(IOS)
    },  
    buttonText:{
      textAlign:'center',
      textAlignVertical:'center',
      
    }
  });