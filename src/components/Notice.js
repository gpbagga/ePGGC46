//THis one is to be integrated in ePGGC46 app
import React, {useRef,useState, useEffect}  from 'react'
import {FlatList, useWindowDimensions,View, Image, SafeAreaView, Platform} from 'react-native'
import color from 'color';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs'

import image3 from './src/assets/img_1.jpg'
import image2 from './src/assets/img_2.jpg'

import image1 from './src/assets/undraw_welcome_cats_thqn.png'

import DocumentPicker from "react-native-document-picker";
//import pdfFile from './src/assets/FrontPage.pdf'  //relative path
//import pdfFile from 'socialApp/src/assets/FrontPage.pdf'

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
  PanGestureHandler, PinchGestureHandler, TouchableOpacity,State, BaseButton, RectButton
} from 'react-native-gesture-handler'

import {
    Card,
    DeckSwiper,
    Content,
    CardItem,
    Thumbnail,
    Text,
    Button,
    Icon,
    Left,
    Header,
    Title,
    Body,
    Right,
    Row,
    Container,
    H3, Badge
  } from 'native-base';

const images = [image1, image2, image3]
const files = ['file_1.pdf'
  , 'file22.pdf'
  ,'file_sdasdf.pdf'
  ]

// PanResponder is implemented in javascript so we can't use it for animation which 
// directly runs on native thread which is in the case of react native reanimated API

//NOTE:- If non-state variables are initialized in functional components and changed 
//inside a component's event prop then that change will not be reflected in other 
//prop or other components(also applicable to arrays)
// So inside functional components,  declare either constants or state variables  


