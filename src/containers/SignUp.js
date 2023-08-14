/**
 * Screen to sign up a user.
 */

import { connect } from 'react-redux'
import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableHighlight, Image, Alert, AsyncStorage, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {strings} from '../constants/strings'

class SignUp extends Component {

  state = {
    authenticated: false,
    email: '',
    password: '',
    retypePassword: ''
  }

  goToLogin = () => {
    /**
     * Switch screens to the login screen
     */
    this.props.navigation.navigate(strings.login)
  }

  signUp = () => {
    /**
     * Check that user entered valid sign up credentials and, 
     * once completed, navigate to the marketplace
     */
    if(this.state.password !== this.state.retypePassword) {
      alert(strings.passNoMatch);
      return;
    }

    if(this.state.password.length < 7) {
      alert(strings.passShort);
      return;
    }

    auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(
          async () => {
            const { currentUser } = auth()
            // create user in database
            userRef = firestore().collection(strings.users).doc(currentUser.uid)
            newUser = {
              comments: [],
              createdModels: [],
              disliked: [],
              liked: [],
              email: currentUser.email
            }
            batch = firestore().batch()
            await batch.set(userRef, newUser)
            await batch.commit()
            // update user redux info
            await this.props.updateUserReference(currentUser.uid)
            await this.props.updateUser({'email':this.state.email})
            await this.props.navigation.navigate(strings.loading)
          }
        )
      .catch(error => alert(strings.authError + error.message))
  }


  render() {
    return (
    <KeyboardAvoidingView testID={'signUpContainer'} style={styles.container}>

        <Image testID={'logo'} style={styles.logo} source={require('../../assets/logo.png')} />

        <View testID={'email'} style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name='mail' size={24}/>
            <TextInput style={styles.inputs}
                placeholder='Email'
                keyboardType='email-address'
                underlineColorAndroid='transparent'
                onChangeText={(email) => this.setState({email})}/>
        </View>
        
        <View testID={'password'} style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name='key' size={24}/>
            <TextInput style={styles.inputs}
                placeholder={strings.password}
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                onChangeText={(password) => this.setState({password})}/>
        </View>

        <View testID={'retypePassword'} style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name='key' size={24}/>
            <TextInput style={styles.inputs}
                placeholder={strings.rePassword}
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                onChangeText={(retypePassword) => this.setState({retypePassword})}/>
        </View>

        <TouchableHighlight 
            testID={'Signup'} 
            style={[styles.buttonContainer, styles.loginButton]} 
            onPress={() => this.signUp()}>
              <Text style={styles.loginText}>
                {strings.signupText}
              </Text>
        </TouchableHighlight>

        <TouchableHighlight 
            testID={'loginButton'} 
            style={[styles.buttonContainer, styles.loginButton]} 
            onPress={() => this.goToLogin()}>
              <Text style={styles.loginText}>
                {strings.loginText}
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
})

const mapDispatchToProps = dispatch => ({
  updateUserReference:userReference => dispatch({type:'UPDATE_USER_REFERENCE', userReference}),
  updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
  updateUser:user => dispatch({type:'UPDATE_USER', user}),
  updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)

