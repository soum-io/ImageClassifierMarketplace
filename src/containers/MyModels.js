/**
 * Screen that is part of the marketplace navigation, allows
 * users to see the models that they have created and uploaded
 */

import { connect } from 'react-redux'
import React from 'react';
import {View, StyleSheet} from 'react-native';
import MenuButton from '../components/MenuButton'
import ModelsList from './ModelsList'
import {getCloudModels, makeLocalModelArrayFromRefs} from '../constants/functions'
import ComponentTitle from '../components/ComponentTitle'
import firestore from '@react-native-firebase/firestore'
import {strings} from '../constants/strings'




class MyModels extends React.Component{

    state = {
        doneRefreshing: false
    }

    updateModels = async () => {
        /**
         * Loops through each of the cloud models, and selects the one uploaded by the current user
         */
        var userRef = firestore().doc('Users/' + await this.props.userReference)
        var userData = await (await userRef.get()).data()
        var userModels = await userData.createdModels
        await this.props.updateUserModels(await makeLocalModelArrayFromRefs(userModels))
    }

    onRefresh = async () => {
        /**
         * Look for models of the user on every refresh
         */
        this.props.updateRefreshComponent('MyModels')
        await this.updateModels()
    }

    componentWillMount = async () => {
        await this.updateModels()
    }

    render() {
        var noModelsMessage = strings.noPersonalModels
        return (
            <View testID={'myModelsContainer'} style={styles.container}>
                <MenuButton navigation={this.props.drawerNavigation}/>
                <ComponentTitle title='Marketplace' navigation={this.props.drawerNavigation}/>
                <ModelsList 
                    noModelsMessage={noModelsMessage} 
                    onRefresh={this.onRefresh} 
                    pageModels={this.props.userModels} 
                    drawerNavigation={this.props.drawerNavigation}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex:1
    }
});

const mapStateToProps = state => ({
    userModels: state.userModels,
    userReference: state.userReference,
})

const mapDispatchToProps = dispatch => ({
    updateUserModels:userModels => dispatch({type:'UPDATE_USER_MODELS', userModels}),
    updateCloudModels:cloudModels => dispatch({type:'UPDATE_CLOUD_MODELS', cloudModels}),
    updateRefreshComponent:refreshComponent => dispatch({type:'UPDATE_REFRESH_COMPONENT', refreshComponent}),
    updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(MyModels)