const Notice = () =>{

  const window = useWindowDimensions()
  
  const HEIGHT_IMG = window.height/(1.75)

  const panGestureRef = useRef()
  const pinchGestureRef = useRef()

  // consider adjustedFocal is a vector from center of image to focal point of touches
  const adjustedFocalX = useValue(0) //it is animated.Value node initialized with 0
  const adjustedFocalY = useValue(0)
  
  const pinchScale = useValue(1)
  
  
  const [btnOpacity, setBtnOpacity] = useState(100)

  const [orgFlatListOffset, setOrgFlatListOffset]  = useState(0)
  
  const [currImgIndexOnScreen, setCurrImgIndexOnScreen] = useState(0)

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
                // height of image = HEIGHT/2 so center point = flatlist + HEIGHT/4
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
          set(s, 0),
          
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

        ])
      ])
      }]
    );

    useCode(() => {
      return call([panFlagAnimated], (panFlagAnimated) => {
        if(panFlagAnimated == 0){
          setPanFlag(false)
          //console.log("pan flag is set to false")
        }else{
          setPanFlag(true)
          //console.log("pan flag is set to true")
        }
      })
    }, [panFlagAnimated])


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
      <SafeAreaView style = {{flex: 1}}>

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
      <Container
      style = {{flex: 1}}>
        
        <Content
        
        onMomentumScrollEnd = {(event) => {
          //console.log('contentOffset: ', event.nativeEvent.contentOffset.y)
          //console.log('flatListOffset: ', orgFlatListOffset)
          const _y_ = orgFlatListOffset - event.nativeEvent.contentOffset.y
          fListOffsetAnim.setValue(_y_)
        }}

        stickyHeaderIndices = {[0]}
        >
          <View style = {{height: toolbarHeight, backgroundColor: color(toolbarDefaultBg).darken(0.2).hex()}}>
            <Row style = {{alignItems:'center'}}>
            
              <Button transparent style = {{alignSelf:'center'}} >
                <Icon name='arrow-back-outline' style ={{color: toolbarBtnColor}} />
              </Button>
            
            
              <Text style = {{
                fontSize: titleFontSize,
                color: titleFontColor,
                fontFamily: titleFontfamily
              }}>Notice</Text>
            
            
            </Row>
          </View> 
        
          <View style = {{padding : 7 }}>
          <Row>
            <Text style = {{fontWeight:'bold'}}>By: </Text>
            <Text>Gaurav Pathak</Text>
          </Row>
          <Row>
            <Text style = {{fontWeight:'bold'}}>Sub: </Text>
            <Text>BA BCOM students to meet librarian</Text>
          </Row>
          <Text note style = {{fontSize:13}}>45 minutes ago</Text>
          </View>
          
          <Badge style = {{backgroundColor:'#e0e0e0', alignSelf:'center', marginTop:5}}>
            <Text style = {{color: "#4a4a4a", fontSize: 13.5}}>
              {currImgIndexOnScreen + 1}/{images.length}
            </Text>
          </Badge>
          

          <PinchGestureHandler
          onGestureEvent = {onPinchGestureEvent}
          onHandlerStateChange = {onPinchGestureEvent}
          >
          <Animated.View style = {{marginTop: 5, zIndex: 10}}>
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
            onLayout = {(event) => {
              const _y = event.nativeEvent.layout.y
              setOrgFlatListOffset(_y)
              fListOffsetAnim.setValue(_y)
              //console.log('orgFlatListOffset-',orgFlatListOffset)
            }}  
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

            data = {images}
            renderItem = {({item, index, separators}) => {
                
                return(
                   
                  <Image
                  
                  source = {item} style = {{
                  flex:1,
                  height: HEIGHT_IMG,
                  width : window.width,
                  resizeMode:'contain'}}
                  
                  />
                
                  
                )}}
          />
          </Animated.View>
          </Animated.View>
          </PinchGestureHandler>            

          <FlatList
            style = {{marginTop:7}}
            horizontal = {true}
            showsHorizontalScrollIndicator = {false}
            decelerationRate = {'fast'}
            snapToInterval = {window.width}
            snapToAlignment = {'center'}
            disableIntervalMomentum = {true}
            
            data = {files}
            renderItem = {({item, index, separators}) => {
              return(
                <BaseButton

                onPress = {async()=>{
                  //console.log('pressed')
                  const file = 'FrontPage.pdf'; // this is your file name

                  try {
                    const res = await DocumentPicker.pick({
                      type: [DocumentPicker.types.allFiles],
                    });
                    //console.log(res.uri)
                    await FileViewer.open(res.uri);
                  }
                  catch(e) {
                    console.log(e)
                  }
                  
                }}
                onActiveStateChange = {(active) =>{
                  setBtnOpacity(active ? 0: 100)
                }}
                >
                
                  <Row 
                  style = {{
                    padding:10,  
                    backgroundColor: "#e8e8e8",
                    alignItems: 'center', 
                    width: window.width,
                    height: 50,
                    opacity: btnOpacity,
                    elevation: 3,   // to put shadow under row (ANDROID)
                    marginBottom: 8, //if you don't put margin then shadow won't be visible

                    shadowColor: '#000',                      //(IOS)
                    shadowOffset: { width: 0, height: -3 },   //(IOS)
                    shadowOpacity: 0.3,                       //(IOS)
                    shadowRadius: 2,                          //(IOS)
                  }}>
                    
                    <Text style = {{color:"#4d4b4b",marginEnd:15,fontSize: 13.5}}>
                    {index + 1}/{files.length}
                    </Text>                  
                    
                    
                    <Icon type ='FontAwesome' name ='file-pdf-o' />
                    
                    <Text style = {{fontSize: 18, marginStart:10}}>
                      {item}
                    </Text>
                    
                  </Row>
                </BaseButton>
                
              )
            }}
          />
          
          
          <Text style = {{padding:7,paddingTop: 5}}>
          All the sdfasdf s
          sdfasdfasdf
          dsfasdf
          asdfasdf
          asd dfasdfsdfsdf
          fasdfasdfdfasdf asdfasdfasd fsdfasdf asdf asdfasdfasd dfasd fasdf asdf asdf asdf asdfrigoertjqperg sdfg sv bcvbcvbsfghwthwrt   gdfg
          </Text>
          
        </Content>
      
      </Container>
      </Animated.View>
      </PinchGestureHandler>
      </Animated.View>
      </PanGestureHandler>
     
      </SafeAreaView>
    )
}
export default Notice