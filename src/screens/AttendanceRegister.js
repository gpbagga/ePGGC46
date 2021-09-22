import React, {useState, useEffect}  from 'react'
import {FlatList,View, ScrollView, StyleSheet, 
  TouchableOpacity, TouchableWithoutFeedback} from 'react-native'

import Color from 'color'
import {
    Form,Item, Input,
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
import {connect, useDispatch} from 'react-redux'

import {strLiterals} from '../utils/StringsInDatabase'
import EmptyContainer from '../components/EmptyContainer';
import database from '@react-native-firebase/database'
//import Snackbar from 'react-native-snackbar';
import showSnackbar from '../utils/showSnackbar'
import {onBackPress} from '../utils/backPressHandler';

const lineColor = Color('#CAD5E2').lighten(0.1).hex()
const VerticalLine = () => (
  <View style = {{
    height: 45,
    width: StyleSheet.hairlineWidth,
    backgroundColor: lineColor}}
    />
)
const HorizontalLine = () => (
  <View style = {{
    borderBottomColor: lineColor,
    borderBottomWidth: 1}}
    />
)

const AttendanceRegister = ({navigation,route, userDetails}) => {

  const {courseSelected, selectedClass, selectedDay, dateString} = route.params
  const [attendanceTakenDays, setAttendanceTakenDays] = useState(route.params.attendanceTakenDays)

  const [searchedRollNo, setSearchedRollNo] = useState(null)
  const [searchedName, setSearchedName] = useState(null)

  const [studentsInfoAndAttendance, setStudentsInfoAndAttendance] = useState(null)
  /**
   * this array consists of following objects
   * const studentObj = {
        studentId, 
        attendance: true/false,
        name: 'gagan',
        rollNo: '4482'
      }
   */

  const [attendanceUploading, setAttendanceUploading] = useState(false)
  // function handleBackPress() {
  //   navigation.navigate({
  //     name: 'Attendance',
  //     params: { attendanceTakenDays: [...attendanceTakenDays] },
  //     merge: true,   //means merge params back to Attendance screen
  //   });
  //   return true;
  // }
  
  useEffect(() => {
    //const backPressUnsubscriberFunc = onBackPress(handleBackPress);

    if(courseSelected && selectedClass && selectedDay){
      database()
      .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.studentsAttendance}`)
      .once('value')
      .then(snapshot => {
        if(snapshot.val()){
          const dbObj = snapshot.val()

          const requiredStudentsArr = []
          
          const reqAttendanceIndex = attendanceTakenDays.findIndex(item => item === selectedDay)
          // it will be -1 if no index found for given condition

          for(var id in dbObj){
            const studentId = id
            const studentObj= {
              studentId, 
              attendance: (reqAttendanceIndex >= 0 ? dbObj[studentId][reqAttendanceIndex] : false),
              name: '',
              rollNo: 0
            }
            database()
            .ref(`users/${studentId}/${strLiterals.name}`)
            .once('value')
            .then(snapshot => {
              if(snapshot.val()){
                studentObj.name = snapshot.val() 
              }
              database().ref(`users/${studentId}/${strLiterals.rollNo}`)
              .once('value')
              .then(snapshot=>{
                if(snapshot.val()){
                  studentObj.rollNo = parseInt(snapshot.val().split('/')[0])
                }
                requiredStudentsArr.push({...studentObj})
                if(requiredStudentsArr.length === Object.keys(dbObj).length){
                  requiredStudentsArr.sort((a, b) => {
                    // greater is the timestamp, more recent is the notice
                    return a[strLiterals.rollNo] - b[strLiterals.rollNo]
                  })
                  
                  setStudentsInfoAndAttendance([...requiredStudentsArr])
                }
                //console.log('End from listeners of attendanceRegister')
              })
            })
          }
        }else{
          setStudentsInfoAndAttendance([])
        }
      })
    }

    //cleanup function
    return () => {

      //backPressUnsubscriberFunc()

      //Detach all listeners we used whether they are 'once' listeners
      //because we have used states of this components in listeners callback so 
      //if component unmounts before completion of execution of callback, there will be a problem

      try{

        database()
        .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.studentsAttendance}`)
        .off()
        
        const reqAttendanceIndex = attendanceTakenDays.findIndex(item => item === selectedDay)
        //it can be -1 

        for(const s of studentsInfoAndAttendance.values()){
          database()
          .ref(`users/${s.studentId}/${strLiterals.name}`)
          .off()
          database()
          .ref(`users/${s.studentId}/${strLiterals.rollNo}`)
          .off()

          // detaching writing onCompletion callback 
          if(reqAttendanceIndex >= 0){
            database()
            .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.studentsAttendance}/${s.studentId}/${reqAttendanceIndex}`)
            .off()
          }
        }

      }catch(e){
        //
      }
      
    }

  },[])

  const uploadAttendance = () => {

    let reqAttendanceIndex = attendanceTakenDays.findIndex(item => item === selectedDay)
    if(reqAttendanceIndex < 0){
      reqAttendanceIndex = attendanceTakenDays.length
      attendanceTakenDays.push(selectedDay)
      setAttendanceTakenDays([...attendanceTakenDays])
      //console.log('after push attendanceTakenDays', attendanceTakenDays)
    }
    
    database()
    .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.attendanceTakenDays}/${reqAttendanceIndex}`)
    .set(selectedDay)

    for(const s of studentsInfoAndAttendance.values()){
      database()
      .ref(`${strLiterals.attendance}/${courseSelected}/${selectedClass.department_year}/${selectedClass.section}/${strLiterals.studentsAttendance}/${s.studentId}/${reqAttendanceIndex}`)
      .set(s.attendance, (error) => {
        if (error) {
          // The write failed...
        } else {
          // Data saved successfully!

          // this is the last write
          if(s.rollNo === studentsInfoAndAttendance[studentsInfoAndAttendance.length - 1].rollNo){
            setAttendanceUploading(false)
            showSnackbar('Attendance Saved Successfully','white', '#3DBE29', true )
          }
        }
      })

    }
  }



  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {() => {
            //console.log('going back from register', [...attendanceTakenDays])
            navigation.goBack()
          }}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>{dateString}</Title>
        </Body>
        <Right>
          {attendanceUploading ? (
            <Spinner style = {{marginEnd: 5}}/>
          ):(
            <Button info rounded small
            onPress = {() => {
              if( !attendanceUploading){
                setAttendanceUploading(true)
                uploadAttendance()
              }
            }}
            >
              <Text style = {{fontWeight:'bold', fontSize: 13}}>Save</Text>  
            </Button>
          )}
        </Right>
      </Header>

      {!studentsInfoAndAttendance ? (
        <EmptyContainer />
      ):(
        <Content
        contentContainerStyle = {{paddingTop: 5}}
        stickyHeaderIndices = {[0]}
        >
          <Row style = {{alignItems:'center', backgroundColor:'white'}}>
            <View 
            style = {[styles.inputContainer, {flex: 1}]}>
              <Input
              placeholder = 'RollNo'
              placeholderTextColor = '#CAD5E2'
              keyboardType = 'numeric'
              value = {searchedRollNo}
              onChangeText={(text) => setSearchedRollNo(text)}
              onFocus = {() => setSearchedName(null)}
              />
            
              <TouchableOpacity onPress = {() => setSearchedRollNo(null)}>
                <Icon type = 'Entypo' name = 'cross' style = {styles.crossIcon}/>
              </TouchableOpacity>
            </View>
            <View 
            style = {[styles.inputContainer, {flex: 2.5, marginStart:0}]}>
              
              <Input
              placeholder = 'Search Name'
              placeholderTextColor = '#CAD5E2'
              value = {searchedName}
              onChangeText={(text) => setSearchedName(text)}
              onFocus = {() => setSearchedRollNo(null)}
              />
            
              <TouchableOpacity onPress = {() => setSearchedName(null)}>
                <Icon type = 'Entypo' name = 'cross' style = {styles.crossIcon}/>
              </TouchableOpacity>
            </View>
          </Row>
          
          {studentsInfoAndAttendance.map((item, index) => {
            if(searchedRollNo){
              if(!item.rollNo.toString().includes(searchedRollNo)){
                return
              }
            }
            if(searchedName){
              if(!item.name.includes(searchedName)){
                return
              }
            }
            return(
            <TouchableWithoutFeedback
            key = {item.studentId}
            onPress = {() => {
              studentsInfoAndAttendance[index].attendance = !studentsInfoAndAttendance[index].attendance
              setStudentsInfoAndAttendance([...studentsInfoAndAttendance])
            }}>
            <View>
              <View
              style = {{
                flexDirection: 'row-reverse',
                alignItems: 'center',
                paddingHorizontal: 10,
                paddingVertical: 8,
                justifyContent:'space-between'
              }}
              > 
                
                <CheckBox 
                style = {{marginStart: 30}}
                checked = {item.attendance}
                onPress = {() => {
                  studentsInfoAndAttendance[index].attendance = !studentsInfoAndAttendance[index].attendance
                  setStudentsInfoAndAttendance([...studentsInfoAndAttendance])
                }}
                />
                
                <VerticalLine />
                
                <View style = {{flex:1, flexDirection: 'row', alignItems: 'center',}}>
                  <Text style = {{fontSize: 20, marginEnd: 10}}>
                  {item[strLiterals.rollNo]}</Text>
                  
                  <VerticalLine />
                  
                  <Text style = {{fontSize: 19, marginHorizontal: 10, flex: 1}}>
                  {item[strLiterals.name]}</Text>
                </View>
              </View>
              <HorizontalLine />
            </View>
            </TouchableWithoutFeedback>
            ) 
          })}
          
        </Content>
      ) 
      }

    </Container>

  )
}

AttendanceRegister.propTypes = {
  userDetails: propTypes.object.isRequired,
}// isRequired makes sure that prop passed to Home must not be NULL
  
//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
})

export default connect(mapStateToProps)(AttendanceRegister)

const styles = StyleSheet.create({
  inputContainer:{
    flexDirection: 'row', alignItems: 'center', justifyContent:'space-between',
    margin:5, paddingHorizontal: 5,
    borderColor: Color('gray').lighten(0.2).hex(),  //Color('#CAD5E2').darken(0.2).hex()
    borderWidth: StyleSheet.hairlineWidth
  },
  crossIcon:{
    color: Color('gray').lighten(0.2).hex()
  }
})