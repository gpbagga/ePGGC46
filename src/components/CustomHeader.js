import React from 'react'
import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {Icon, Title, Button} from 'native-base'
import {toolbar} from '../themes/variables'
const CustomHeader = ({handleBackPress,title}) => {
  return (
    <LinearGradient colors={['#192f6a', '#3b5998', '#4c669f']} 
    style = {{height: toolbar.toolbarHeight, width:'100%', flexDirection:'row', alignItems:'center'}}>
      <Button
      style = {{alignSelf:'center'}}
      transparent
      onPress = {() => handleBackPress()}
      >
      <Icon type = 'Ionicons' name="arrow-back-outline"  style = {{color: '#fff', alignSelf:'center'}} />
      </Button>
      <Title>{title}</Title>
    </LinearGradient>
  )
}

export default CustomHeader
