import React, {useRef,useState, useEffect, useCallback}  from 'react'
import {FlatList, Image,View, Modal, StyleSheet, TouchableWithoutFeedback} from 'react-native'

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
    Title,
    Spinner
  } from 'native-base';

import propTypes from 'prop-types'
import { connect} from 'react-redux'

import {strLiterals} from '../utils/StringsInDatabase'
import Snackbar from 'react-native-snackbar';
import { addListener_NoticeBoard, removeListener_NoticeBoard } from '../action/noticeBoard';
import EmptyContainer from '../components/EmptyContainer';
import NoticeCard from '../components/NoticeCard';
import { useFocusEffect } from '@react-navigation/native';

const getTimeAgoStr = (timestamp) => {
  let timeAgo

  const currentDate = new Date();
  const currentTimestamp = currentDate.getTime();
  
  const seconds = Math.floor((currentTimestamp - timestamp)/1000)
  
  if(seconds < 60){
    timeAgo = seconds === 1 ? '1 second ago': seconds + ' seconds ago'
  }
  else{
    const min = Math.floor(seconds/60) 
    if(min < 60){
      timeAgo = min === 1 ? '1 minute ago': min + ' minutes ago'
    }else{
      const hours = Math.floor(min/60)

      if(hours < 24 ){
        timeAgo = hours === 1 ? '1 hour ago': hours + ' hours ago'
      }else{
        const days = Math.floor(hours/24)
        timeAgo = days === 1 ? '1 day ago': days + ' days ago'
      }
    }
  }
  return timeAgo
}


const NoticeBoard = ({navigation, userDetails,noticeBoardState, 
  addListener_NoticeBoard, removeListener_NoticeBoard}) => {
  
  const notices = noticeBoardState.notices
  
  //console.log('rendering NoticeBoard Component')
  useFocusEffect( 
    useCallback(() => {
      removeListener_NoticeBoard()
      addListener_NoticeBoard(userDetails, true)
      
      return () => {removeListener_NoticeBoard(); }
    }, [])
  )

  return(
    <Container>
      <Header>
        <Left>
          <Button transparent onPress = {() => {navigation.goBack()}}>
            <Icon name='arrow-back-outline' />
          </Button>
        </Left>
        <Body>
          <Title>NoticeBoard</Title>
        </Body>
        <Right />
      </Header>

      {!notices ? (
        <EmptyContainer />
      ) : (

        <FlatList
        contentContainerStyle = {{flexGrow: 1}}
        data = {notices}
        showsVerticalScrollIndicator = {false}
        keyExtractor = {(item, index) => item[strLiterals.noticeId]}
        renderItem = {({item, index, separators}) => {
          const timeAgoStr = getTimeAgoStr(item[strLiterals.timestamp])
          return(
            <TouchableWithoutFeedback
            onPress = {() => {
              navigation.navigate("NoticeContent", { 
                notice : item,
                timeAgoStr: timeAgoStr,
                
              })
              
            }}>
              <View
              style = {{
                paddingTop: 15,
                paddingBottom: 15,
                paddingStart:10,
                paddingEnd:10
              }}
              >
                <NoticeCard notice = {item} timeAgoStr = {timeAgoStr} />
              </View>
            </TouchableWithoutFeedback>
          )
        }}
        ListEmptyComponent = {() => (
          <View style = {styles.emptyListComponent}>
            <H1>No Notice Found</H1>
          </View>
        )}
        />
          
      )}
              
    </Container>
              
  )
}

NoticeBoard.propTypes = {
  userDetails: propTypes.object.isRequired,
}// isRequired makes sure that prop passed to Home must not be NULL
  
//....redux config....
const mapStateToProps = (state) => ({
  userDetails: state.auth.user,
  noticeBoardState: state.noticeBoard
})

const mapDispatchToProps = {
  addListener_NoticeBoard: (a,b) => addListener_NoticeBoard(a,b),
  removeListener_NoticeBoard: () => removeListener_NoticeBoard(),
}

export default connect(mapStateToProps, mapDispatchToProps)(NoticeBoard)

const styles = StyleSheet.create({
  emptyListComponent:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})