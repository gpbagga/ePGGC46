import React, {useRef,useState, useEffect}  from 'react'
import {FlatList, Image,View, ScrollView, StyleSheet, 
  TouchableWithoutFeedback, TextInput, TouchableOpacity} from 'react-native'

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

import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import showSnackbar from '../utils/showSnackbar';
import {connect, useDispatch} from 'react-redux'
import { monthsShort } from '../utils/dateUtils';
import {strLiterals} from '../utils/StringsInDatabase'
import {onBackPress} from '../utils/backPressHandler';
import { fileTypes_Extensions } from '../utils/FileTypeExtensions';
import { addStudentsSubmissionsListener, removeStudentsSubmissionsListener} from '../action/assignment';

import Color from 'color'
import IconAccordingToFileType from '../components/IconAccordingToFileType'
import getDateTimeStr from '../utils/getDateTimeStr';

const lineColor = Color('#CAD5E2').lighten(0.1).hex()
const VerticalLine = () => (
  <View style = {{
    height: 30,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'gray'}}
    />
)
const HorizontalLine = () => (
  <View style = {{
    marginHorizontal:5,
    borderBottomColor: 'gray',
    borderBottomWidth: StyleSheet.hairlineWidth}}
    />
)
const AssignmentSubmissions = ({navigation, route, studentsSubmissionsState,
addStudentsSubmissionsListener, removeStudentsSubmissionsListener}) => {

  const { assignmentId, course } = route.params

  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const [searchedRollNo, setSearchedRollNo] = useState(null)
  const [searchedName, setSearchedName] = useState(null)


  function handleBackPress() {
    navigation.goBack()
  }

  useEffect(() => {
    //const backPressUnsubscriberFunc = onBackPress(handleBackPress);
    
    removeStudentsSubmissionsListener(assignmentId, course)
    addStudentsSubmissionsListener(assignmentId, course)

    return () => {
      removeStudentsSubmissionsListener(assignmentId, course)
      //backPressUnsubscriberFunc()
    }
  }, [])


  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {handleBackPress}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>Assignment Submissions</Title>
        </Body>
      </Header>

      <Content
      stickyHeaderIndices = {[0]}
      >
        <Row style = {{alignItems:'center', backgroundColor: '#253898'}}>
          <View 
          style = {[styles.inputContainer, {flex: 1}]}>
            
            <TextInput
              style = {styles.textInputStyle}
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
          style = {[styles.inputContainer, {flex: 4, marginStart:0}]}>
            
            <TextInput
            style = {styles.textInputStyle}
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
        
        {studentsSubmissionsState && 
          studentsSubmissionsState.map((item, index) => {
            if(searchedRollNo && !item.rollNo.toString().includes(searchedRollNo) ){
              return
            }
            if(searchedName && !item.name.includes(searchedName)){
              return
            }
            return(
              <View key = {index}>
                <TouchableOpacity 
                onPress = {() => setSelectedIndex((selectedIndex===index && -1) || index)}
                >
                  <View style = {{
                    flexDirection:'row-reverse',
                    justifyContent:'space-between',
                    padding:10, 
                    alignItems:'center',
                    backgroundColor: (selectedIndex === index && '#b7daf8') || '#fff'
                  }}>
                    {(selectedIndex === index &&
                      <Icon type = 'AntDesign' name = 'caretup' style = {{fontSize: 18}} />) ||
                      <Icon type = 'AntDesign' name = 'caretdown' style = {{fontSize: 18}} />
                    }  
                    <Row style ={{alignItems:'center'}}>
                      <Text style = {{marginEnd: 10}}>{item.rollNo}</Text>
                      <VerticalLine />
                      <Text style = {{marginStart: 10, flex: 1}}>{item.name}</Text>
                    </Row>
                  </View>
                  
                  
                </TouchableOpacity>
                <HorizontalLine />

                {selectedIndex === index &&
                  <View style = {{paddingHorizontal: 10,paddingTop: 5, backgroundColor: '#ddecf8'}}>
                    <Text style = {{color: '#6A1B4D'}}>
                      {getDateTimeStr(item.filesObj[strLiterals.timestamp])}
                    </Text>
                    {item.filesObj[strLiterals.names].map((name, i) => {
                      return(
                        <ListItem key = {i}>
                          <IconAccordingToFileType type = {item.filesObj[strLiterals.types][i]}/>
                          <TouchableOpacity
                          onPress = {async()=>{
                            try {
                              showSnackbar('Please Wait...', 'white', '#1b262c', true)
          
                              const url = item.filesObj[strLiterals.downloadURLs][i];
                              const fileExtension = fileTypes_Extensions[item.filesObj[strLiterals.types][i]]
                              
                              const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile${fileExtension}`;
                              
                              const options = {
                                fromUrl: url,
                                toFile: localFile
                              };
                              RNFS.downloadFile(options).promise
                              .then(() => 
                                FileViewer.open(localFile)
                                .then(() => {})
                                .catch(error => {
                                  showSnackbar(error.toString(), 'white', 'red', true)
                                })
                              );
                            }
                            catch(e) {
                              console.log(e)
                              showSnackbar('Something went wrong', 'white', 'red')
                            }
                            
                          }}
                          >
                            <Text style = {{flex: 1, marginStart: 10, textAlignVertical:'center'}}>{name}</Text>
                          </TouchableOpacity>
                        </ListItem>
                      )
                    })}
                  </View>
                }

              </View>
            )
          })
        }
      </Content>
      
    </Container>

  )
}
  
//....redux config....
const mapStateToProps = (state) => ({
  studentsSubmissionsState: state.assignment.studentsSubmissions,
})

const mapDispatchToProps = {
  addStudentsSubmissionsListener: (a,b) => addStudentsSubmissionsListener(a,b),
  removeStudentsSubmissionsListener: (a,b) => removeStudentsSubmissionsListener(a,b),
}

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentSubmissions)

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  inputContainer:{
    flexDirection: 'row', alignItems: 'center', justifyContent:'space-between',
    margin:5, paddingHorizontal: 5,
    borderColor: Color('gray').lighten(0.2).hex(),  //Color('gray').lighten(0.2).hex()
    borderWidth: StyleSheet.hairlineWidth
  },
  crossIcon:{
    color: Color('gray').lighten(0.2).hex(),
    fontSize: 18
  },
  textInputStyle:{
    height: 30, 
    fontSize: 13, 
    padding:0,
    color: 'white'
  }
})