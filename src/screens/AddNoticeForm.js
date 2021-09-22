//THis one is to be integrated in ePGGC app

import React, {useRef,useState, useEffect}  from 'react'
import {
  StyleSheet,Keyboard, Pressable, useWindowDimensions,TouchableOpacity,View,ScrollView, Image, TouchableNativeFeedback} from 'react-native'

import FileViewer from 'react-native-file-viewer';
import propTypes from 'prop-types'
import {connect} from 'react-redux'

import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage';

import DocumentPicker from "react-native-document-picker";
//import pdfFile from './src/assets/FrontPage.pdf'  //relative path
//import pdfFile from 'socialApp/src/assets/FrontPage.pdf'
import Modal from 'react-native-modal';
import ImagePicker, { openCropper } from 'react-native-image-crop-picker';

import {
    Spinner,
    CheckBox,
    Content,
    Fab,
    Icon,
    Text,
    Button,
    Left,
    Header,
    Title,
    Body,
    Right,
    Row,
    Container,
    H3, Col, ListItem, Badge,
    Form, Label, Input, Item, 
    H2,
    Thumbnail,
    List
  } from 'native-base';


import {totalYears} from '../utils/variables'
import {strLiterals} from '../utils/StringsInDatabase'
//import Snackbar from 'react-native-snackbar';

import showSnackbar from '../utils/showSnackbar'

import {fileTypes_Extensions} from '../utils/FileTypeExtensions'

///////IMPORTANT NOTE//////////
/*
  const [state, setState] = useState(initial value) declares and initializes new state of component
  setState changes the state given to its argument and causes the component to re-render after the current run of execution
  (re-render means it will execute the coding of whole component (here 'AddNoticeForm' 
    function) once again.
    On re-rendering, all states are retrieved "as they were" using useState() statement
    because useState() basically stores the state of component
    but all the other variables excluding useState() will be declared and initialized again
    )
  So if we we don't want to re-render the component but just wanna change the state 
  then don't use setState() and
  state must be initialized as an object and then we can add props to state
  and this will reflect the changes in state object in next render caused by any other way
  Don't directly assign some other value to state as it will not change the state
  or that change will not reflect in the state in next render

*/


//NOTE:- If non-state variables are initialized in functional components and changed 
//inside a component's event prop then that change will not be reflected in other 
//prop or other components(also applicable to arrays)
// So, Either declare constants or state variables  inside functional components

//NOTE: Always prefer to place FAB inside NativeBase <Container/>. Placing FAB 
//inside <Content/> is not encouraged, as <Content/> is an implementation of <ScrollView/>.

//NOTE: onBlur and onEndEditing are fired at the same time when textInput element gets unfocused or gets unselected

// variables declared outside the functional component does not change after unmounting of that component
// they are kinda private storage of this component or screen
// const courses = {}  
// const noticeBoardPermissions = {}
const HorizontalLine = () => (
  <View style = {{
    marginStart:15,
    borderBottomColor: '#CAD5E2',
    borderBottomWidth: StyleSheet.hairlineWidth}}
    // borderBottomWidth:StyleSheet.hairlineWidth
    />
)


