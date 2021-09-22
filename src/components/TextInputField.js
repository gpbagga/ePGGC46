import React from 'react'
import {TouchableOpacity,StyleSheet, View, } from 'react-native'
import {
  Item, Input,
  Text,
  Icon
} from 'native-base'
// <Item regular style = {styles.formItem}></Item>
const TextInputField = ({label, value, onChangeText,secureTextEntry, style}) => {
  return (
    <View style = {style}>
      <Text style = {styles.label}>{label}</Text>
      <View style = {styles.formItem}>
        <Input 
        style = {{color:'#fff'}}
        value = {value}
        onChangeText = {(text) => onChangeText(text)}        
        secureTextEntry ={secureTextEntry}
        />
        {value!== null && 
          <TouchableOpacity onPress = {() => onChangeText(null)}>
            <Icon type = 'Entypo' name="cross" style = {{color: 'white'}} />
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formItem: {
    flexDirection:'row',justifyContent:'space-between',alignItems:'center',
    paddingHorizontal:5,
    
    marginTop:7,
    marginBottom: 20,
    borderRadius: 5,
    borderColor:'#f0f1f2',
    borderWidth:StyleSheet.hairlineWidth
  },
  label: {
    color: '#f0f1f2', 
    fontSize: 14
  }
})

export default TextInputField
