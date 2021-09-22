import React, {useEffect, useState} from 'react';
import {StyleSheet,View, FlatList, SafeAreaView, TouchableOpacity, Modal,
    useWindowDimensions} from 'react-native';
import {
    Container,
    Content,
    Header,
    Left,
    Right,
    Body,CheckBox,
    Badge, Text, Icon, Title, Item, Row, Col, Button, Input
} from 'native-base';
import {Picker} from '@react-native-picker/picker';
import {strLiterals} from '../utils/StringsInDatabase'
import database from '@react-native-firebase/database'
import auth from "@react-native-firebase/auth";

import Snackbar from 'react-native-snackbar'

import EmptyContainer from '../components/EmptyContainer'

const designations = [strLiterals.student, strLiterals.teacher, strLiterals.otherDesignation]

const departments = [strLiterals.bca, strLiterals.ba, strLiterals.bcom, strLiterals.bba, strLiterals.mcom, strLiterals.ma]
const years = [strLiterals.first_year, strLiterals.second_year, strLiterals.third_year]
const sections = [strLiterals.section_A, strLiterals.section_B, strLiterals.section_C]

const coursesLiterals = [
  'Computer Graphics',
  'E-Commerce',
  'VB_Net',
  'Major Project',
  
  'Software Project Management',
  'Data Structures',
  'DBMS',
  'Operating Systems and Linux',
  'Computer Oriented Numerical Methods',
  'C++',
  'Java Programming',
  'Web Programming',
  'Environment Education',
  'Punjabi',
  'English',
  'Journalism and Mass Communication',
  'Sociology'
  
]

