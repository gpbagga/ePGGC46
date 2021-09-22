import React, {useRef,useState, useEffect, useCallback}  from 'react'
import {FlatList, useWindowDimensions,View, Image, SafeAreaView, TouchableOpacity, Platform} from 'react-native'
import Color from 'color'
import FileViewer from 'react-native-file-viewer';
import {SET_ASSIGNMENT_STATE} from '../action/action.types'
import RNFS from 'react-native-fs';

import {connect, useDispatch} from 'react-redux'
import DocumentPicker from "react-native-document-picker";

import Animated, { lessOrEq, useCode } from 'react-native-reanimated'
const {
  call,
  block,
  cond,
  eq,
  set,
  Value,
  event, 
  add,
  multiply,
  sub,
  useValue,
  debug,
  divide,
  sqrt
  } = Animated
  
import {
  PanGestureHandler, PinchGestureHandler,State,
} from 'react-native-gesture-handler'

import {
  ListItem,
  Button,
  Content,
  CardItem,
  Thumbnail,
  Text,
  Icon,
  Left,
  Header,
  Title,
  Body,
  Right,
  Row,
  Container,
  H3, Badge, 
  Spinner
} from 'native-base';
import { strLiterals } from '../utils/StringsInDatabase';
import { fileTypes_Extensions } from '../utils/FileTypeExtensions';
import Snackbar from 'react-native-snackbar';
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage';
import showSnackbar from '../utils/showSnackbar';
import {onBackPress} from '../utils/backPressHandler';

import IconAccordingToFileType from '../components/IconAccordingToFileType'
import getTimeAgoStr from '../utils/getTimeAgoStr';
import getDueDateStr from '../utils/getDateTimeStr';
import { useFocusEffect } from '@react-navigation/core';

const toolbarProps = {
  toolbarHeight : Platform.OS === 'ios' ? 64 : 56,
  toolbarBtnColor : Platform.OS === 'ios' ? '#007aff' : '#fff',
  toolbarDefaultBg : Platform.OS === 'ios' ? '#F8F8F8' : '#3F51B5',
  titleFontfamily: Platform.OS === 'ios' ? 'System' : 'Roboto_medium',
  titleFontSize: Platform.OS === 'ios'  ? 17 : 19,
  titleFontColor: Platform.OS === 'ios' ? '#000' : '#FFF',
  subTitleFontSize: Platform.OS === 'ios' ? 11 : 14,
  subtitleColor: Platform.OS === 'ios' ? '#8e8e93' : '#FFF'

}

