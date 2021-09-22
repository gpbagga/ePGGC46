import React from 'react'
import {Text,StyleSheet, View, } from 'react-native'

import {Picker} from '@react-native-picker/picker';

const PickerField = ({label, selectedValue, onValueChange,list, style}) => {
  //console.log(selectedValue)
  return (
    <View style = {style}>
      <Text style = {styles.label}>{label}</Text>
      <View style = {styles.formItem}>
        <Picker
          style = {{color: selectedValue ? '#fff' : 'gray'}}
          mode = "dropdown"
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          > 
            <Picker.Item 
            label= 'Pick your country' value={null} 
            style = {{color: 'gray', alignSelf: 'center'}}
            />
            {list.map((item, index) => (
              <Picker.Item 
              key = {index}
              label= {item} value={item} 
              style = {{color:'#000', alignSelf: 'center'}}
              />
            ))}
        </Picker>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formItem: {
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

export default PickerField
