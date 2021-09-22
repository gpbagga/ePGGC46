import React, {useState, useEffect, useCallback}  from 'react'
import {View, ScrollView, StyleSheet, 
  TouchableOpacity, TouchableNativeFeedback, TouchableWithoutFeedback, Pressable} from 'react-native'
import {Picker} from '@react-native-picker/picker';
import Color from 'color'
import {
    Input,
    Content,
    CheckBox,
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
    Spinner,
    Badge,
  } from 'native-base';

import propTypes from 'prop-types'
import {connect} from 'react-redux'

import {strLiterals} from '../utils/StringsInDatabase'
import EmptyContainer from '../components/EmptyContainer';
import database from '@react-native-firebase/database'
  
const lineColor = Color('#CAD5E2').lighten(0.1).hex()
const HorizontalLine = () => (
  <View style = {{
    marginStart:15,
    borderBottomColor: '#CAD5E2',
    borderBottomWidth: StyleSheet.hairlineWidth}}
    // borderBottomWidth:StyleSheet.hairlineWidth
    />
)

import { weekDays, months, monthsShort } from '../utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';

const Attendance = ({navigation, userDetails, route}) => {

  const [datesArray] = useState([])
  const [monthsAvailable] = useState([])
  const [yearsAvailable] = useState([])
  const [monthPicked, setMonthPicked] = useState(null)
  const [yearPicked, setYearPicked] = useState(null)
  const [dayOfMonth, setDayOfMonth] = useState(null)
  
  let attTakenDaysInMonthPicked = 0

  let renderingIndex = null

  const [courses, setCourses] = useState({})
  //if student then courses object includes elements like course: attendancePercentage
  //if teacher then courses object includes elements like course: classes(object)

  if(Object.keys(courses).length === 0){
    if(userDetails[strLiterals.designation] === strLiterals.student){
      //courses = {C++ : 50, Java: 75} i.e. course: percentageValue
      for(const course of userDetails[strLiterals.courses].values()){
        courses[course] = 'N/A'
      }
    }
    else if(userDetails[strLiterals.designation] === strLiterals.teacher){
      for(var course in userDetails[strLiterals.courses])
      {
        courses[course] = {}
        for(var dept_year in userDetails[strLiterals.courses][course]){
          const sectionAr = userDetails[strLiterals.courses][course][dept_year].split(',')
          courses[course][dept_year] = sectionAr
        }
      }
    }
  }
  
  const [courseSelected, setCourseSelected] = useState(null) 
  /**
   const [courseSelected, setCourseSelected] = useState(
     userDetals[strLiterals.designation] === strLiterals.teacher &&
     Object.keys(courses).length === 1 ? courses[0] : null 
     )
  */

  const [selectedClass, setSelectedClass] = useState({
    department_year: null,
    section: null 
  })
  
  const [attendanceTakenDays, setAttendanceTakenDays] = useState([])

  useFocusEffect(
    useCallback(() => {

      //we will get attendance days by listener if param attendance days is changed
     
      if(userDetails[strLiterals.designation] === strLiterals.teacher){
        
        // get first date of attendance and then compute datesArray
        if(datesArray.length === 0){
          database()
          .ref(`${strLiterals.attendance}/${strLiterals.firstAttendanceDate}`)
          .once('value')
          .then((snapshot) => {
            if(snapshot.val()){
              
              const [day, month, year] = snapshot.val().split('/')
              
              const date1 = new Date(year,month-1,day)
              
              const todayDate = new Date()
              todayDate.setHours(0,0,0,0)
              
              datesArray.length = 0
              monthsAvailable.length = 0
              yearsAvailable.length = 0
              
              datesArray.push(date1)
              monthsAvailable.push(date1.getMonth())
              yearsAvailable.push(date1.getFullYear())
              
              for(i = parseInt(day) + 1; true; i++){
                const date = new Date(year, month - 1, i)
                datesArray.push(date)
                if(!monthsAvailable.includes(date.getMonth()) ){
                  monthsAvailable.push(date.getMonth())
                }  
                if(!yearsAvailable.includes(date.getFullYear()) ){
                  yearsAvailable.push(date.getFullYear())
                }
                
                
                if(date.getTime() >= todayDate.getTime()){
                  break
                }
              }
              monthsAvailable.sort((a,b) => a - b)
              yearsAvailable.sort((a,b) => a - b)
              
              //console.log('yearsAvailable',yearsAvailable)
            }
            
          })
        }
        
        if(courseSelected && selectedClass.department_year && selectedClass.section){
          database()
          .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.attendanceTakenDays}`)
          .once('value')
          .then(snapshot => {
            if(snapshot.val()){
              console.log('listening to database attendance taken days', [...snapshot.val()])
              setAttendanceTakenDays([...snapshot.val()])
              
            }else{
              setAttendanceTakenDays([])
            }
          })
        }
      }
      else if(userDetails[strLiterals.designation] === strLiterals.student){
        
        for(const course of userDetails[strLiterals.courses].values()){
          database()
          .ref(`${strLiterals.attendance}/${course}/${userDetails[strLiterals.dept]} ${userDetails[strLiterals.year]}/${userDetails[strLiterals.section]}/${strLiterals.studentsAttendance}/${userDetails.uid}`)
          .once('value')
          .then(snapshot => {
            if(snapshot.val()){
              const attendanceArr = snapshot.val()
              
              // if not attendance is taken yet then snapshot will be 'N'
              if(Array.isArray(attendanceArr)){
                let presentCount = 0
                for(const a of attendanceArr.values()){
                  if(a){
                    presentCount++
                  }
                }
                //It is important to directly update the courses and then setState
                courses[course] = (presentCount/attendanceArr.length) * 100
                setCourses({...courses})
              }
            }
          })
        }
      }
    
      return () => {
        //Detach all listeners we used whether they are 'once' listeners
        //because we have used states of this components in listeners callback so 
        //if component unmounts before completion of execution of callback, there will be a problem
        
        if(userDetails[strLiterals.designation] === strLiterals.teacher){
          
          database()
          .ref(`${strLiterals.attendance}/${strLiterals.firstAttendanceDate}`)
          .off()
          
          database()
          .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.attendanceTakenDays}`)
          .off()
        }
        else if(userDetails[strLiterals.designation] === strLiterals.student){
          for(const course of userDetails[strLiterals.courses].values()){
            database()
            .ref(`${strLiterals.attendance}/${course}/${userDetails[strLiterals.dept]} ${userDetails[strLiterals.year]}/${userDetails[strLiterals.section]}/${strLiterals.studentsAttendance}/${userDetails.uid}`)
            .off()
          }
        }
          
      }
      
    }, [courseSelected, selectedClass])
  )  
  
  const goToAttendanceRegisterScreen = (selectedDay) => {
    //console.log('sending param to register',attendanceTakenDays)
    navigation.navigate('AttendanceRegister', {
      courseSelected,
      selectedClass: {...selectedClass},
      selectedDay: selectedDay,
      attendanceTakenDays: [...attendanceTakenDays],
      dateString: datesArray[selectedDay].getDate() + ' ' + monthsShort[datesArray[selectedDay].getMonth()]+ ' ' + datesArray[selectedDay].getFullYear()
    })
  }


  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {() => {navigation.goBack()}}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>Attendance</Title>
        </Body>
        <Right />
      </Header>

      { userDetails[strLiterals.designation] === strLiterals.teacher && (
        courseSelected ? (
          <ScrollView>
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

            <HorizontalLine />

            <View style ={{height: 20}} />

            {Object.keys(courses[courseSelected]).map((item, index) => {
              return(
                <View
                key = {index} 
                style = {{
                  paddingStart: 15, 
                }}
                //by default alignItems = 'stretch' by making it not stretch we make items length as same as their content length
                >
                  <View style = {{flexDirection: 'row', alignItems: 'center'}}>
                    
                    <TouchableOpacity
                    onPress = {() => {
                      if(selectedClass.department_year !== item){
                        selectedClass.department_year = item
                        selectedClass.section = null
                        setSelectedClass({...selectedClass})
                      }
                    }}>
                      <View 
                      //this view is just to increasing the touching area of checkbox
                      style = {{
                        paddingEnd: 20,
                        paddingVertical: 12,
                      }}>
                        <CheckBox 
                        checked = {selectedClass.department_year === item}
                        onPress = {() => {
                          if(selectedClass.department_year !== item){
                            selectedClass.department_year = item
                            selectedClass.section = null
                            setSelectedClass({...selectedClass})
                          }
                        }}
                        />
                      </View>
                    </TouchableOpacity>
                    
                    <Text style = {{fontSize: 19}}>
                    {item}
                    </Text>
                    
                  </View>
                  
                  {selectedClass.department_year === item &&

                    <View style = {{flexDirection: 'row', alignItems: 'center', marginStart: 10, marginBottom: 10}}>
                      
                      {courses[courseSelected][item].map((itemSec, indexSec) => {
                        return(
                          <View 
                          key = {indexSec}
                          style = {{marginStart: 35,marginBottom: 2, alignItems:'center', flexDirection:'row'}} 
                          >
                            <Pressable
                            onPress = {() => {
                              if(selectedClass.section !== itemSec){
                                selectedClass.section = itemSec
                                setSelectedClass({...selectedClass})
                              }
                            }}>
                              <View
                              style = {{
                                backgroundColor : (selectedClass.section === itemSec ? '#62B1F6': 'white'),
                                borderRadius: 1000,
                                padding: 3,
                                paddingHorizontal: 9
                              }}
                              >
                                <Text
                                style = {{
                                  color: (selectedClass.section !== itemSec ? '#3F51B5': 'white')
                                }} 
                                >{itemSec}</Text>
                              </View>
                            </Pressable>
                          </View>
                        )
                      })}

                    </View>
                  }
                  <View style = {{
                    borderBottomColor: lineColor,
                    borderBottomWidth: StyleSheet.hairlineWidth}}
                  />
                </View>
              )
            })}

            <View style = {{
              marginHorizontal:10, marginTop:15,
              padding: 5,
              // borderColor:'#120E43',
              // borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: '#03203C',
              flexDirection: 'row',
              alignItems:'center'
            }}>
              <Text style = {{color: '#12B0E8', fontSize: 14}}>Selected Class: </Text>
              {selectedClass.department_year && selectedClass.section &&
                <Text style = {{color: '#fff'}}>{selectedClass.department_year} {selectedClass.section}</Text>
              }
              
              
            </View>

            {courseSelected && selectedClass.department_year && selectedClass.section &&
            <View style = {{marginTop: 20}}>
              {attendanceTakenDays && !attendanceTakenDays.includes(datesArray.length - 1) &&
                <Button transparent bordered
                style = {{alignSelf: 'center', margin: 10}}
                background = {TouchableNativeFeedback.Ripple('#5737D6')}
                onPress = {() => {
                  navigation.navigate('AttendanceRegister', {
                    courseSelected,
                    selectedClass: {...selectedClass},
                    selectedDay: datesArray.length - 1,  //starts from 0 
                    attendanceTakenDays: [...attendanceTakenDays]
                  })
                }}
                >
                  <Text style = {{fontWeight:'bold'}}>Take Today's Attendance</Text>
                </Button>
              }

              <View 
              style = {{
                marginVertical: 5, marginHorizontal: 10, 
                flexDirection: 'row',
                alignItems:'center',
                justifyContent:'space-between'
              }}>
                {(!dayOfMonth && !monthPicked && !yearPicked &&
                  <Icon type = 'AntDesign' name = 'calendar' />)
                  ||
                  <Pressable
                  onPress = {() => {setDayOfMonth(null); setMonthPicked(null); setYearPicked(null)}}
                  >
                    <Icon type = 'Feather' name = 'x-circle' />
                  </Pressable>
                }
                
                <View style={{flex: 1 ,marginStart: 10,height:'100%',borderColor: lineColor, borderWidth: 1}}>
                  <Input
                  style = {{flex: 1}}
                  placeholder="day"
                  placeholderTextColor = 'gray'
                  keyboardType = 'numeric'
                  value={dayOfMonth}
                  onChangeText = {text => setDayOfMonth(isNaN(parseInt(text)) ? null: text )}
                  />
                </View>
                <View 
                style = {{flex: 3, borderColor: lineColor, borderWidth: 1, borderStartWidth:0}}>
                  <Picker
                  style={{flex: 1}}
                  mode = "dialog"
                  selectedValue={monthPicked}
                  onValueChange={(itemValue) => setMonthPicked(itemValue)}
                  > 
                    <Picker.Item 
                    label= "month" value= {null} 
                    style = {{alignSelf: 'center', fontSize:16, color: 'gray'}}
                    />
                    {monthsAvailable.map((item, index) => (
                      <Picker.Item 
                      key = {index}
                      label= {months[item]} value={item} 
                      style = {{alignSelf: 'center', fontSize:16, color: 'black'}}
                      />
                    ))}
                  </Picker>
                </View>
                <View style = {{flex: 3, borderColor: lineColor, borderWidth: 1, borderStartWidth:0}}>
                  <Picker
                  style={{flex: 1}}
                  mode = "dropdown"
                  selectedValue = {yearPicked}
                  onValueChange = {(itemValue) => setYearPicked(itemValue)}
                  >
                    <Picker.Item 
                    label= "year" value= {null} 
                    style = {{alignSelf: 'center', fontSize:16, color: 'gray'}}
                    />
                    {yearsAvailable.map((item, index) => (
                      <Picker.Item 
                      key = {index}
                      label= {item.toString()} value={item} 
                      style = {{alignSelf: 'center', fontSize:16, color: 'black'}}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              { !(dayOfMonth && monthPicked && yearPicked) &&
                <Text style = {{margin:10, color: '#6A1B4D', fontWeight: 'bold'}}>  
                {(monthPicked && yearPicked) ? `${months[monthPicked]}, ${yearPicked}` :
                'Last 7 Days:'
                }
                </Text>
              }

              <View style = {{flexDirection: 'column-reverse'}}>

                {dayOfMonth && monthPicked && yearPicked ? (
                  //The assignment operation evaluates to the assigned value
                  (renderingIndex = datesArray.findIndex(item => item.getDate().toString() === dayOfMonth && item.getMonth() === monthPicked && item.getFullYear() === yearPicked))
                  !== -1  ? (
                    <TouchableOpacity
                    onPress = {() => {
                      goToAttendanceRegisterScreen(renderingIndex)
                    }}
                    >
                      <View style = {{paddingHorizontal: 10}}>
                          
                        <View 
                        style = {{
                          width: '100%',
                          paddingVertical: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                          
                          {(attendanceTakenDays.includes(renderingIndex)) ? (
                            <Icon type = 'AntDesign' name = 'check' style = {{color: '#4DD637'}} />
                            ) :(
                            <Icon type = 'Entypo' name = 'cross' style = {{color: '#CAD5E2'}}/>
                          )}
                          
                          <Text style = {{marginStart: 10, color: datesArray[renderingIndex].getDay() === 0 && '#CAD5E2'}}>
                            {datesArray[renderingIndex].getDate()} {monthsShort[datesArray[renderingIndex].getMonth()]} {datesArray[renderingIndex].getFullYear()}, {weekDays[datesArray[renderingIndex].getDay()]}
                          </Text>
                          
                          {(renderingIndex === datesArray.length - 1 || renderingIndex === datesArray.length - 2) &&
                            <View style = {{flexGrow: 1}}>
                              <Badge info style = {{alignSelf:'flex-end'}}>
                                <Text>{renderingIndex === datesArray.length - 1 ? 'Today': 'Yesterday'}</Text>
                              </Badge>
                            </View>
                          }
                        </View>
                        <View style = {{
                          borderBottomColor: lineColor,
                          borderBottomWidth: StyleSheet.hairlineWidth}}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Text style = {{padding: 10}}>This Date's Attendance does not have to be marked</Text>
                  )

                ): (
                  (!dayOfMonth && monthPicked && yearPicked &&
                    
                    datesArray.map((item, index) => {
                      if(!(item.getMonth() === monthPicked && item.getFullYear() === yearPicked)){
                        return
                      }
                      
                      return(
                        <TouchableOpacity
                        key = {index}
                        onPress = {() => {
                          goToAttendanceRegisterScreen(index)
                        }}
                        >
                          <View style = {{paddingHorizontal: 10}}>
                            
                            <View 
                            
                            style = {{
                              width: '100%',
                              paddingVertical: 10,
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                              
                              {(attendanceTakenDays.includes(index)) ? (
                                (attTakenDaysInMonthPicked +=1) !==0 &&
                                <Icon type = 'AntDesign' name = 'check' style = {{color: '#4DD637'}} />
                                ) :(
                                <Icon type = 'Entypo' name = 'cross' style = {{color: '#CAD5E2'}}/>
                              )}
                              
                              <Text style = {{marginStart: 10, color: item.getDay() === 0 && '#CAD5E2'}}>
                                {item.getDate()} {monthsShort[item.getMonth()]} {item.getFullYear()}, {weekDays[item.getDay()]}
                              </Text>
                            
    
                              {(index === datesArray.length - 1 || index === datesArray.length - 2) &&
                                <View style = {{flexGrow: 1}}>
                                <Badge info style = {{alignSelf:'flex-end'}}>
                                  <Text>{index === datesArray.length - 1 ? 'Today': 'Yesterday'}</Text>
                                </Badge>
                                </View>
                              }
                              
                              
                            </View>
                            <View style = {{
                              borderBottomColor: lineColor,
                              borderBottomWidth: StyleSheet.hairlineWidth}}
                            />
                          </View>
                        </TouchableOpacity>
                      )
                    })
                    
                  )|| (
                    datesArray.slice(datesArray.length - 7).map((item, index) => {
                      return(
                      <TouchableOpacity
                      key = {index}
                      onPress = {() => {
                        goToAttendanceRegisterScreen(index + datesArray.length - 7)
                      }}
                      >
                        <View style = {{paddingHorizontal: 10}}>
                          
                          <View 
                          
                          style = {{
                            width: '100%',
                            paddingVertical: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                            
                            {(attendanceTakenDays.includes(index + datesArray.length - 7)) ? (
                              <Icon type = 'AntDesign' name = 'check' style = {{color: '#4DD637'}} />
                              ) :(
                              <Icon type = 'Entypo' name = 'cross' style = {{color: '#CAD5E2'}}/>
                            )}
                            
                            <Text style = {{marginStart: 10, color: item.getDay() === 0 && '#CAD5E2'}}>
                            {item.getDate()} {monthsShort[item.getMonth()]} {item.getFullYear()}, {weekDays[item.getDay()]}
                            </Text>
                          

                            {(index === 6 || index === 5) &&
                              <View style = {{flexGrow: 1}}>
                              <Badge info style = {{alignSelf:'flex-end'}}>
                                <Text>{index === 6 ? 'Today': 'Yesterday'}</Text>
                              </Badge>
                              </View>
                            }
                            
                            
                          </View>
                          <View style = {{
                            borderBottomColor: lineColor,
                            borderBottomWidth: StyleSheet.hairlineWidth}}
                          />
                        </View>
                      </TouchableOpacity>
                    )})
                  )
                )}

                {!dayOfMonth && monthPicked && yearPicked &&
                  <Text style = {{marginStart: 10, color: '#6A1B4D'}}>
                  Attendance Taken Days = {attTakenDaysInMonthPicked}
                  </Text>
                }
                      
              </View>
                
            </View>
            
            }
            
          </ScrollView>
        ): (
          <ScrollView>
          {Object.keys(courses).map((item, index) => {
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
              </ListItem>
            
            )
          })}
          </ScrollView>
        )
      )}

      {userDetails[strLiterals.designation] === strLiterals.student && 
        <ScrollView>
          {Object.keys(courses).map((item, index) => {
            return(
              <ListItem 
              key = {index}
              style = {{justifyContent:'space-between'}}
              >
                <Text>{item}</Text>
                <Text 
                style = {{
                  color: courses[item] === 'N/A' ? '#CAD5E2' : (
                    courses[item] < 75 ? '#E21717': '#00D84A'),
                  fontWeight:'bold'
                }}>
                {courses[item]}{courses[item] !== 'N/A' && '%'}</Text>
              </ListItem>
            )
          })}
        </ScrollView>
      }
    
      

    </Container>

  )
}

Attendance.propTypes = {
  userDetails: propTypes.object.isRequired,
}// isRequired makes sure that prop passed to Home must not be NULL
  
//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
})

export default connect(mapStateToProps)(Attendance)

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