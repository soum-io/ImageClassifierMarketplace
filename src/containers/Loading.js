/**
 * A Loading screen that displays until we determine the auth state of a user
 * Source: https://medium.com/react-native-training/react-native-firebase-authentication-7652e1d2c8a2
 */

import { connect } from 'react-redux'
import React from 'react'
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth';
import {getCloudModels, getDownloadedModels} from '../constants/functions'
import {strings} from '../constants/strings'



class Loading extends React.Component {

  state = {
    needRefresh: false
  }

  getCloudAndDownloadedModels = async () => {
      /**
       * Get and update locally the models available on the cloud, and also 
       * update records of models already installed
       */
      cloudModels = await getCloudModels()
      await this.props.updateCloudModels(cloudModels)
      modelsDownloded = await getDownloadedModels()
      await this.props.updateDownloadedModels(modelsDownloded)
      this.setState(() => (
        {needRefresh: true}
      ))
  }

  componentDidUpdate(prevProps){
    /**
     * When redirected from login or signup, the user will change. Load
     * cloud models and redirect user to marketplace
     */
    if(prevProps.user !== this.props.user && this.state.needRefresh){
        this.doCloudRefresh()
    }
  }


  doCloudRefresh = async (redirect) => {
    await this.getCloudAndDownloadedModels()
    await this.props.navigation.navigate(strings.marketplace)
  }


  componentDidMount = async() => {
    /**
     * Check if there is a user authenticated or not for quick login access
     */
      var authFlag = true;
      auth().onAuthStateChanged( async (user) => {
        if(authFlag)
        {
          authFlag = false
          if(user) {
              // do initial load of cloud models when the app is 
              // initially loaded
              await this.doCloudRefresh()
            } else {
              await this.props.navigation.navigate(strings.login)
              // set auth flag to true so when user logs in, 
              // this component will not remount but the onAuthStateChanged
              // function will be called again, and the flag needs to be true
              authFlag = true
            } 
        }
      })
  }

  render() {
    return (
      <View style={styles.container}>
        <View testID={'appLogo'} style={styles.imgView}>
          <Image style={styles.img} source={require('../../assets/logo.png')} />
        </View>
        <ActivityIndicator size='large' />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
		height: 200,
		width: 200,
  },
  imgView: {
		paddingBottom: 20,
	},
})

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = dispatch => ({
  updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
  updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(Loading)