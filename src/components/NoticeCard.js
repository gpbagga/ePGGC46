import React, {useState}  from 'react'
import {View, Image, StyleSheet } from 'react-native'

import Color from 'color'

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
import { strLiterals } from '../utils/StringsInDatabase';

const NoticeCard = ({notice, timeAgoStr}) => {

  let noticeImages, noticeFiles
  if(notice[strLiterals.imagesDownloadURLs]){
    noticeImages = [...notice[strLiterals.imagesDownloadURLs]]
  }
  if(notice[strLiterals.otherFiles]){
    noticeFiles = notice[strLiterals.otherFiles].length
  }

  return(
      
    <Card style = {styles.card}>

      {(notice[strLiterals.subject] || notice[strLiterals.noticetxt]) ? (
        <Row style = {{
          borderTopEndRadius: 10,
          minHeight: noticeImages || noticeFiles ? 85 : 0,
        }}>  
          <Col style = {styles.subjectNoticeTextContainer}>
          
            {notice[strLiterals.subject] &&
              <Text style = {{fontSize: 18}} numberOfLines = {3}>
              {notice[strLiterals.subject]}
              </Text>
            }        
            {notice[strLiterals.noticetxt] &&
              <Text note style = {{fontSize:15}} numberOfLines = {3}>
              {notice[strLiterals.noticetxt]}
              </Text>
            }  
            
          </Col>
        
          {noticeImages ? (
            <Image source = {{uri: noticeImages[0]}} 
            style = {{borderTopRightRadius:10, ...styles.image}}/>    
          ) : (
            noticeFiles && 
              <Icon type ='MaterialCommunityIcons' name ='file-document-outline' 
              style = {{fontSize: 85}} />
          )}
        </Row>
        ):(
          //no subject or noticeText only images or files
          
          <Row style = {{
            justifyContent:'center',
            alignItems:'center',
            height: 100, 
            marginHorizontal: 5,
          }}>
            
            {noticeImages && noticeImages.map((item, index) => {
              if(index >= 3){
                // we are giving 30% width to each image so only 3 images can fit in
                return
              }
              return(
                <Image key = {index} source = {{uri: item}} 
                style = {{ ...styles.image,width: '30%' ,marginStart: 2}}/>    
              )
            })}
            {noticeImages && noticeImages.length <= 2 && noticeFiles && 
              // there are 3 notice images then there will be no space for file icon
              <Icon type ='MaterialCommunityIcons' name ='file-document-outline' 
              style = {{fontSize: 85, marginStart: -5}} />
              
            }
            
          </Row>
          
        )
        
      }
    
      <Row style = {styles.bottomLineContainer}>
        <Text note style = {styles.bottomLineTxt}>
        {notice[strLiterals.by]} 
        </Text>
        <Text style = {{color: Color('#454545').lighten(.9).hex()}}> . </Text>
        <Text note style = {{...styles.bottomLineTxt, marginStart:0}}>
        {timeAgoStr}
        </Text>
      </Row>
    
    </Card>



    
      
    )
}

export default NoticeCard

const styles = StyleSheet.create({
  card: {
    borderRadius:10,
    
  },
  subjectNoticeTextContainer:{
    marginTop: 8, 
    marginHorizontal:10, 
    marginBottom: 5,
  },
  image:{
    width: '28%', 
    height: '100%',
  },
  bottomLineTxt:{
    margin:7.5,
    marginStart: 10,
    marginEnd:0,
    fontSize: 13,
    color: Color('#454545').lighten(.9).hex()
  },
  bottomLineContainer:{
    backgroundColor: Color('#CAD5E2').lighten(0.15).hex(), //#CAD5E2
    width: '100%',
    borderBottomStartRadius:10, 
    borderBottomEndRadius:10 ,  
    alignSelf:'baseline',
    
  }
})