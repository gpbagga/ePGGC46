import React, {useState} from 'react'
import {StyleSheet, ScrollView, Image, TouchableOpacity} from 'react-native'

import {
    Container,
    H3,
    Form, 
    Item,
    Input,
    Button,
    Text,
    Content
} from 'native-base'

import {connect} from 'react-redux'
import propTypes from 'prop-types'
import {signIn} from '../action/auth'

import Welcome from "../assets/undraw_welcome_cats_thqn.png"

const SignIn = ({navigation, SIGN_In}) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const doSignIn = () => {
        SIGN_In({username, password})
    }
    return (
        <Container style={styles.container}>
          <Content>
            <H3 style={styles.heading}>Welcome to ePGGC-46</H3>
    
            <Image
              source={Welcome}
              style={{width: null, height: 150, marginTop: 30}}
              resizeMode="contain"
            />
    
            <Form>
              <Item rounded style={styles.formItem}>
                <Input
                  placeholder="enter your registerd username"
                  value={username}
                  style={{color: '#eee'}}
                  onChangeText={(text) => setUsername(text)}
                />
              </Item>
              <Item rounded style={styles.formItem}>
                <Input
                  placeholder="enter your registerd password"
                  value={password}
                  secureTextEntry={true}
                  style={{color: '#eee'}}
                  onChangeText={(text) => setPassword(text)}
                />
              </Item>
              <Button rounded block onPress={doSignIn}>
                <Text>SignIn</Text>
              </Button>        
              
            </Form>
          </Content>
        </Container>
      );
}
// <Button transparent
//               onPress = {() => navigation.navigate('CreateAccount')}
//               style = {{alignSelf:'center'}}
//               >
//                 <Text style = {{color: '#fff'}}>Create an Account</Text>
//               </Button>

//commands
//npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
//rm -rf android/app/build

SignIn.propTypes = {
    SIGN_In: propTypes.func.isRequired
}

//....react config....
const mapDispatchToProps = {
    SIGN_In : (data) => signIn(data)
}

export default connect(null, mapDispatchToProps)(SignIn)

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#1b262c',
      flex: 1,
      justifyContent: 'flex-start',
    },
    heading: {
      textAlign: 'center',
      color: '#fdcb9e',
      marginHorizontal: 5,
      marginTop: 30,
    },
    formItem: {
      marginBottom: 20,
    },
  });
  