const AddNoticeForm = ({route, navigation, userDetails}) =>{
  
  //console.log('hello')
  
  const window = useWindowDimensions()
  
  const [checkboxes, setCheckboxes] = useState([])
  
  //here route means:  from which route we are coming
  const { isCourseNotice } = route.params
  const [courses] = useState({})   // we don't need setCourses() function because we are not assigning some value to courses, we are just adding properties in it and also we don't want to re-render component when our object state is changed
  const [noticeBoardPermissions] = useState({})  //these permissions are for 'write'

  if(Object.keys(courses).length === 0 && Object.keys(noticeBoardPermissions).length === 0){
    
    if(isCourseNotice){

      for(var course in userDetails[strLiterals.courses])
      {
        courses[course] = {}
        for(var dept_year in userDetails[strLiterals.courses][course]){
          const sectionAr = userDetails[strLiterals.courses][course][dept_year].split(',')
          courses[course][dept_year] = sectionAr
        }
      }
      //setCourses({...courses})
      // we dont want to re-render component so we comment out setCourses
    }
    else{
      
      const writeOptions = userDetails[strLiterals.noticeBoardPersmissions][strLiterals.write]
      for(var k in writeOptions){
        
        noticeBoardPermissions[k] = writeOptions[k].split(',')
        
      }
      if( !writeOptions[strLiterals.section]){
        noticeBoardPermissions[strLiterals.section] = ['A', 'B', 'C']
      }

      //setNoticeBoardPermissions({...noticeBoardPermissions})

      checkboxes.push(new Array(noticeBoardPermissions[strLiterals.dept].length + 1).fill(false))
      checkboxes.push(new Array(noticeBoardPermissions[strLiterals.year].length + 1).fill(false))
      checkboxes.push(new Array(noticeBoardPermissions[strLiterals.section].length + 1).fill(false))
    
      
    }
  }

  // const courses = {
  //   'Java Programming':{
  //       'BCA, 1':['A', 'B'],
  //       'BA, 2': ['A', 'B'],
  //       'MA, 1': ['A', 'B', 'C'] 
  //   },
  //   'Environment Studies':{
  //       'BCA, 2':['A'],
  //       'BA, 3': ['A', 'B'],
  //       'MA, 1': ['A', 'B', 'C'] 
  //   },
  //   'ISDI':{
  //       'BCA, 2': ['A']
  //   },
  // }

  // const noticeBoardPermissions = {
  //   department: ['BCA', 'BA', 'BCOM', 'MA', 'MCOM'],
  //   year: [1,2,3],
  //   section: ['A', 'B', 'C']
  // }

  const [courseSelected, setCourseSelected] = useState(null)

  const [urgentCB, setUrgentCB] =useState(false)

  const [subject, setSubject] = useState('')
  const [noticeTxt, setNoticeTxt] = useState('')

  const [fabActive, setFabActive] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  const [images, setImages] = useState([])  //images is array of strings of path
  const [files, setFiles] = useState([]) 
  /**
   * files = {
    name: res.name,
    type: res.type,    //mime type
    uri: res.uri
    }
  */
    
  const [isModalVisible, setModalVisible] = useState(false)

  const [listExpanded, setListExpanded] = useState(true)

  const [isImageModalVisible, setImageModalVisible] = useState(false)
  const [modalImagePath, setModalImagePath] = useState('')

  const [noticeUploading, setNoticeUploading] = useState(false)
  
  const [targetGroups, setTargetGroups] = useState({})
  
  const isOnlyOneDeptChecked = () => {
    if(checkboxes[0][0]){
      return [false,null]
    }
    let count = 0;
    let checkedDept;
    for(var i = 1; i < checkboxes[0].length; i++){
      if(checkboxes[0][i]){
        
        count = count + 1;
        if(count > 1){
          break
        }
        checkedDept = noticeBoardPermissions[strLiterals.dept][i - 1]
      }
    }
    return [count === 1, checkedDept]; 
  }
  const isOnlyOneYearChecked = () => {
    if(checkboxes[1][0]){
      return [false, null]
    }
    let count = 0;
    let checkedYear;
    for(var i = 1; i < checkboxes[1].length; i++){
      if(checkboxes[1][i]){
        count = count + 1;
        if(count > 1){
          break
        }
        checkedYear = noticeBoardPermissions[strLiterals.year][i - 1]
      }
    }
    return [count === 1, checkedYear]; 
  }

  // every time some setState() function is called react native re-renders the component
  // means all coding inside this 'AddNoticeFunction' executes again. So
  // this below block of code is just to update targetGroups when one of the checkboxes is changed
  if(checkboxes.length !== 0 && (!isCourseNotice || courseSelected !== null)){

    //empty the targetGroups
    Object.keys(targetGroups).forEach((item) => {
      delete targetGroups[item]
    })
    // we can't do targetGroups = {} because it is a constant 

    if(isCourseNotice){

      if( !checkboxes.every(item => item[0] === false) ){
        
        //atleast one of the dept_year options is selected

        for( var i = 0 ; i < checkboxes.length; i++){
          if(checkboxes[i][0]){
            if(i === 0){
              
              for(var k in courses[courseSelected]){
                targetGroups[k] = [...courses[courseSelected][k]]
              }

              break;
            }
            else{
              const dept_year = Object.keys(courses[courseSelected])[i - 1] 

              if(checkboxes[i][1]){ //all sections is selected
                targetGroups[dept_year] = [...courses[courseSelected][dept_year]]
              }else{

                const arr = []

                for(var j = 2; j < checkboxes[i].length ; j++){
                  if(checkboxes[i][j]){
                    arr.push(courses[courseSelected][dept_year][j - 2])
                  }
                }

                targetGroups[dept_year] = [...arr]
              }

            }

          }
        }
        //console.log(targetGroups)
      }
      
      
    } 
    else{  // it is noticeBoard's notice
      let arr = []
      for( var i = 0 ; i< checkboxes[0].length; i++){
        if(checkboxes[0][i]){
          if(i === 0){
            arr = [...noticeBoardPermissions[strLiterals.dept]]
            break
          }
          else{
            arr.push(noticeBoardPermissions[strLiterals.dept][i - 1])
          }
        }
      }
      targetGroups[strLiterals.dept] = [...arr]
      
      arr = []

      for( var i = 0 ; i< checkboxes[1].length; i++){
        if(checkboxes[1][i]){
          if(i === 0){
            arr = [...noticeBoardPermissions[strLiterals.year]]
            break
          }
          else{
            arr.push(noticeBoardPermissions[strLiterals.year][i - 1])
          }
        }
      }
      targetGroups[strLiterals.year] = [...arr]
      
      if(targetGroups[strLiterals.dept].length === 1 && 
        targetGroups[strLiterals.year].length === 1){
          
        let arr = []
        for( var i = 0; i< checkboxes[2].length; i++){
          
          if(checkboxes[2][i]){
            if( i === 0){
              arr = [...noticeBoardPermissions[strLiterals.section]]
              break
            }
            arr.push(noticeBoardPermissions[strLiterals.section][i - 1])
          }
        }
        targetGroups[strLiterals.section] = [...arr]
        
      }    
      
    } 
  }
  
  const uploadNotice = () => {
    //subject is compulsory
    if(subject.length == 0 && noticeTxt.length === 0 && images.length === 0 && files.length === 0){
      
      showSnackbar("Please give some data to be uploaded","white", "red", true )
      setNoticeUploading(false)
      return
    }
    // to check if targetGroups is empty
    if(Object.keys(targetGroups).length === 0 && targetGroups.constructor === Object){
      if(isCourseNotice){
        showSnackbar("Please select atleast one Target Group","white", "red", true )
      }else{
        showSnackbar("Please select Target Department","white", "red", true )
      }
      setNoticeUploading(false)
      return
    }

    for(var k in targetGroups){
      if(targetGroups[k].length === 0){
        if(isCourseNotice){
          showSnackbar("Please select Section for " + k,"white", "red", true )
        }else{
          showSnackbar("Please select Target " + k,"white", "red", true )
        }
        setNoticeUploading(false)
        return  
      }
    }
    

    // Now we have checked all conditions
    //Now we are all set to upload notice
    
    let objToBeUploaded = {
      userId: userDetails.uid,
      by: userDetails.name,
      noticeText: noticeTxt.length !== 0 ? noticeTxt : null,
      subject: subject.length !== 0 ? subject : null,
      timestamp: database.ServerValue.TIMESTAMP
    }
    //ServerValue.TIMESTAMP is just a token that Firebase Realtime Database converts
    // to a number on server side when it's used as a child value during write 
    // operation. The date only appears in the database after the write operation completes.

    let newNoticeIdRef
    
    if(isCourseNotice){

      newNoticeIdRef = database()
      .ref(`/${strLiterals.coursesNoticeBoard}/${courseSelected}`)
      .push()

      const obj = {}
      for(var k in targetGroups){
        obj[k] = targetGroups[k].toString()
      }
      objToBeUploaded[strLiterals.targetGroups] = {...obj}

      //don't write below code because it will freeze targetGroups and make it immutable
      //objToBeUploaded[strLiterals.targetGroups] = targetGroups
      
    }
    else{ //it is noticeBoard's notice
      
      newNoticeIdRef = database().ref(`${strLiterals.noticeBoard}`).push()
      
      if(urgentCB){
        objToBeUploaded[strLiterals.urgent] = true
      }
      
      for(var k in targetGroups){
        objToBeUploaded[k] = targetGroups[k].toString()
      }
      
    }

    objToBeUploaded[strLiterals.noticeId] = newNoticeIdRef.key
    
    console.log(objToBeUploaded)
    
    newNoticeIdRef
    .set(
      objToBeUploaded,
      (error) => {
        if(error){
            console.log(error)
          }else{
            //Data saved successfully
            
            console.log('data set without images and files')
            if(images.length === 0 && files.length === 0){
              setNoticeUploading(false)
              showSnackbar("Notice Uploaded Successfully","white", "#3DBE29", true )
            }else{
              uploadImagesToFirebase(newNoticeIdRef)
              //otherFiles upload task is in above function definition
            }
          }
        }
        )
      
        
  }

  const uploadImagesToFirebase = (newNoticeIdRef) => {
        
    if(images.length === 0){
      uploadOtherFilesToFirebase(newNoticeIdRef)
    }else{
      
      let storageDirectory 
      if(isCourseNotice){
        storageDirectory = `${strLiterals.coursesNoticeBoard}/${courseSelected}/${newNoticeIdRef.key}/${strLiterals.Images}`
        //In real world, don't use fileName as reference because fileName can be same for 2 files
      }else{
        storageDirectory = `${strLiterals.noticeBoard}/${newNoticeIdRef.key}/${strLiterals.Images}`
      }
      
      const imagesDownloadURLs = []
      
      images.forEach((item, index) => {
        
        //NOTE- .child() option is not available in react native firebase
        const reference = storage().ref(storageDirectory + '/' + `Image_${index + 1}`)
        const task = reference.putFile(item)  //this item is path of image from mobile
        
        // task.on('state_changed', (taskSnapshot) => {
          //     const percentage = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 1000
    
          //     setUploadStatus(percentage)
          // })
          
          task.then(async () => {
            const url = await reference.getDownloadURL()  
            /// we used await keyword because getDownloadURL() is async func and we can't easily get its return value
            imagesDownloadURLs.push(url)
            
            if(imagesDownloadURLs.length === images.length){
              
              newNoticeIdRef
              .update({
                  imagesDownloadURLs: imagesDownloadURLs
                },
                  (error) => {
                    if(error){
                      console.log(error)
                    }else{
                      //Data saved successfully
          
                      console.log('images download urls set')
                      if(files.length === 0){
                        setNoticeUploading(false)
                        showSnackbar("Notice Uploaded Successfully","white", "#3DBE29", true )
                      }else{
                        uploadOtherFilesToFirebase(newNoticeIdRef)
                      }
                    }
                  }
                )
                
            }
          })
      })
    }  
  }
  
  const uploadOtherFilesToFirebase = (newNoticeIdRef) => {
    let storageDirectory 
    if(isCourseNotice){
      storageDirectory = `${strLiterals.coursesNoticeBoard}/${courseSelected}/${newNoticeIdRef.key}/${strLiterals.OtherFilesStorage}`
      //In real world, don't use fileName as reference because fileName can be same for 2 files
    }else{
      storageDirectory = `${strLiterals.noticeBoard}/${newNoticeIdRef.key}/${strLiterals.OtherFilesStorage}`
    }
    
    const otherFiles = []
    
    files.forEach((item) => {
      const reference = storage().ref(storageDirectory + '/' + item.name)
      const task = reference.putFile(item.uri)
      //this item.uri is path of file from mobile
      
      task.then(async () => {
        const url = await reference.getDownloadURL()  
        /// we used await keyword because getDownloadURL() is async func and we can't easily get its return value
        
        otherFiles.push({
          name: item.name,
          type: item.type,
          downloadURL : url   
        })
        
        if(otherFiles.length === files.length){
          
          newNoticeIdRef
          .update({
            otherFiles: otherFiles
          },
          (error) => {
            if(error){
                console.log(error)
                
              }else{
                //Data saved successfully
                
                setNoticeUploading(false)
                showSnackbar("Notice Uploaded Successfully","white", "#3DBE29", true )
                console.log('files download urls set')
                
              }
            }
            )
            
          }
      })
    })
  }
  
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
            type: res.type,
            uri: res.uri
          })
          console.log(res);
          // res.uri,
          // res.type, // mime type
          // res.name,
          // res.size
        }
        setFiles([...files,...filesAr])
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker, exit any dialogs or menus and move on
        } else {
          throw err;
        }
      }
    }
  
  
    // in openCamera(), you can't take multiple images
  const openCamera = () => {
      ImagePicker.openCamera({
        enableRotationGesture: false,
        freeStyleCropEnabled: true,
        cropping: true,
        compressImageQuality: 0.7
      }).then(image => {
        //console.log(image);
        setImages([...images, image.path])
      }).catch(e => {
        console.log(e)
      });
  }
  
  const openCropper = (imagesArr, croppedAr, currIndex) =>{
  
      if(currIndex === imagesArr.length){
        setImages([...images, ...croppedAr])
        return;
      }
  
      ImagePicker.openCropper({
        path: imagesArr[currIndex].path,
        enableRotationGesture: false,
        freeStyleCropEnabled: true,
      }).then(image => {
        console.log(image)
  
        croppedAr.push(image.path)
  
        openCropper(imagesArr,croppedAr, currIndex + 1)  
      })
      .catch(e => 
        console.log(e)
      )
      
  }
  
  // in multiple:true you can't crop picture
  const chooseImage =() => {
      ImagePicker.openPicker({
        multiple: true,
        compressImageQuality: 0.7
      }).then(imagesAr => {
        // here imagesAr is an array object
        console.log(imagesAr);
        const croppedAr = []
        openCropper(imagesAr,croppedAr, 0)
  
        
      }).catch(e => {
        console.log(e)
      });
  }
  
  useEffect(() => {

    //console.log('mounted')

    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);  //this is also required
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      //console.log('unmounting')

      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidHide = () => {
    setInputFocused(false)
  }
  const _keyboardDidShow = () => {
    setInputFocused(true)
  }

  const switchCheckbox = (i,j) => {
    checkboxes[i][j] = !checkboxes[i][j]
    setCheckboxes([...checkboxes])
  }

  

return(
  <Container style = {{flex: 1}}>

    <Header>
      <Left>
        <Button transparent onPress = {() => {navigation.goBack()}}>
          <Icon name='arrow-back-outline' />
        </Button>
      </Left>
      <Body>
        <Title>Notice Form</Title>
      </Body>
      <Right>
        {noticeUploading ? (
          <Spinner style = {{marginEnd: 5}}/>
        ):(
          <Button transparent
          onPress = {() => {
            if( !noticeUploading){
              setNoticeUploading(true)
              uploadNotice()
            }
          }}
          >
            <Icon type = 'Entypo' name = 'upload' style = {{fontSize: 30}} />
          </Button>
        )}
      </Right>
    </Header>

    <Content>
      
      {(images.length > 0 || files.length > 0) && (
        <View style = {{marginTop: 10, marginHorizontal: 5}}>
          <Row style = {{padding: 10, alignItems: 'center', backgroundColor: "#b7daf8" }}>
            <Text>Attachments</Text>
            <Right>
              <TouchableOpacity onPress = {() => {setListExpanded(!listExpanded)}}>
                {listExpanded ? (
                  <Icon type = 'MaterialCommunityIcons' name = 'arrow-up-drop-circle-outline'/>
                ): (
                  <Icon type = 'MaterialCommunityIcons' name = 'arrow-down-drop-circle-outline'/>
                )}
                
              </TouchableOpacity>
            </Right>
          </Row>

          {listExpanded && (
            <List style = {{backgroundColor: '#ddecf8'}}>

              {images.map((item, index) => {
                
                return(
                <ListItem thumbnail key = {index} >
                  <Left>
                    <TouchableOpacity onPress = {() => {
                      setModalVisible(true)
                      setImageModalVisible(true);
                      setModalImagePath(item)
                    }}>
                      <Thumbnail square source={{uri: item}} />
                    </TouchableOpacity>
                  </Left>
                  <Body><Text>Image_{index + 1}{item.substring(item.lastIndexOf('.'))}</Text></Body>
                  
                  <Right>
                    <TouchableOpacity onPress = {() => setImages([...images.filter(x => x !== item)])}>
                      <Icon 
                      type = 'MaterialCommunityIcons' name = 'delete'
                      style = {{color:'#000', fontSize:28}}
                      />
                    </TouchableOpacity>  
                  </Right>
                </ListItem>
              )})}

              {files.map((item, index) => {
                
                return(
                <ListItem thumbnail key ={index} >
                  
                  {fileTypes_Extensions[item.type] === '.pdf' ? (
                    <Icon type ='FontAwesome5' name ='file-pdf' />
                  ) : (
                    fileTypes_Extensions[item.type] === '.doc' || fileTypes_Extensions[item.type] === '.docx'? (
                      <Icon type ='MaterialCommunityIcons' name ='microsoft-word' />
                    ) : (
                      fileTypes_Extensions[item.type] === '.ppt' || fileTypes_Extensions[item.type] === '.pptx' ? (
                        <Icon type ='MaterialCommunityIcons' name ='microsoft-powerpoint' />
                      ) : (
                        fileTypes_Extensions[item.type] === '.xls' || fileTypes_Extensions[item.type] === '.xlsx' ? (
                          <Icon type ='MaterialCommunityIcons' name ='microsoft-excel' />
                        ) : (
                          <Icon type ='MaterialCommunityIcons' name ='file' />
                        )
                      )
                    )
                  )}
                  
                  
                  
                  <Body>
                    <TouchableOpacity onPress = {async() => {
                      await FileViewer.open(item.uri)
                        .catch(error => console.log(error));
                        // TODO make a toast here and show the error
                    }}>
                    
                      <Text>{item.name}</Text>
                    
                    </TouchableOpacity>
                  </Body>

                  <Right>
                    <TouchableOpacity onPress = {() => setFiles([...files.filter(x => x !== item)])}>
                      <Icon 
                      type = 'MaterialCommunityIcons' name = 'delete'
                      style = {{color:'#000', fontSize:28}}
                      />
                    </TouchableOpacity>
                  </Right>
                  
                </ListItem>
              )})}
              
              

            </List>
          )}
        
        </View>
      )}  

      {isCourseNotice ? (
        courseSelected ? (
          <List>
            <View style = {{
              padding: 15,
              flexDirection: 'row-reverse',
              justifyContent: 'space-between',
            }}>

              <Button bordered 
              onPress = {() => setCourseSelected(null)}
              background = {TouchableNativeFeedback.Ripple('#5737D6')}
              >
                <Text style = {{textTransform: 'capitalize'}}>Change</Text>
              </Button>

              <View style = {{flex: 1, justifyContent:'center'}}>
                <Text >{courseSelected}</Text>
              </View>
            </View>

            <HorizontalLine />

            <View style = {{height: 10}}/>
            
            <View 
            style = {{paddingStart: 15}}
            >
              <Row style = {{alignItems: 'center'}}>
                <TouchableOpacity
                onPress = {() => {
                  switchCheckbox(0,0)
                  
                }}>
                  <View 
                  //this view is just to increasing the touching area of checkbox
                  style = {{
                    paddingEnd: 20,
                    paddingVertical: 12,
                  }}>
                    <CheckBox 
                    style = {styles.checkboxStyle}
                    checked = {checkboxes[0][0]}
                    onPress = {() => {
                      switchCheckbox(0,0)
                    }}
                    
                    />
                  </View>
                </TouchableOpacity>
                <Text
                style = {{fontSize: 19}}
                >All</Text>
              </Row>
              
              
            </View>
            <HorizontalLine />

            {Object.keys(courses[courseSelected]).map((item, index) => {
              
              return(
                <View key = {index}>
                  <View 
                  style = {{
                    paddingStart: 15, 
                    
                  }}
                  //by default alignItems = 'stretch' by making it not stretch we make items length as same as their content length
                  >
                    <Row style = {{alignItems: 'center'}}>
                      <TouchableOpacity
                      disabled = {checkboxes[0][0]}
                      onPress = {() => {
                        switchCheckbox(index + 1, 0)
                      }}>
                        <View 
                        //this view is just to increasing the touching area of checkbox
                        style = {{
                          paddingEnd: 20,
                          paddingVertical: 12,
                        }}>
                          <CheckBox 
                          style = {styles.checkboxStyle}
                          disabled = {checkboxes[0][0]}
                          color = {checkboxes[0][0] ? '#CAD5E2': null}
                          checked = {checkboxes[index + 1][0]}
                          onPress = {() => {
                            switchCheckbox(index + 1, 0)
                          }}
                          />
                        </View>
                      </TouchableOpacity>
                      
                      <Text style = {{fontSize: 19}}>
                      {item}</Text>
                      
                    </Row>
                    
                    {checkboxes[index + 1][0] && !checkboxes[0][0] ? (

                      <Row style = {{alignItems: 'center', marginStart: 35, marginBottom: 12}}>
                          
                        <Pressable 
                        onPress = {() => {
                          switchCheckbox(index + 1, 1)
                        }}>
                          <View
                          style = {{
                            backgroundColor: (checkboxes[index + 1][1] ? '#3F51B5': 'white'),
                            borderRadius: 1000,
                            padding: 3,
                            paddingHorizontal: 7
                          }}
                          >
                            <Text 
                            style = {{color: (checkboxes[index + 1][1] ? 'white': '#3F51B5') }}>
                            All</Text>
                          </View>
                        </Pressable>
                        
                        {courses[courseSelected][item].map((itemSec, indexSec) => {
                          return(
                            <View 
                            key = {indexSec}
                            style = {{marginStart: 20, alignItems:'center', flexDirection:'row'}} 
                            >
                              <Pressable
                              disabled = {checkboxes[index + 1][1]}
                              onPress = {() => {
                                switchCheckbox(index + 1, indexSec + 2)
                              }}>
                                <View
                                style = {{
                                  backgroundColor : (checkboxes[index + 1][indexSec + 2] || checkboxes[index + 1][1] ? '#62B1F6': 'white'),
                                  borderRadius: 1000,
                                  padding: 3,
                                  paddingHorizontal: 9
                                }}
                                >
                                  <Text
                                  style = {{color: (checkboxes[index + 1][indexSec + 2] || checkboxes[index + 1][1] ? 'white': '#3F51B5')}}
                                  >{itemSec}</Text>
                                </View>
                              </Pressable>
                            </View>
                          )
                        })}

                      </Row>
                    ):null}
                    
                  </View>
                  
                  <HorizontalLine />
                </View>
              )
            })}
            
            
          </List>
          
        ) : (
          Object.keys(courses).map((item, index) => {
            return(
              
                <ListItem //list item is extension of touchableNativefeedBack in android
                key = {index} 
                onPress = {() => {
                  setCourseSelected(item)
                  
                  const arr = [[false]]  //for first All option
                  for(var k in courses[item]){
                    arr.push(new Array(courses[item][k].length + 2).fill(false))
                  }
                  console.log(arr)
                  setCheckboxes([...arr])
                }}
                background = {TouchableNativeFeedback.Ripple('#5737D6')}
                >
                  <Text style = {{fontSize: 19}}>{item}</Text>
                </ListItem>
              
            )
          })
        )
      ):(
        checkboxes.length !== 0 &&
        <View>
        <Row style = {{alignItems:'baseline', padding: 10}} >
          <Text style = {styles.checkboxListHeading}>Target{'\n'}Department</Text>
          <Text style = {styles.checkboxListHeading}>Target{'\n'}Year</Text>
          <View style = {{flex: 1}}>
          {isOnlyOneDeptChecked()[0] && isOnlyOneYearChecked()[0] && 
            <Text style = {styles.checkboxListHeading}>Target{'\n'}Section</Text>
          }
          </View>
          
        </Row>

        <Row style = {{maxHeight: window.height/3.5, paddingHorizontal: 10}}>
          <Col size = {1}>
            <ScrollView
            nestedScrollEnabled = {true}
            >
              <Row style = {{alignItems: 'center'}}>
                <TouchableOpacity
                onPress = {() => {
                  checkboxes[0][0] = !checkboxes[0][0]
                  setCheckboxes([...checkboxes])
                }}>
                  <View 
                  //this view is just to increasing the touching area of checkbox
                  style = {{
                    paddingEnd: 20,
                    paddingVertical: 12,
                  }}>
                    <CheckBox 
                    checked={checkboxes[0][0]} 
                    onPress = {() => {
                      checkboxes[0][0] = !checkboxes[0][0]
                      setCheckboxes([...checkboxes])
                    }} />
                  </View>
                </TouchableOpacity>
                
                <Text>All</Text>
                
              </Row>

              {noticeBoardPermissions[strLiterals.dept].map((item,index) =>(
                <Row 
                key = {index}
                style = {{alignItems: 'center'}}>
                  <TouchableOpacity
                  disabled = {checkboxes[0][0]}
                  onPress = {() => {
                    checkboxes[0][index + 1] = !checkboxes[0][index + 1]
                    setCheckboxes([...checkboxes])
                  }}>
                    <View 
                    //this view is just to increasing the touching area of checkbox
                    style = {{
                      paddingEnd: 20,
                      paddingVertical: 12,
                    }}>
                      <CheckBox
                      disabled = {checkboxes[0][0]} 
                      checked={checkboxes[0][index + 1]} 
                      color = {checkboxes[0][0] ? '#CAD5E2': null}
                      onPress = {() => {
                        checkboxes[0][index + 1] = !checkboxes[0][index + 1]
                        setCheckboxes([...checkboxes])
                      }} />
                    </View>
                  </TouchableOpacity>
                  
                  <Text>{item}</Text>
                  
                </Row>
              ))}
            </ScrollView>  
              
          </Col>
          <Col size = {1}>
            <ScrollView nestedScrollEnabled = {true}>
              <Row style = {{alignItems: 'center'}}>
                <TouchableOpacity
                onPress = {() => {
                  checkboxes[1][0] = !checkboxes[1][0]
                  setCheckboxes([...checkboxes])
                }}>
                  <View 
                  //this view is just to increasing the touching area of checkbox
                  style = {{
                    paddingEnd: 25,
                    paddingVertical: 12,
                  }}>
                    <CheckBox 
                    checked={checkboxes[1][0]} 
                    onPress = {() => {
                      checkboxes[1][0] = !checkboxes[1][0]
                      setCheckboxes([...checkboxes])
                    }} />
                  </View>
                </TouchableOpacity>
                
                <Text>All</Text>
                
              </Row>

              {noticeBoardPermissions[strLiterals.year].map((item,index) =>(
                <Row 
                key = {index}
                style = {{alignItems: 'center'}}>
                  <TouchableOpacity
                  disabled = {checkboxes[1][0]}
                  onPress = {() => {
                    checkboxes[1][index + 1] = !checkboxes[1][index + 1]
                    setCheckboxes([...checkboxes])
                  }}>
                    <View 
                    //this view is just to increasing the touching area of checkbox
                    style = {{
                      paddingEnd: 25,
                      paddingVertical: 12,
                    }}>
                      <CheckBox 
                      disabled = {checkboxes[1][0]}
                      checked={checkboxes[1][index + 1]} 
                      color = {checkboxes[1][0] ? '#CAD5E2': null}
                      onPress = {() => {
                        checkboxes[1][index + 1] = !checkboxes[1][index + 1]
                        setCheckboxes([...checkboxes])
                      }} />
                    </View>
                  </TouchableOpacity>
                 
                    <Text>{item}</Text>
                  
                </Row>
              ))}
              
            </ScrollView>
          </Col>

          <Col size = {1}>
            {isOnlyOneDeptChecked()[0] && isOnlyOneYearChecked()[0] &&
            <ScrollView nestedScrollEnabled = {true}>
              <Row style = {{alignItems: 'center'}}>
                <TouchableOpacity
                onPress = {() => {
                  checkboxes[2][0] = !checkboxes[2][0]
                  setCheckboxes([...checkboxes])
                }}>
                  <View 
                  //this view is just to increasing the touching area of checkbox
                  style = {{
                    paddingEnd:25,
                    paddingVertical: 12,
                  }}>
                    <CheckBox 
                    checked={checkboxes[2][0]} 
                    onPress = {() => {
                      checkboxes[2][0] = !checkboxes[2][0]
                      setCheckboxes([...checkboxes])
                    }} />
                  </View>
                </TouchableOpacity>
                
                <Text>All</Text>
                
              </Row>

              {noticeBoardPermissions[strLiterals.section].map((item,index) =>(
                <Row 
                key = {index}
                style = {{alignItems: 'center'}}>
                  <TouchableOpacity
                  disabled = {checkboxes[2][0]}
                  onPress = {() => {
                    checkboxes[2][index + 1] = !checkboxes[2][index + 1]
                    setCheckboxes([...checkboxes])
                  }}>
                    <View 
                    //this view is just to increasing the touching area of checkbox
                    style = {{
                      paddingEnd:25,
                      paddingVertical: 12,
                    }}>
                      <CheckBox 
                      disabled = {checkboxes[2][0]}
                      checked={checkboxes[2][index + 1]} 
                      color = {checkboxes[2][0] ? '#CAD5E2': null}
                      onPress = {() => {
                        checkboxes[2][index + 1] = !checkboxes[2][index + 1]
                        setCheckboxes([...checkboxes])
                      }} />
                    </View>
                  </TouchableOpacity>
                  
                  <Text>{item}</Text>
                  
                </Row>
              ))}
              
            </ScrollView>
            }
          </Col>
          
        </Row>
        
        
        <ListItem noBorder>
          <Text style = {{fontWeight:'bold', marginEnd: 10}}>Urgent</Text>
          <CheckBox checked = {urgentCB} color = 'red' onPress = {() => setUrgentCB(!urgentCB)}/>
        </ListItem>
        </View>
      )}


      {((isCourseNotice && courseSelected) || !isCourseNotice) && (
        <View>
        <View style = {{
          margin:12, marginTop:15,
          padding: 5,
          backgroundColor:'#6A1B4D'    //#03203C
        }}>
          <Text style = {styles.targetGroupsTxtHeading}>Target Groups:</Text>
          
          <View style = {{paddingHorizontal:10, marginTop: 3}}>
            
            {Object.keys(targetGroups).length !== 0 &&
              (
                isCourseNotice ? (
                  Object.keys(targetGroups).map((item, index) => {
                    if(targetGroups[item].length !== 0){
                      return(

                        <Text
                        key = {index}
                        style = {styles.targetGroupsTxt}>
                        {item}  {targetGroups[item].toString()}</Text>
                      )
                    }
                  })
                ) : (
                  targetGroups[strLiterals.dept].length !== 0 && 
                  targetGroups[strLiterals.year].length !== 0 &&
                  
                  (
                    targetGroups[strLiterals.section] ? (
                      targetGroups[strLiterals.section].length !== 0 &&
                      <Text
                      style = {styles.targetGroupsTxt}
                      >
                      {targetGroups[strLiterals.dept].toString()} {targetGroups[strLiterals.year].toString()}  {targetGroups[strLiterals.section].toString()}
                      </Text>
                    ) : (

                      targetGroups[strLiterals.dept].map((dept, deptIndex) => {
                        
                        let txt = dept + ' '
    
                        targetGroups[strLiterals.year].forEach((year, yearIndex)=> {
                          txt += year + ','
                        })
    
                        return(
  
                          <Text
                          key = {deptIndex}
                          style = {styles.targetGroupsTxt}>
                          {txt.slice(0, -1)}</Text>
                        )
                        
                      })
                    )
                  )

                )
              )

            }

            
          </View>
        </View>

        <Form style = {{marginTop: 10}}>
  
          <Item  stackedLabel>
            <Label >Subject:</Label>
            <Input
            multiline = {true}
            value = {subject}
            onChangeText={(text) => setSubject(text)}
            onFocus = {()=> setInputFocused(true)}
            // onBlur = {() => setInputFocused(false)}   No need as we have added keyboard listener
            spellCheck={false}
            autoCorrect = {false}
            />
          </Item>
          <Item stackedLabel style = {{marginTop: 15, marginBottom: 100}}>
            <Label>Notice Text:</Label>
            <Input
            multiline = {true}
            value = {noticeTxt}
            onChangeText={(text) => setNoticeTxt(text)}
            onFocus = {()=> setInputFocused(true)}
            // onBlur = {() => setInputFocused(false)}
            spellCheck={false}
            autoCorrect = {false}
            />
          </Item>
        </Form>
        </View>
      )}
    </Content>
    
    <Fab
    // #5067FF
    // #1C8D73
    direction="up"
    active = {fabActive}
    style = {{ backgroundColor: '#E21717', opacity: inputFocused ? 0: 100}}
    position = 'bottomRight'
    onPress = {() => {setFabActive(!fabActive)}}
    >
      <Icon type = 'Entypo' name = 'attachment' style = {{fontSize: 30}} />

      
      <Button 
      style = {{backgroundColor: '#12B0E8'}}
      onPress = {()=> {
        setFabActive(false)
        setModalVisible(true)
      }}
      >
        <Icon type = 'MaterialIcons' name="add-a-photo" />
      </Button>
     
      <Button 
      style={{ backgroundColor: '#3DBE29' }}
      onPress = {() => {
        setFabActive(false)
        chooseDocument()
      } }
        
      >
        <Icon type = 'Ionicons' name="document"/>
      </Button>
    </Fab>
    
  
    <Modal 
    isVisible={isModalVisible}
    onBackButtonPress = {() => {setModalVisible(false); setImageModalVisible(false)}}
    onBackdropPress = {()=> {setModalVisible(false); setImageModalVisible(false)}}
    >
      {isImageModalVisible ? (
        <View style = {{flex: 1,alignItems: 'center', justifyContent:'center'}}> 

          <View style={{padding:20}}>
            <View style = {{flexDirection: 'row-reverse', marginStart: 10, marginBottom: 10}}>
              <TouchableOpacity onPress = {() => {
                setModalVisible(false)
                setImageModalVisible(false)
              }}>
                <Icon type = 'AntDesign' name = 'closecircle' 
                style = {{color: 'white', fontSize: 30}} />
              </TouchableOpacity>
            </View>
            
            <Image style={{width: window.width, flex: 1, resizeMode: 'contain'}} 
            source={{uri: modalImagePath}} 
            />
          </View>
        
      </View>
      ): (
        <View style={{flex: 1, alignItems: 'center', justifyContent:'center'}}>
        <View style = {styles.modalView}>
          <Text style = {{fontSize: 20}}>Select an option:</Text>
        
          <TouchableOpacity style = {{marginTop: 20}}
          onPress = {openCamera}
          >
            <H3>1. Open Camera</H3>
          </TouchableOpacity>
        
          <TouchableOpacity style = {{marginTop: 20}}
          onPress = {() => {
            setModalVisible(false)
            chooseImage()
          }}
          >
            <H3>2. Choose from Library</H3>
          </TouchableOpacity>
 
        </View>
        
      </View>

      )}
    </Modal>
    
  </Container>
)
}

const styles = StyleSheet.create({
  deptTextStyle : {
    fontSize: 19
  },
  yearTextStyle : {
    fontSize: 17
  },
  sectionTextStyle : {
    fontSize: 15
  },
  checkboxStyle: {
    borderRadius: 0
  },
  targetGroupsTxt:{
    fontSize: 15,
    color: "#fff"
  },
  targetGroupsTxtHeading:{
    fontSize: 14,
    color: "#E5D68A",   //#12B0E8
  },
  checkboxListItem: {
    paddingVertical: 10,
    paddingHorizontal: 5
  },
  checkboxListHeading: {
    flex: 1,
    textAlign: 'center', 
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
})

AddNoticeForm.propTypes = {
  userDetails: propTypes.object.isRequired    
}// isRequired makes sure that prop passed to Home must not be NULL

//....redux config....
const mapStateToProps = (state) => ({
    userDetails: state.auth.user,
})

export default connect(mapStateToProps)(AddNoticeForm)