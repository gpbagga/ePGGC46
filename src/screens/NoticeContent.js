import React, {useRef,useState, useEffect}  from 'react'
import {FlatList, useWindowDimensions,View, Image, SafeAreaView, TouchableOpacity, Platform} from 'react-native'
import Color from 'color'
import FileViewer from 'react-native-file-viewer';

import RNFS from 'react-native-fs';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
  
import {
  PanGestureHandler, PinchGestureHandler,
} from 'react-native-gesture-handler'

import {
  Card,
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
 

// PanResponder is implemented in javascript so we can't use it for animation which 
// directly runs on native thread which is in the case of react native reanimated API

//NOTE:- If non-state variables are initialized in functional components and changed 
//inside a component's event prop then that change will not be reflected in other 
//prop or other components(also applicable to arrays)
// So inside functional components,  declare either constants or state variables  


const NoticeContent = ({navigation,userDetails, route}) =>{

  const { notice, timeAgoStr } = route.params

  let noticeImages, noticeFiles
  if(notice[strLiterals.imagesDownloadURLs]){
    noticeImages = [...notice[strLiterals.imagesDownloadURLs]]
  }
  if(notice[strLiterals.otherFiles]){
    noticeFiles = [...notice[strLiterals.otherFiles]]
  }

  const [fileOpeningSpinner, setFileOpeningSpinner] = useState(false)

  const window = useWindowDimensions()
  
  const [HEIGHT_IMG] = useState(window.height/(1.75))

  const panGestureRef = useRef()
  const pinchGestureRef = useRef()

  // consider adjustedFocal is a vector from center of image to focal point of touches
  const adjustedFocalX = useSharedValue(0)
  const adjustedFocalY = useSharedValue(0)
  
  const pinchScale = useSharedValue(1)
  
  const [zIndexFlatList, set_zIndexFlatlist] = useState(1)

  const [currImgIndexOnScreen, setCurrImgIndexOnScreen] = useState(0)

  //const flatListOffset = {original: 0, current: 0}
  const [flatListOffset, setFlatListOffset] = useState({original: 0, current: 0})

  const [panFlag, setPanFlag] = useState(false)

  const offsetScale = useSharedValue(1)

  const afterPinchTransX = useSharedValue(0)
  const afterPinchTransY = useSharedValue(0)

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const onPanGestureEvent = useAnimatedGestureHandler({
    onStart: () => {
    },
    onActive:(event, ctx) => {
      if(panFlag){
        translateX.value = event.translationX
        translateY.value = event.translationY
      }
    },
    onEnd: (_) => {
      afterPinchTransX.value = afterPinchTransX.value + translateX.value/offsetScale.value
      afterPinchTransY.value = afterPinchTransY.value + translateY.value/offsetScale.value
      translateX.value = 0
      translateY.value = 0
    }
  })

  // const onPanGestureEvent = event([
  //   {
  //     nativeEvent: ({
  //       translationX: trans_x,
  //       translationY: trans_y,
  //       oldState,
  //       state }) =>
  //     block([
  //       // below condition is important because sometimes panGesture is not enabled but still this gestureEvent gets triggered(i dont know why)
  //       cond(eq(panFlagAnimated, 1),[
  //         cond(eq(state, State.ACTIVE),[
  //           set(translateX, trans_x),
  //           set(translateY, trans_y),
  //         ]),
  //         cond(eq(oldState, State.ACTIVE),[
  //           set(afterPinchTransX, add(afterPinchTransX, divide(translateX, offsetScale))),
  //           set(afterPinchTransY, add(afterPinchTransY, divide(translateY, offsetScale))),
  //           set(translateX, 0),
  //           set(translateY, 0),
            
  //         ])
  //       ])
  //     ]),
      
  //   }
  // ])

  const onPinchGestureEvent = useAnimatedGestureHandler({
    
    //Handler has started receiving touch stream but hasn't yet received enough data to either fail or activate. 
    onStart: () => {
      runOnJS(set_zIndexFlatlist)(10)
    },
    onFinish:()=> {
      if(offsetScale.value <= 1){
        runOnJS(set_zIndexFlatlist)(1)
      }
    },
    // ctx is a plain JS object that can be used to keep a state on the UI thread 
    // in between events and handlers
    onActive: (event, ctx) => {
      // if(!ctx.zIndex || ctx.zIndex < 10){
      //   runOnJS(set_zIndexFlatlist)(10)    //here it is causing causing a little disruption in UI
      //   ctx.zIndex = 10  
      // }
      if(!panFlag){
        if(!ctx.initialFocalX){
          ctx.initialFocalX = event.focalX
          ctx.initialFocalY = event.focalY
          adjustedFocalX.value = event.focalX - window.width/2
          adjustedFocalY.value = event.focalY - HEIGHT_IMG/2
        }
        
        translateX.value = event.focalX - ctx.initialFocalX
        translateY.value = event.focalY - ctx.initialFocalY
      }else{
        adjustedFocalX.value = (event.focalX - (window.width/2 + translateX.value + afterPinchTransX.value * offsetScale.value))/offsetScale.value  
        adjustedFocalY.value = (event.focalY - (flatListOffset.current + HEIGHT_IMG/2 + translateY.value + afterPinchTransY.value * offsetScale.value))/offsetScale.value  
      }      
      
      pinchScale.value = event.scale

    },
    onEnd: (_, ctx) => {
      //console.log('onEnd')
      ctx.initialFocalX = 0
      ctx.initialFocalY = 0

      offsetScale.value = offsetScale.value * pinchScale.value

      if(offsetScale.value <= 1){
        runOnJS(setPanFlag)(false)
        //runOnJS(set_zIndexFlatlist)(1)  //given in onFinish()
        
        translateX.value = 0
        translateY.value = 0
        afterPinchTransX.value = 0
        afterPinchTransY.value = 0
        pinchScale.value = 1
        offsetScale.value = 1
      }else{
        runOnJS(setPanFlag)(true)
        afterPinchTransX.value = afterPinchTransX.value/pinchScale.value - (adjustedFocalX.value - adjustedFocalX.value/pinchScale.value)
        afterPinchTransY.value = afterPinchTransY.value/pinchScale.value - (adjustedFocalY.value - adjustedFocalY.value/pinchScale.value)
        pinchScale.value = 1
      }
    }, 
  }, [panFlag, flatListOffset])

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: 
        [
          {translateX : translateX.value},
          {translateY: translateY.value},
          
          {scale: offsetScale.value},
          
          {translateX: afterPinchTransX.value},
          {translateY: afterPinchTransY.value},
          
          {translateX: adjustedFocalX.value },
          {translateY: adjustedFocalY.value },
          
          {scale: pinchScale.value},
          
          {translateX: -1 * adjustedFocalX.value},
          {translateY: -1 * adjustedFocalY.value},
        ]
    }
  })

  // const onPinchGestureEvent = event([
  //   { 
  //     nativeEvent: ({ 
  //       scale: scale,
  //       focalX: focalX,
  //       focalY: focalY,
  //       state,
  //       oldState
  //       }) => 
  //       block([
  //         cond(eq(state, State.ACTIVE),[
            
  //           cond(eq(s, 0),[
  //             cond(eq(panFlagAnimated, 0), [
  //               //here handler attached to individual image of flatlist is handling
  //               //so offsetScale is 1, afterPinchTrans is 0
                
  //               set(adjustedFocalX, sub(focalX, window.width/2)),
  //               set(adjustedFocalY, sub(focalY, HEIGHT_IMG/2)),

  //               // to translate using focal difference
  //               set(initialFocalX, focalX),
  //               set(initialFocalY, focalY),

  //             ],[
  //               set(adjustedFocalX, divide(sub(focalX, add(window.width/2, translateX, multiply(afterPinchTransX, offsetScale) ) ), offsetScale )),
  //               set(adjustedFocalY, divide(sub(focalY, add(fListOffsetAnim,HEIGHT_IMG/2, translateY, multiply(afterPinchTransY, offsetScale) ) ), offsetScale )),
  //               // height of image = HEIGHT_IMG so center point = flatlist + HEIGHT_IMG/2
  //               //flatListOffset was coming equal to 0 so we used its animated node
  //             ]),
              
  //             set(s, scale),
              
  //           ],[
              
  //             cond(eq(panFlagAnimated, 0), [
  //               set(translateX, sub(focalX, initialFocalX)),
  //               set(translateY, sub(focalY, initialFocalY)),
  //             ]),

  //             set(pinchScale, divide(scale, s)),

  //           ])
  //       ]),
        
  //       cond(eq(oldState, State.ACTIVE),[
          
  //         set(offsetScale, multiply(offsetScale, pinchScale)),
          
  //         cond(lessOrEq(offsetScale,1),[
  //           set(panFlagAnimated, 0),

  //           set(translateX, 0),
  //           set(translateY, 0),
  //           set(afterPinchTransX, 0),
  //           set(afterPinchTransY, 0),
            
  //           set(pinchScale, 1),
  //           set(offsetScale, 1),
  //         ],[
  //           set(panFlagAnimated, 1),

  //           set(afterPinchTransX, sub(divide(afterPinchTransX, pinchScale), sub(
  //             adjustedFocalX,
  //             divide(adjustedFocalX, pinchScale)
  //           ) ) ),
            
  //           set(afterPinchTransY, sub(divide(afterPinchTransY, pinchScale), sub(
  //             adjustedFocalY,
  //             divide(adjustedFocalY, pinchScale)
  //           ) ) ),

  //           set(pinchScale, 1),
  //         ]),

  //         set(s, 0),

  //       ])
  //     ])
  //     }]
  //   );

  // useCode(() => {
  //   return call([panFlagAnimated, s], ([panFlagAnimated, s]) => {
  //     if(panFlagAnimated === 0){
  //       setPanFlag(false)
  //       //console.log("pan flag is set to false")

  //       if(s !== 0){
  //         //it will be true when user starts pinching image from original position of image
  //         set_zIndexFlatlist(10)
  //       }else{
  //         //it will be true when image returns to its original position after being zoomed and translated
  //         set_zIndexFlatlist(1)
  //       }

  //     }
  //     else{
  //       setPanFlag(true)
  //       //console.log("pan flag is set to true")
  //     }
  //   })
  // }, [panFlagAnimated, s])


