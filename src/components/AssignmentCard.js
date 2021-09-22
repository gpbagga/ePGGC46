import React, {useState}  from 'react'
import {View, Image, StyleSheet, TouchableOpacity } from 'react-native'

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
import getTimeAgoStr from '../utils/getTimeAgoStr';
import getDueDateStr from '../utils/getDateTimeStr';

const lineColor = Color('#CAD5E2').lighten(0.1).hex()

const HorizontalLine = () => (
  <View style = {{
    marginHorizontal: 5,
    borderBottomColor: lineColor,
    borderBottomWidth: StyleSheet.hairlineWidth}}
    />
)

const AssignmentCard = ({assignment, userDetails, onPressSubmissionsBtn}) => {

  let assImages, assFiles
  if(assignment[strLiterals.imagesDownloadURLs]){
    assImages = [...assignment[strLiterals.imagesDownloadURLs]]
  }
  if(assignment[strLiterals.otherFiles]){
    assFiles = assignment[strLiterals.otherFiles].length
  }

  const isStudent = userDetails[strLiterals.designation] === strLiterals.student

  const timeAgoStr = getTimeAgoStr(assignment[strLiterals.timestamp])
  const dueDateStr = getDueDateStr(assignment[strLiterals.dueDate])

  return(
      
    <Card style = {styles.card}>

      {(assignment[strLiterals.about] || assignment[strLiterals.task]) ? (
        <Row style = {{
          borderTopEndRadius: 10,
          minHeight: assImages || assFiles ? 85 : 0,
        }}>  
          <Col style = {styles.subjectNoticeTextContainer}>
          
            {assignment[strLiterals.about] &&
              <Text style = {{fontSize: 18}} numberOfLines = {3}>
              {assignment[strLiterals.about]}
              </Text>
            }        
            {assignment[strLiterals.task] &&
              <Text note style = {{fontSize:15}} numberOfLines = {5}>
              {assignment[strLiterals.task]}
              </Text>
            }  
            
          </Col>
        
          {assImages ? (
            <Image source = {{uri: assImages[0]}} 
            style = {{borderTopRightRadius:10, ...styles.image}}/>    
          ) : (
            assFiles && 
              <Icon type ='MaterialCommunityIcons' name ='file-document-outline' 
              style = {{fontSize: 85}} />
          )}
        </Row>
        ):(
          //no about or noticeText only images or files
          
          <Row style = {{
            justifyContent:'center',
            alignItems:'center',
            height: 100, 
            marginHorizontal: 5,
          }}>
            
            {assImages && assImages.map((item, index) => {
              if(index >= 3){
                // we are giving 30% width to each image so only 3 images can fit in
                return
              }
              return(
                <Image key = {index} source = {{uri: item}} 
                style = {{ ...styles.image,width: '30%' ,marginStart: 2}}/>    
              )
            })}
            {assImages && assImages.length <= 2 && assFiles && 
              // there are 3 notice images then there will be no space for file icon
              <Icon type ='MaterialCommunityIcons' name ='file-document-outline' 
              style = {{fontSize: 85, marginStart: -5}} />
              
            }
            {!assImages && assFiles && 
              <Icon type ='MaterialCommunityIcons' name ='file-document-outline' 
              style = {{fontSize: 85, marginStart: -5}} />
            }
            
          </Row>
          
        )
        
      }
      <HorizontalLine />
      <View style = {styles.secondLastLineContainer}>
        <Row style = {{alignItems:'center'}}>
          <Text style = {{color:'#03203C', fontSize: 14}}>Due Date: </Text>
          <Text style = {{color:'#BF3312'}}>
          {dueDateStr}
          </Text>
        </Row>
        {isStudent && assignment[strLiterals.submissions] && assignment[strLiterals.submissions][userDetails.uid] &&
          <Text style = {{color: '#1C8D73', fontSize: 13}}>
          {assignment[strLiterals.submissions][userDetails.uid][strLiterals.names].length} files submitted
          </Text>
        }
        {!isStudent && assignment[strLiterals.submissions] &&
          <TouchableOpacity
          onPress = {onPressSubmissionsBtn}
          >
            <Text style = {{color: '#1C8D73', fontSize: 14, textDecorationLine: 'underline'}}>
            Submissions
            </Text>
          </TouchableOpacity>
        }

      </View>

      <Row style = {styles.bottomLineContainer}>
        <Text note style = {styles.bottomLineTxt}>
        {assignment[strLiterals.by]} 
        </Text>
        <Text style = {{color: Color('#454545').lighten(.9).hex()}}> . </Text>
        <Text note style = {{...styles.bottomLineTxt, marginStart:0}}>
        {timeAgoStr}
        </Text>
      </Row>
    
    </Card>



    
      
    )
}

export default AssignmentCard

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
    
  },
  secondLastLineContainer: {
    width: '100%',  
    alignSelf:'baseline',
    padding: 5,
    paddingStart: 10,
    justifyContent:'space-evenly'
  }
})