const AssignmentContent = ({navigation,userDetails, route, courses_assignmentId_seen, courses_newAssignmentCount}) =>{

  const { assObj, course, isComingFromHome } = route.params

  //console.log('rendering AssignmentContent')

  const dispatch = useDispatch()
  
  useEffect(() => {
    //console.log('useEffect assignment content');
    if(isComingFromHome && courses_assignmentId_seen && courses_assignmentId_seen[course][assObj.assignmentId] === false){
      courses_assignmentId_seen[course][assObj.assignmentId] = true
      dispatch({
        type: SET_ASSIGNMENT_STATE,
        payload: {
          assignments: [],
          aCourse_assignmentId_Seen: {[course]: {...courses_assignmentId_seen[course]}},
          aCourse_newAssignmentCount: {[course]: courses_newAssignmentCount[course] - 1}
        }
      })
      database()
        .ref(`users/${userDetails.uid}/${strLiterals.receivedAssignments}/${course}/${assObj.assignmentId}`)
        .set(true)
    }
  }, [])
  
  const [timeAgoStr] = useState(getTimeAgoStr(assObj[strLiterals.timestamp]))
  const [dueDateStr] = useState(getDueDateStr(assObj[strLiterals.dueDate]))

  const isStudent = userDetails[strLiterals.designation] === strLiterals.student
  
  const [prevSubmissionObj] = useState( (isStudent && 
    assObj[strLiterals.submissions] && assObj[strLiterals.submissions][userDetails.uid]) || null )
  
  //console.log(assObj)

  const [filesUploading, setFilesUploading] = useState(false)

  let assImages, assFiles
  if(assObj[strLiterals.imagesDownloadURLs]){
    assImages = [...assObj[strLiterals.imagesDownloadURLs]]
  }
  if(assObj[strLiterals.otherFiles]){
    assFiles = [...assObj[strLiterals.otherFiles]]
  }

  const [filesToBeSubmitted, setFilesToBeSubmitted] = useState([])

  const [fileOpeningSpinner, setFileOpeningSpinner] = useState(false)

  const window = useWindowDimensions()
  
  const [HEIGHT_IMG] = useState(window.height/(1.75))

  const panGestureRef = useRef()
  const pinchGestureRef = useRef()

  // consider adjustedFocal is a vector from center of image to focal point of touches
  const adjustedFocalX = useValue(0) //it is animated.Value node initialized with 0
  const adjustedFocalY = useValue(0)
  
  const pinchScale = useValue(1)
  
  const [zIndexFlatList, set_zIndexFlatlist] = useState(1)

  const [currImgIndexOnScreen, setCurrImgIndexOnScreen] = useState(0)

  const [flatListOffset] = useState({original: 0, current: 0})
  const fListOffsetAnim = useValue(0)

  const [panFlag, setPanFlag] = useState(false)

  const s = useValue(0)

  const offsetScale = useValue(1)

  const panFlagAnimated = useValue(0)

  const afterPinchTransX = useValue(0)
  const afterPinchTransY = useValue(0)

  const translateX = useValue(0)
  const translateY = useValue(0)

  const initialFocalX = useValue(0)
  const initialFocalY = useValue(0)

  const onPanGestureEvent = event([
    {
      nativeEvent: ({
        translationX: trans_x,
        translationY: trans_y,
        oldState,
        state }) =>
      block([
        // below condition is important because sometimes panGesture is not enabled but still this gestureEvent gets triggered(i dont know why)
        cond(eq(panFlagAnimated, 1),[
          cond(eq(state, State.ACTIVE),[
            set(translateX, trans_x),
            set(translateY, trans_y),
          ]),
          cond(eq(oldState, State.ACTIVE),[
            set(afterPinchTransX, add(afterPinchTransX, divide(translateX, offsetScale))),
            set(afterPinchTransY, add(afterPinchTransY, divide(translateY, offsetScale))),
            set(translateX, 0),
            set(translateY, 0),
            
          ])
        ])
      ]),
      
    }
  ])

  const onPinchGestureEvent = event([
    { 
      nativeEvent: ({ 
        scale: scale,
        focalX: focalX,
        focalY: focalY,
        state,
        oldState
        }) => 
        block([
          cond(eq(state, State.ACTIVE),[
            
            cond(eq(s, 0),[
              cond(eq(panFlagAnimated, 0), [
                //here handler attached to individual image of flatlist is handling
                //so offsetScale is 1, afterPinchTrans is 0
                
                set(adjustedFocalX, sub(focalX, window.width/2)),
                set(adjustedFocalY, sub(focalY, HEIGHT_IMG/2)),

                // to translate using focal difference
                set(initialFocalX, focalX),
                set(initialFocalY, focalY),

              ],[
                set(adjustedFocalX, divide(sub(focalX, add(window.width/2, translateX, multiply(afterPinchTransX, offsetScale) ) ), offsetScale )),
                set(adjustedFocalY, divide(sub(focalY, add(fListOffsetAnim,HEIGHT_IMG/2, translateY, multiply(afterPinchTransY, offsetScale) ) ), offsetScale )),
                // height of image = HEIGHT_IMG so center point = flatlist + HEIGHT_IMG/2
                //flatListOffset was coming equal to 0 so we used its animated node
              ]),
              
              set(s, scale),
              
            ],[
              
              cond(eq(panFlagAnimated, 0), [
                set(translateX, sub(focalX, initialFocalX)),
                set(translateY, sub(focalY, initialFocalY)),
              ]),

              set(pinchScale, divide(scale, s)),

            ])
        ]),
        
        cond(eq(oldState, State.ACTIVE),[
          
          set(offsetScale, multiply(offsetScale, pinchScale)),
          
          cond(lessOrEq(offsetScale,1),[
            set(panFlagAnimated, 0),

            set(translateX, 0),
            set(translateY, 0),
            set(afterPinchTransX, 0),
            set(afterPinchTransY, 0),
            
            set(pinchScale, 1),
            set(offsetScale, 1),
          ],[
            set(panFlagAnimated, 1),

            set(afterPinchTransX, sub(divide(afterPinchTransX, pinchScale), sub(
              adjustedFocalX,
              divide(adjustedFocalX, pinchScale)
            ) ) ),
            
            set(afterPinchTransY, sub(divide(afterPinchTransY, pinchScale), sub(
              adjustedFocalY,
              divide(adjustedFocalY, pinchScale)
            ) ) ),

            set(pinchScale, 1),
          ]),

          set(s, 0),

        ])
      ])
      }]
    );

  useCode(() => {
    return call([panFlagAnimated, s], ([panFlagAnimated, s]) => {
      if(panFlagAnimated === 0){
        setPanFlag(false)
        //console.log("pan flag is set to false")

        if(s !== 0){
          //it will be true when user starts pinching image from original position of image
          set_zIndexFlatlist(10)
        }else{
          //it will be true when image returns to its original position after being zoomed and translated
          set_zIndexFlatlist(1)
        }

      }
      else{
        setPanFlag(true)
        //console.log("pan flag is set to true")
      }
    })
  }, [panFlagAnimated, s])

  const chooseDocument = async() => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx
        ],
      });

      const filesAr = []
      for (const res of results) {
        filesAr.push({
          name: res.name,
          type: (res.type != null && res.type) || 'N',   //res.type be null if type is other than above listed ones
          uri: res.uri
        })
        //console.log(res);
      }
      setFilesToBeSubmitted([...filesToBeSubmitted,...filesAr])
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  }

  const submitFiles = () =>{
    
    if(filesToBeSubmitted.length === 0){
      showSnackbar('Please pick one or more files to submit', 'white','red', true )
      setFilesUploading(false)
      return
    }

    const myStorageRef = storage().ref(`${strLiterals.assignments}/${course}/${assObj[strLiterals.assignmentId]}/${strLiterals.submissions}/${userDetails.uid}`);
    
    // delete previous submitted files if any
    // Find all the items.
    myStorageRef.listAll()
      .then((result) => {
        result.items.forEach((itemRef) => {
          itemRef.delete()
        });
      }).catch((error) => {
        //console.log(error)
      });

    // Now upload new picked files
    const myObj = {
      [strLiterals.downloadURLs] : [],
      [strLiterals.names]: [],
      [strLiterals.types] : []
    }
    
    filesToBeSubmitted.forEach((item) => {
      const reference = myStorageRef.child(item.name)
      const task = reference.putFile(item.uri)
      //this item.uri is path of file from mobile
      
      task.then(async () => {
        const url = await reference.getDownloadURL()  
        /// we used await keyword because getDownloadURL() is async func and we can't easily get its return value
        
        myObj[strLiterals.downloadURLs].push(url)
        myObj[strLiterals.names].push(item.name)
        myObj[strLiterals.types].push(item.type)
        
        if(myObj[strLiterals.downloadURLs].length === filesToBeSubmitted.length){
          
          myObj[strLiterals.timestamp] = database.ServerValue.TIMESTAMP
          //console.log(`${strLiterals.assignments}/${course}/${assObj[strLiterals.assignmentId]}/${strLiterals.submissions}/${userDetails.uid}`)
          database().ref(`${strLiterals.assignments}/${course}/${assObj[strLiterals.assignmentId]}/${strLiterals.submissions}/${userDetails.uid}`)
          .set({...myObj},
          (error) => {
            setFilesUploading(false)
            if(error){
              showSnackbar("Some error occured", 'white', 'red', true)
            }else{
              //Data saved successfully
              showSnackbar("Assignment Submitted Successfully","white", "#3DBE29", true )
            }
          }
          )
            
       }
      })
    })
  }

  function handleBackPress() {
    navigation.goBack()
  }

  return(
    
    <PanGestureHandler
    avgTouches
    ref = {panGestureRef}
    enabled = {panFlag}
    simultaneousHandlers = {pinchGestureRef}
    onGestureEvent = {onPanGestureEvent}
    onHandlerStateChange = {onPanGestureEvent}
    >
    <Animated.View style = {{flex: 1}}>
    <PinchGestureHandler
    ref = {pinchGestureRef}
    enabled = {panFlag}
    simultaneousHandlers = {panGestureRef}
    onGestureEvent = {onPinchGestureEvent}
    onHandlerStateChange = {onPinchGestureEvent}
    >
    <Animated.View style = {{flex: 1}}>
    <Container>
      
      <Content
      scrollEnabled = {!panFlag}
      contentContainerStyle = {{flexGrow: 1}}
      onMomentumScrollEnd = {(event) => {
        const _y_ = flatListOffset.original - event.nativeEvent.contentOffset.y
        flatListOffset.current = _y_
        fListOffsetAnim.setValue(flatListOffset.current)
          
      }}
      stickyHeaderIndices = {[0]}
      >

        <View style = {{
          height: toolbarProps.toolbarHeight, 
          backgroundColor: Color(toolbarProps.toolbarDefaultBg).darken(0.2).hex(),
        }}>
          <Row style = {{alignItems:'center'}}>
          
            <Button transparent style = {{alignSelf:'center'}} 
            onPress = {handleBackPress}
            >
              <Icon name='arrow-back-outline' style ={{color: toolbarProps.toolbarBtnColor}} />
            </Button>
          
            <Text style = {{
              fontSize: toolbarProps.titleFontSize,
              color: toolbarProps.titleFontColor,
              fontFamily: toolbarProps.titleFontfamily
            }}>Assignment</Text>
            
            <Right>
              {filesUploading ? (
                <Spinner style = {{marginEnd: 5}}/>
              ):(
                <Button transparent
                onPress = {() => {
                  if( !filesUploading){
                    setFilesUploading(true)
                    submitFiles()
                  }
                }}
                >
                  <Icon type = 'Entypo' name = 'upload' style = {{fontSize: 30, color: 'white'}} />
                </Button>
              )}
            </Right>
          </Row>
        </View>
        
        {isStudent &&
        <View style = {{padding: 7, marginTop:5}}>
          <Button  block iconLeft onPress = {chooseDocument}
          >
            <Icon type = 'AntDesign' name = 'addfile' />
            
            <Text style = {{fontSize: 16}}>Pick Files to Submit</Text>
          </Button>
          
          <View style = {{backgroundColor: '#ddecf8'}}>
            {prevSubmissionObj &&
              <View>
                
                <Text style = {{paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#b7daf8'}}>Submitted Files:</Text>
                {prevSubmissionObj[strLiterals.names].map((name, index) => {
                  return(
                    <ListItem thumbnail key ={index} >
                      
                      <IconAccordingToFileType type = {prevSubmissionObj[strLiterals.types][index]} />
                  
                      <Body>
                        <TouchableOpacity
                        onPress = {async()=>{
                          try {
                            showSnackbar('Please Wait...', 'white', '#1b262c', true)
        
                            const url = prevSubmissionObj[strLiterals.downloadURLs][index];
                            const fileExtension = fileTypes_Extensions[prevSubmissionObj[strLiterals.types][index]]
                            
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
                            showSnackbar('Something went wrong', 'white', 'red')
                          }
                          
                        }}
                        >
                          <Text>{name}</Text>
                        
                        </TouchableOpacity>
                      </Body>
                      <Right />
                    </ListItem>
                  )
                })}
                
              </View>
            }
            {prevSubmissionObj && filesToBeSubmitted.length > 0 &&
              <Text style = {{paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#b7daf8'}}>
              New Submission Files:{'\n'}(overwrites previous ones)</Text>
            }
            {filesToBeSubmitted.map((item, index) => {
              
              return(
              <ListItem thumbnail key ={index} >
                
                <IconAccordingToFileType type = {item.type} />
                
                <Body>
                  <TouchableOpacity onPress = {async() => {
                    await FileViewer.open(item.uri)
                      .catch(error => {});
                      // TODO make a toast here and show the error
                  }}>
                  
                    <Text>{item.name}</Text>
                  
                  </TouchableOpacity>
                </Body>

                <Right>
                  <TouchableOpacity onPress = {() => setFilesToBeSubmitted([...filesToBeSubmitted.filter(x => x !== item)])}>
                    <Icon 
                    type = 'MaterialCommunityIcons' name = 'delete'
                    style = {{color:'#000', fontSize:28}}
                    />
                  </TouchableOpacity>
                </Right>
                
              </ListItem>
            )})}
          </View>
        </View>
        }

        <View style = {{padding : 7 }}>
          <Row style = {{alignItems:'center'}}>
            <Text note>By: </Text>
            <Text>{assObj[strLiterals.by]}</Text>
          </Row>

          {assObj[strLiterals.about] &&
          
            <View style ={{marginTop: 5, flexDirection:'row', flexWrap:'wrap', alignItems:'center'}}>  
              <Text note>About: </Text>
              <Text style = {{fontSize: 18, fontWeight:'bold'}}>{assObj[strLiterals.about]}</Text>
            </View>
          }
          
          <Row style = {{marginTop:5, alignItems:'center'}}>
            <Text note>Due Date: </Text>
            <Text style = {{fontSize: 17, color: '#BF3312'}}>{dueDateStr}</Text>
          </Row>

        </View>

        
        {assImages &&
          <Badge style = {{backgroundColor:'#e0e0e0', alignSelf:'center', marginTop:5}}>
            <Text style = {{color: "#4a4a4a", fontSize: 13.5}}>
            {currImgIndexOnScreen + 1}/{assImages.length}
            </Text>
          </Badge>
        }
          
        {assImages && 
          
          <PinchGestureHandler
          enabled = {!panFlag}
          onGestureEvent = {onPinchGestureEvent}
          onHandlerStateChange = {onPinchGestureEvent}
          >
          <Animated.View 
          style = {{marginTop: 5, zIndex: zIndexFlatList}}
          onLayout = {(event) => {
            
            const _y = event.nativeEvent.layout.y
             
            flatListOffset.original = _y 
            flatListOffset.current = _y
            fListOffsetAnim.setValue(_y)
            //console.log('onLayout-',event.nativeEvent.layout.y)
          }}
          >
          <Animated.View style = {{width: window.width, height: HEIGHT_IMG,
            
            transform: 
            [
              {translateX},
              {translateY},
              
              {scale: offsetScale},
              
              {translateX: afterPinchTransX},
              {translateY: afterPinchTransY},
              
              {translateX: adjustedFocalX },
              {translateY: adjustedFocalY },
              
              {scale: pinchScale},
              
              {translateX: multiply(-1,adjustedFocalX)},
              {translateY: multiply(-1,adjustedFocalY)},
            ]}}
             
          >
          
          <FlatList
          
          showsHorizontalScrollIndicator = {false}
          
          onMomentumScrollEnd = {(event) => {
            
            //console.log(event.nativeEvent.contentOffset.x/window.width)
            setCurrImgIndexOnScreen(Math.round(event.nativeEvent.contentOffset.x/window.width))
            
          }}
          

          horizontal = {true}
          
          decelerationRate = {'fast'}
          snapToInterval = {window.width}
          snapToAlignment = {'center'}
          disableIntervalMomentum = {true}
          keyExtractor = {(item, index)=> index}
          data = {assImages}
          renderItem = {({item, index, separators}) => {
            
            return(
              
              <Image
              source = {{uri: item}} 
              style = {{
                flex:1,
                height: HEIGHT_IMG,
                width : window.width,
                resizeMode:'contain'}}
                />
                )
            }}
          />
          </Animated.View>
          </Animated.View>
          </PinchGestureHandler>    
               
        }
        
        {assFiles &&
          <View style = {{marginTop:7}}>
            <FlatList
            horizontal = {true}
            showsHorizontalScrollIndicator = {false}
            decelerationRate = {'fast'}
            snapToInterval = {window.width}
            snapToAlignment = {'center'}
            disableIntervalMomentum = {true}
            keyExtractor = {(item, index) => index}
            data = {assFiles}
            renderItem = {({item, index, separators}) => {
              return(
                <TouchableOpacity
                
                onPress = {async()=>{
                  try {
                    setFileOpeningSpinner(true)

                    const url = item[strLiterals.downloadURL];

                    // Feel free to change main path according to your requirements.
                    // IMPORTANT: A file extension is always required on iOS.
                    // You might encounter issues if the file extension isn't included
                    // or if the extension doesn't match the mime type of the file.
                    const fileExtension = fileTypes_Extensions[item[strLiterals.type]]
                    
                    const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile${fileExtension}`;
                    
                    const options = {
                      fromUrl: url,
                      toFile: localFile
                    };
                    RNFS.downloadFile(options).promise
                    .then(() => 
                      FileViewer.open(localFile)
                      .then(() => {
                        setFileOpeningSpinner(false)
                      })
                      .catch(error => {
                        setFileOpeningSpinner(false)

                        Snackbar.show({
                          text: error.toString(),
                          textColor: 'white',
                          backgroundColor:'red'
                        })
                      })
                    );
                  }
                  catch(e) {
                    setFileOpeningSpinner(false)
                    Snackbar.show({
                      text: 'Something went wrong.',
                      textColor: 'white',
                      backgroundColor:'red'
                    })
                  }
                  
                }}
                >            
                  <Row 
                  style = {{
                    padding:10,  
                    justifyContent:'space-between',
                    backgroundColor: "#e8e8e8",
                    alignItems: 'center', 
                    width: window.width,
                    height: 50,
                    elevation: 3,   // to put shadow under row (ANDROID)
                    marginBottom: 8, //if you don't put margin then shadow won't be visible
                    
                    shadowColor: '#000',                      //(IOS)
                    shadowOffset: { width: 0, height: -3 },   //(IOS)
                    shadowOpacity: 0.3,                       //(IOS)
                    shadowRadius: 2,                          //(IOS)
                  }}>
                    <Row style = {{alignItems: 'center'}}>
                      <Text style = {{color:"#4d4b4b",marginEnd:15,fontSize: 13.5}}>
                      {index + 1}/{assFiles.length}
                      </Text>                  
                      
                      <IconAccordingToFileType type = {item.type} />
                      
                      <Text style = {{fontSize: 18, marginStart:10}}>
                      {item[strLiterals.name]}
                      </Text>
                    </Row>

                    {fileOpeningSpinner &&
                      <Spinner />
                    }
                    
                  </Row>
                </TouchableOpacity>
                    
            )
            }}
            />
          </View>
        }
        
        {assObj[strLiterals.task] &&
          <Text style = {{padding:7,paddingTop: 5}}>
          {assObj[strLiterals.task]}
          </Text>
        }

        <Text note style = {{paddingStart: 7, marginBottom: 10}}>{timeAgoStr}</Text>
        
        
      </Content>
    
    </Container>
    </Animated.View>
    </PinchGestureHandler>
    </Animated.View>
    </PanGestureHandler>
    
    
  )
}

//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
  courses_assignmentId_seen: state.assignment.courses_assignmentId_seen,
  courses_newAssignmentCount: state.assignment.courses_newAssignmentCount
})

export default connect(mapStateToProps)(AssignmentContent)