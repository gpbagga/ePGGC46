import React from 'react'
import { StyleSheet, View } from 'react-native'
import {Card, Text, Row, Icon} from 'native-base'
import getTimeAgoStr from '../utils/getTimeAgoStr';
import getDueDateStr from '../utils/getDateTimeStr';
import {strLiterals} from '../utils/StringsInDatabase'
import Color from 'color'

const HorizontalLine = () => (
  <View style = {{
    marginHorizontal:10,
    borderBottomColor: Color('darkgray').lighten(.3).hex(),
    borderBottomWidth: StyleSheet.hairlineWidth}}
    />
)

const DueAssignmentCard = ({assignment}) => {
  
  let assImages, assFiles
  if(assignment[strLiterals.imagesDownloadURLs]){
    assImages = [...assignment[strLiterals.imagesDownloadURLs]]
  }
  if(assignment[strLiterals.otherFiles]){
    assFiles = assignment[strLiterals.otherFiles].length
  }
  //console.log('rendering DueAssignmentCard', assignment.assignmentId);
  const timeAgoStr = getTimeAgoStr(assignment[strLiterals.timestamp])
  const dueDateStr = getDueDateStr(assignment[strLiterals.dueDate])

  return (
    <Card style = {styles.card}>
    {(assignment[strLiterals.about] || assignment[strLiterals.task]) ? (
        <View style = {styles.subjectNoticeTextContainer}>  
          
          {assignment[strLiterals.about] ? (
            <Text style = {{fontSize: 18}} numberOfLines = {3}>
            {assignment[strLiterals.about]}
            </Text>
          ):(
            <Text note style = {{fontSize:15}} numberOfLines = {3}>
            {assignment[strLiterals.task]}
            </Text>
          )}
        </View>
        ):(
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
          
      )}
      <HorizontalLine />
      <View style = {styles.secondLastLineContainer}>
        <Row style = {{alignItems:'center'}}>
          <Text style = {{color:'#03203C', fontSize: 14}}>Due Date: </Text>
          <Text style = {{color:'#BF3312', fontSize:14}}>
          {dueDateStr}
          </Text>
        </Row>
        
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

export default DueAssignmentCard

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