//NOTE - <Content> is KeyboardAwareScrollView
/**NOTE - 
 * TouchableOpacity imported from 'react-native' library doesn't work in 
      absolute postioned views but touchables and buttons imported from 
      'react-native-gesture-handler' works fine in absolute postioned views 
*/

///////////IMPORTANT//////////////
  //NOTE:- here 2nd pinchGestureHandler (without ref) is applied to the animated view 
  //component not on animated.view component which is being transformed because:
  //nested animated.view is being transformed so every time handler gives focal point
  //according to new state of that view that is why we attached the handler to 
  // animated view component which is not being transformed so that handler gives 
  //focalpoint according to initial state of nested animated.view.

  return(
    
    <PanGestureHandler
    avgTouches
    ref = {panGestureRef}
    enabled = {panFlag}
    simultaneousHandlers = {pinchGestureRef}
    onGestureEvent = {onPanGestureEvent}
    
    >
    <Animated.View style = {{flex: 1}}>
    <PinchGestureHandler
    ref = {pinchGestureRef}
    enabled = {panFlag}
    simultaneousHandlers = {panGestureRef}
    onGestureEvent = {onPinchGestureEvent}
    
    >
    <Animated.View style = {{flex: 1}}>
    <Container>
      
      <Content
      scrollEnabled = {!panFlag}
      contentContainerStyle = {{flexGrow: 1}}
      onMomentumScrollEnd = {(event) => {
        const _y_ = flatListOffset.original - event.nativeEvent.contentOffset.y
        flatListOffset.current = _y_
        setFlatListOffset({...flatListOffset})
        //fListOffsetAnim.setValue(flatListOffset.current)
          
      }}
      stickyHeaderIndices = {[0]}
      >

        <View style = {{
          height: toolbarProps.toolbarHeight, 
          backgroundColor: Color(toolbarProps.toolbarDefaultBg).darken(0.2).hex(),
        }}>
          <Row style = {{alignItems:'center'}}>
          
            <Button transparent style = {{alignSelf:'center'}} 
            onPress = {() => navigation.goBack()}
            >
              <Icon name='arrow-back-outline' style ={{color: toolbarProps.toolbarBtnColor}} />
            </Button>
          
            <Text style = {{
              fontSize: toolbarProps.titleFontSize,
              color: toolbarProps.titleFontColor,
              fontFamily: toolbarProps.titleFontfamily
            }}>Notice</Text>
          
          
          </Row>
        </View>
        

        <View style = {{padding : 7 }}>
          <Row style = {{alignItems:'center'}}>
            <Text note>By: </Text>
            <Text>{notice[strLiterals.by]}</Text>
          </Row>

          {notice[strLiterals.subject] &&
          
            <View style ={{marginTop: 5, flexDirection:'row', flexWrap:'wrap', alignItems:'center'}}>  
              <Text note>Subject: </Text>
              <Text style = {{fontSize: 18, fontWeight:'bold'}}>{notice[strLiterals.subject]}</Text>
            </View>
          }
          
        </View>
        
        {noticeImages &&
          <Badge style = {{backgroundColor:'#e0e0e0', alignSelf:'center', marginTop:5}}>
            <Text style = {{color: "#4a4a4a", fontSize: 13.5}}>
            {currImgIndexOnScreen + 1}/{noticeImages.length}
            </Text>
          </Badge>
        }
          
        {noticeImages && 
          
          <PinchGestureHandler
          enabled = {!panFlag}
          onGestureEvent = {onPinchGestureEvent}
          
          >
          <Animated.View 
          style = {{
            marginTop: 5,
            zIndex: zIndexFlatList
          }}
          onLayout = {(event) => {
            
            const _y = event.nativeEvent.layout.y
             
            flatListOffset.original = _y 
            flatListOffset.current = _y

            setFlatListOffset({...flatListOffset}) // to send new value of flatListOffset to reanimated worklet

            //fListOffsetAnim.setValue(_y)
            //console.log('onLayout-',event.nativeEvent.layout.y)
          }}
          >
          <Animated.View style = {[{width: window.width, height: HEIGHT_IMG,},
            animatedStyles]}
             
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
          data = {noticeImages}
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
        
        {noticeFiles &&
          <View style = {{marginTop:7}}>
            <FlatList
            horizontal = {true}
            showsHorizontalScrollIndicator = {false}
            decelerationRate = {'fast'}
            snapToInterval = {window.width}
            snapToAlignment = {'center'}
            disableIntervalMomentum = {true}
            keyExtractor = {(item, index) => index}
            data = {noticeFiles}
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
                      {index + 1}/{noticeFiles.length}
                      </Text>                  
                      
                      {fileTypes_Extensions[item.type] === '.pdf' ? (
                        <Icon type ='FontAwesome' name ='file-pdf-o' />
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
        
        {notice[strLiterals.noticetxt] &&
          <Text style = {{padding:7,paddingTop: 5}}>
          {notice[strLiterals.noticetxt]}
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

export default NoticeContent