//userDetails is the details of the user who is logged in
const CreateAccount = ({navigation}) => {

  const [designation, setDesignation] = useState(null)
  const [name, setName] = useState(null)
  const [rollNo, setRollNo] = useState(null)

  const [department, setDepartment] = useState(null)
  const [year, setYear] = useState(null)
  const [section, setSection] = useState(null)
  const [coursesStr, setCoursesStr] = useState(null)

  const [coursesArr, setCoursesArr] = useState([])

  const [coursesObj, setCoursesObj] = useState({})

  const [noticeBoardPermissions, setNoticeBoardPermissions] = useState({
    [strLiterals.read]: {[strLiterals.dept]:null, [strLiterals.year]: null},
    [strLiterals.write]: {[strLiterals.dept]:null, [strLiterals.year]: null}
  })

  console.log(coursesObj)
  console.log(noticeBoardPermissions)

  useEffect(() => {
    return () => {
    }
        
  }, [])   

/**
 * <Input
            style = {{backgroundColor: 'lightgreen'}}
            placeholder="Courses"
            placeholderTextColor = 'gray'
            value={coursesStr}
            onChangeText = {text => setCoursesStr(text)}
            onSubmitEditing = {() => {
              coursesArr.length = 0
              Object.keys(coursesObj).forEach(element => delete coursesObj[element])
              coursesStr.split(',').forEach(element => {
                const course = element.trim()
                if(element === ''){
                  return
                }

                coursesArr.push(course)
                
                if(designation === strLiterals.teacher){
                  coursesObj[course] = [{dept_year: null, sections: null}]
                }
              });
              if(designation === strLiterals.teacher){
                setCoursesObj({...coursesObj})
              }
              setCoursesArr([...coursesArr])
            }}
            />
 */
  
  const createAccount = () => {
    let email
    if(designation === strLiterals.student){
      email = name.split(' ')[0].toLowerCase() + rollNo.split('/')[0] + '@epggc.com'
    }else{
      email = name.split(' ')[0].toLowerCase() + '@epggc.com'
    }

    const password = '123456'

    auth()
    .createUserWithEmailAndPassword(email, password)
    .then((data) => {
      console.log(data)
      console.log("User creation was successful")

      Snackbar.show({
          text: 'account created',
          textColor: 'white',
          backgroundColor: "#1b262c"
      })

      let coursesDb = null
      if(designation === strLiterals.student){
        coursesDb = [...coursesArr]
      }
      else if(designation === strLiterals.teacher){
        coursesDb = {}
        Object.keys(coursesObj).forEach(course => {
          coursesDb[course] = {}
          coursesObj[course].forEach(item => {
            coursesDb[course][item.dept_year] = item.sections
          })
        })
      }

      database()
      .ref('/users/' + data.user.uid)
      .set({
        name: name,
        [strLiterals.rollNo]: rollNo,
        uid: data.user.uid,
        [strLiterals.designation]: designation,
        [strLiterals.courses] : coursesDb,
        [strLiterals.dept] : department,
        [strLiterals.year]: year,
        [strLiterals.section]: section,
        [strLiterals.noticeBoardPersmissions]: noticeBoardPermissions
      }, (error) => {
        if (error) {
          console.log(error)
          Snackbar.show({
              text: "SignUp failed",
              textColor: "green",
              backgroundColor: "red"
          })
        } else {
          console.log('Data is set.')
          Snackbar.show({
            text: 'Data is set',
            textColor: 'green',
            backgroundColor: "#1b262c"
          })
        }
      })

      if(designation === strLiterals.student){
        coursesDb.forEach(course => {
          database()
          .ref(`${strLiterals.attendance}/${course}/${department} ${year}/${section}/${strLiterals.studentsAttendance}/${data.user.uid}`)
          .set('N')
        })
      }
    })
    .catch((error) => {
        console.log(error)
        Snackbar.show({
            text: "SignUp failed",
            textColor: "white",
            backgroundColor: "red"
        })
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
          <Title>CreateAccount</Title>
        </Body>
        <Right>
          <Button transparent
          onPress = {() => {
            createAccount()
          }}
          >
            <Icon type = 'Entypo' name = 'upload' style = {{fontSize: 30}} />
          </Button>
        </Right>
      </Header>
      
      <Content padder>
        <Picker
        style={{flex: 1}}
        mode = "dropdown"
        selectedValue={designation}
        onValueChange={(itemValue) => setDesignation(itemValue)}
        > 
          <Picker.Item 
          label= "designation" value= {null} 
          style = {{alignSelf: 'center', color: 'gray'}}
          />
          {designations.map((item, index) => (
            <Picker.Item 
            key = {index}
            label= {item} value={item} 
            style = {{alignSelf: 'center', color: 'black'}}
            />
          ))}
        </Picker>
        
        <Input
        placeholder="name"
        placeholderTextColor = 'gray'
        value={name}
        onChangeText = {text => setName(text)}
        />
        
        {designation === strLiterals.student &&
          <Input
          placeholder="RollNo"
          placeholderTextColor = 'gray'
          value={rollNo}
          onChangeText = {text => setRollNo(text)}
          />
        }
        
        
        <Row style ={{alignItems: 'center'}}>

          <Picker
          style={{flex: 1}}
          mode = "dropdown"
          selectedValue={department}
          onValueChange={(itemValue) => setDepartment(itemValue)}
          > 
            <Picker.Item 
            label= "department" value= {null} 
            style = {{alignSelf: 'center', color: 'gray'}}
            />
            {departments.map((item, index) => (
              <Picker.Item 
              key = {index}
              label= {item} value={item} 
              style = {{alignSelf: 'center', color: 'black'}}
              />
            ))}
          </Picker>

          {designation === strLiterals.student &&
            <Picker
            style={{flex: 1}}
            mode = "dropdown"
            selectedValue={year}
            onValueChange={(itemValue) => setYear(itemValue)}
            > 
              <Picker.Item 
              label= "year" value= {null} 
              style = {{alignSelf: 'center', color: 'gray'}}
              />
              {years.map((item, index) => (
                <Picker.Item 
                key = {index}
                label= {item} value={item} 
                style = {{alignSelf: 'center', color: 'black'}}
                />
              ))}
            </Picker>
          }

          {designation === strLiterals.student &&
            <Picker
            style={{flex: 1}}
            mode = "dropdown"
            selectedValue={section}
            onValueChange={(itemValue) => setSection(itemValue)}
            > 
              <Picker.Item 
              label= "section" value= {null} 
              style = {{alignSelf: 'center', color: 'gray'}}
              />
              {sections.map((item, index) => (
                <Picker.Item 
                key = {index}
                label= {item} value={item} 
                style = {{alignSelf: 'center', color: 'black'}}
                />
              ))}
            </Picker>

          }

        </Row>
        
        {(designation === strLiterals.teacher || designation === strLiterals.student) &&
          <View style = {{padding: 10}}>
            <Text style = {{color: 'gray'}}>Check Courses u want to include</Text>
            {coursesLiterals.map((course, index) => (
              <Row>
                <CheckBox 
                style = {{marginEnd: 10}}
                checked = {coursesArr.includes(course)}
                onPress = {() => {
                  const i = coursesArr.findIndex((item) => item === course)
                  if(i === -1){  // means it is not present
                    coursesArr.push(course)
                    setCoursesArr([...coursesArr])
                    if(designation === strLiterals.teacher){
                      coursesObj[course] = [{dept_year: null, sections: null}]
                      setCoursesObj({...coursesObj})
                    }
                  }
                  else{
                    coursesArr.splice(i, 1)
                    setCoursesArr([...coursesArr])
                    if(designation === strLiterals.teacher){
                      delete coursesObj[course] 
                      setCoursesObj({...coursesObj})
                    }
                  }
                }}
                />
                <Text>{course}</Text>
              </Row>
            ))

            }
            
            {designation === strLiterals.student &&
              coursesArr.map((item) => (
                
                  <Text>{item}</Text>
                
              ))
            }

            {designation === strLiterals.teacher && coursesArr &&
              Object.keys(coursesObj).map((item, index) => {
                
                return(
                <View>
                  <Row style = {{alignItems:'center'}}>
                    <Text>{item}</Text>
                    <Button 
                    onPress = {() =>{ 
                      coursesObj[item].push({dept_year: null, sections: null})
                      setCoursesObj({...coursesObj})
                    } }
                    style = {{marginStart: 30}}>
                      <Text>Add</Text>
                    </Button>
                  </Row>

                  {coursesObj[item].map((val, i) => (
                    <View style = {{marginHorizontal: 20, flexDirection: 'row', justifyContent:'space-between', alignItems:'center'}}>
                      <Input 
                      placeholder="dept year"
                      placeholderTextColor = 'gray'
                      value={coursesObj[item][i].dept_year}
                      onChangeText = {text => {
                        coursesObj[item][i].dept_year = text
                        setCoursesObj({...coursesObj})
                      }}
                      />
                      <Input 
                      placeholder="sections"
                      placeholderTextColor = 'gray'
                      value={coursesObj[item][i].sections}
                      onChangeText = {text => {
                        coursesObj[item][i].sections = text
                        setCoursesObj({...coursesObj})
                      }}
                      />
                      <TouchableOpacity 
                      onPress = {() => {
                        coursesObj[item].splice(i,1)
                        setCoursesObj({...coursesObj})
                      }}
                      >
                        <Text style = {{color:'darkred'}}>Delete</Text>
                      </TouchableOpacity>

                    </View>
                  ))

                  }
                  
                </View>
              )})
            }

          </View>

        }

        <View style = {{height: 20}}/>

        <Text style = {{fontWeight: 'bold'}}>Notice Board Permissions</Text>
        <Row style = {{marginHorizontal: 20, alignItems: 'center', justifyContent:'space-between'}}>
          <View  >
            <Text>Read</Text>
            <Input 
            placeholder = 'department'
            placeholderTextColor = 'darkgray'
            value = {noticeBoardPermissions[strLiterals.read][strLiterals.dept]}
            onChangeText = {text => {
              noticeBoardPermissions[strLiterals.read][strLiterals.dept] = text.trim()
              setNoticeBoardPermissions({...noticeBoardPermissions})
            }}
            />
            <Input 
            placeholder = 'year'
            placeholderTextColor = 'darkgray'
            value = {noticeBoardPermissions[strLiterals.read][strLiterals.year]}
            onChangeText = {text => {
              noticeBoardPermissions[strLiterals.read][strLiterals.year] = text.trim()
              setNoticeBoardPermissions({...noticeBoardPermissions})
            }}
            />
            {noticeBoardPermissions[strLiterals.read][strLiterals.dept]?.split(',').length === 1 &&
            noticeBoardPermissions[strLiterals.read][strLiterals.year]?.split(',').length === 1 &&
            
            <Input 
              placeholder = 'section'
              placeholderTextColor = 'darkgray'
              value = {noticeBoardPermissions[strLiterals.read][strLiterals.section]}
              onChangeText = {text => {
                noticeBoardPermissions[strLiterals.read][strLiterals.section] = text.trim()
                setNoticeBoardPermissions({...noticeBoardPermissions})
              }}
              />
              
            }
          
          </View>
          <View  >
            <Text>Write</Text>
            <Input 
            placeholder = 'department'
            placeholderTextColor = 'darkgray'
            value = {noticeBoardPermissions[strLiterals.write][strLiterals.dept]}
            onChangeText = {text => {
              noticeBoardPermissions[strLiterals.write][strLiterals.dept] = text.trim()
              setNoticeBoardPermissions({...noticeBoardPermissions})
            }}
            />
            <Input 
            placeholder = 'year'
            placeholderTextColor = 'darkgray'
            value = {noticeBoardPermissions[strLiterals.write][strLiterals.year]}
            onChangeText = {text => {
              noticeBoardPermissions[strLiterals.write][strLiterals.year] = text.trim()
              setNoticeBoardPermissions({...noticeBoardPermissions})
            }}
            />
            {noticeBoardPermissions[strLiterals.write][strLiterals.dept]?.split(',').length === 1 &&
            noticeBoardPermissions[strLiterals.write][strLiterals.year]?.split(',').length === 1 &&
              <Input 
              placeholder = 'section'
              placeholderTextColor = 'darkgray'
              value = {noticeBoardPermissions[strLiterals.write][strLiterals.section]}
              onChangeText = {text => {
                noticeBoardPermissions[strLiterals.write][strLiterals.section] = text.trim()
                setNoticeBoardPermissions({...noticeBoardPermissions})
              }}
              />

            }
          
          </View>
        </Row>

      </Content>
        
    </Container>
        
    )
}

export default CreateAccount

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
    
  });