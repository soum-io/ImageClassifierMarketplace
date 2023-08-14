/**
 * Screen to Authenticate User
 * For email sign in links with FireBase: https://invertase.io/oss/react-native-firebase/quick-start/android-firebase-credentials
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableHighlight, Image, Alert, AsyncStorage, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
const RNFS = require('react-native-fs');
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux'
import {strings} from '../constants/strings'


class Login extends Component {

  state = {
    authenticated: false,
    email: '',
    password: ''
  }

  componentDidMount = async () => {
  // check if this is the first time app is being opened. If it is,
  // move the starter models from android assets folder to internal 
  // storage
  if(!(await RNFS.exists(RNFS.DocumentDirectoryPath + '/Models'))) {
    // if(true) {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Models')
      // loop through each individual file in assets folder and copy to 
      // corresponding location in internal app storage to start each new user
      // with some pre downloaded models
      result = await RNFS.readDirAssets('Models/')
      for (i = 0; i < result.length; i++) {
        innerResult = await RNFS.readDirAssets('Models/' + result[i].name)
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Models/' + result[i].name)
        for (ii = 0; ii < innerResult.length; ii++) { 
          filepath = 'Models/'+ result[i].name + '/' + innerResult[ii].name
          dest = RNFS.DocumentDirectoryPath + '/' + filepath
          await RNFS.copyFileAssets(filepath, dest)
        }  
      }
    }
    // signout user if already signed in. This only occurs when logout button is pressed and the user 
    // is redirected to the login page. 
    // await auth().signOut()
    this.props.logout(undefined)
  }

  login = async () => {
    /**
     * Check if entered credentials are correct, and login in
     * if they are or notify the user if not
     */
    if(this.state.email ==='' || this.state.password ==='') {
      alert(strings.enterEmailAndPass)
      return
    }


    // try to login user with the creditials they entered
    auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then( async (response) => {
        const { currentUser } = auth()
        await this.props.updateUser({'email':currentUser.email})
        await this.props.updateUserReference(currentUser.uid)
        await this.props.navigation.navigate(strings.loading)
      })
      .catch(error => alert( strings.authError + error.message))
  }

  goToSignUp = () => {
    /**
     * Go to sign up page
     */
    this.props.navigation.navigate(strings.signup)
  }

  render() {
    return (
    <KeyboardAvoidingView testID={'loginView'} style={styles.container}>

        <Image testID={'logo'} style={styles.logo} source={require('../../assets/logo.png')} />

        <View testID={'email'} style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name='person' size={24}/>
            <TextInput style={styles.inputs}
                placeholder='Email'
                keyboardType='email-address'
                underlineColorAndroid='transparent'
                onChangeText={(email) => this.setState({email})}/>
        </View>
        
        <View testID={'password'} style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name='key' size={24}/>
            <TextInput style={styles.inputs}
                placeholder='Password'
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                onChangeText={(password) => this.setState({password})}/>
        </View>

        <TouchableHighlight 
            testID={'loginButton'} 
            style={[styles.buttonContainer, styles.loginButton]} 
            onPress={() => this.login()}>
              <Text style={styles.loginText}>
                {strings.loginText}
              </Text>
        </TouchableHighlight>
        <TouchableHighlight 
            testID={'Signup'} 
            style={[styles.buttonContainer, styles.loginButton]} 
            onPress={() => this.goToSignUp()}>
              <Text style={styles.loginText}>
                {strings.signupText}
              </Text>
        </TouchableHighlight>
    </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DCDCDC',
  },
  inputContainer: {
      borderBottomColor: '#F5FCFF',
      backgroundColor: '#FFFFFF',
      borderRadius:30,
      borderBottomWidth: 1,
      width:250,
      height:45,
      marginBottom:20,
      flexDirection: 'row',
      alignItems:'center'
  },
  inputs:{
      height:45,
      marginLeft:16,
      borderBottomColor: '#FFFFFF',
      flex:1,
  },
  inputIcon:{
    width:30,
    height:30,
    marginLeft:15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: '#00b5ec',
  },
  loginText: {
    color: 'white',
  },
  logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20
  }
});


const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = dispatch => ({
  updateUser:user => dispatch({type:'UPDATE_USER', user}),
  updateUserReference:userReference => dispatch({type:'UPDATE_USER_REFERENCE', userReference}),
  logout:_ => dispatch({type:'USER_LOGOUT', _}),
  updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
  updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels}),
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
