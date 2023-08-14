/**
 * Screen that allows the user to select a model they have downloaded
 */

import { connect } from 'react-redux'
import React from 'react';
import {Text, View, StyleSheet, ScrollView, Button, RefreshControl} from 'react-native';
import MenuButton from '../components/MenuButton'
import { ListItem } from 'react-native-elements';
import ModelView from '../components/ModelView'
import Modal from 'react-native-modal';
import {getDownloadedModels} from '../constants/functions'
import ComponentTitle from '../components/ComponentTitle'
import {strings} from '../constants/strings'


class ModelSelect extends React.Component{

    componentDidMount = async () => {
        // load any downloaded models to show the user what models they have downloaded
        await this.lookForDownloadedModels()
    }

    lookForDownloadedModels = async () => {
        /**
         * Checks for all locally installed models, and puts that information in memory
         */
        modelsDownloded = await getDownloadedModels()
        await this.props.updateDownloadedModels(modelsDownloded)
    }
    

    state = {
        isModelSelected: false,
        selectedModel: undefined,
        update: false
    }

    changeModal = async (modelInfo) => {
        /**
         * Opens and closes the pop up screen that shows model information
         */
        this.setState(() => (
            {selectedModel: modelInfo}
        ))
        this.closeModelView()
    }

    closeModelView = async () => {
        /**
         * change state for if the modal should be displated
         */
        this.setState(() => (
            {isModelSelected: !this.state.isModelSelected}
        ))
    }

    openModelUse = async () => {
        /**
         * Opens up screen to use select model for classification  
         */
        this.setState(() => (
            {isModelSelected: false}
        ))
        this.props.navigation.navigate(strings.modelUse, {modelInfo: this.state.selectedModel})
    }

    onRefresh = async () => {
        /**
         * Refresh the list of models that the user has downloaded
         */
        await this.lookForDownloadedModels()
        this.setState(() => (
            {refreshing: false}
        ))
    }

    componentDidUpdate = async (prevProps) => {
        /**
         * every time that the downloaded models list updates, rerender this page to show the 
         * new downloaded models
         */
        if(prevProps.downloadedModels !== this.props.downloadedModels) {
            this.setState(() => (
                {update: !this.state.update}
            ))
        }
    }

    render() {
        // if the user has not models, tell them to download models from the marketplace tab
        var additionalMessage = null;
        if(this.props.downloadedModels.length === 0) {
            additionalMessage = (
                <View style={styles.additionalMessageView}>
                    <Text style={styles.additionalMessage}>
                        {strings.noDownloadedModels}
                    </Text>
                </View>
            )
        }

        return (
            <View testID={'modelSelectContainer'} style={styles.container}>
                <MenuButton navigation={this.props.navigation}/>
                <ComponentTitle title={strings.downloadedModels} navigation={this.props.navigation}/>
                <View style={styles.scrollViewContainer}>
                    <ScrollView testID={'modelSelectScroll'} style={styles.scroll} refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh}/>}>
                        {
                            this.props.downloadedModels.map((l,i) => (
                                <ListItem
                                    leftAvatar={{size: 'large', rounded: true, source: {uri:l.imageURI}}}
                                    key={i}
                                    title={(
                                        <Text style={styles.modelTitle}>{l.name}</Text>
                                    )}
                                    subtitle={l.shortDesc}
                                    topDivider
                                    rightIcon={{name: 'keyboard-arrow-right'}}
                                    onPress={() => this.changeModal(l)}
                                />
                            ))
                        }
                        {additionalMessage}
                    </ScrollView>
                </View>
                <Modal isVisible={this.state.isModelSelected}>
                    <ModelView 
                        testID={'modelSelectModelView'} 
                        closeWindow={() => this.closeModelView()} 
                        actionLabel={strings.openModel} 
                        iconName='folder-open' 
                        actionFun={() => this.openModelUse()} 
                        modelInfo={this.state.selectedModel} 
                    />
                </Modal>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    modelTitle: {
        fontWeight:'bold', 
        fontSize:17
    },
    scrollViewContainer: {
        flex:14
    },
    container: {
        flex: 1
    },
    text: {
        fontSize: 30,
    },
    scroll: {
        height: '100%',
    },
    additionalMessage: {
        textAlign: 'center',
        fontSize: 25,
        flex: 1
    },
    additionalMessageView: {
        alignContent: 'center',
        justifyContent: 'center',
        padding: 15,
        margin: 15,
        borderColor: 'black',
        borderWidth: 0.5,
        borderRadius: 15
    }
});

const mapStateToProps = state => ({
    downloadedModels: state.downloadedModels,
})

const mapDispatchToProps = dispatch => ({
    updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(ModelSelect)