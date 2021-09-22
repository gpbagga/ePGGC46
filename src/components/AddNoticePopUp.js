import React, {useRef,useState, useEffect}  from 'react'
import {FlatList, useWindowDimensions,View, Modal, TouchableOpacity, TouchableWithoutFeedback} from 'react-native'

import {
    Card,
    Content,
    CardItem,
    Thumbnail,
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
    Title
  } from 'native-base';

const AddNoticePopUp = () => {
    <Modal
    transparent={true}
    visible={popUp}
    onRequestClose={() => {
      // this function is invoked when user presses the back button
      setPopUp(false)
    }}>
      <TouchableWithoutFeedback onPress = {() => setPopUp(false)}>
      <View //this is outerView 
      style = {{
        flex: 1
      }}>
        <TouchableWithoutFeedback
        //this is to ignore the touch event caught by parent view's touchable
        >
          <View //this is modal view
          style = {{
            position: 'absolute',
            top: 56,
            end: 0,
            backgroundColor: '#fff',
            
            elevation: 5,     //for shadow in ANDROID

            shadowColor: '#000',                      //(IOS)
            shadowOffset: { width: 0, height: -5 },   //(IOS)
            shadowOpacity: 0.3,                       //(IOS)
            shadowRadius: 2,    
          }}
          >
            <TouchableOpacity>
              <Text
              style = {{
                justifyContent: 'center',
                backgroundColor: '#66ffff',
                fontSize: 20,
                paddingVertical: 20,
                paddingHorizontal:30,
              }}
              >Via Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
              style = {{
                justifyContent: 'center',
                backgroundColor: '#80ffaa',
                fontSize: 20,
                paddingVertical: 20,
                paddingHorizontal:30,
              }}
              >Via NoticeBoard</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
}