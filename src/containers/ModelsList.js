/**
 * View that shows list of models for given context (featured, search, etc.)
 */

import { connect } from 'react-redux'
import React from 'react';
import {ScrollView, View, StyleSheet, RefreshControl, Text} from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import ModelView from '../components/ModelView'
import Modal from 'react-native-modal';
const RNFS = require('react-native-fs');
import {getDownloadedModels} from '../constants/functions'
import DownloadingStats from '../components/DownloadingStats'
import RNFetchBlob from 'rn-fetch-blob'
import firestore from '@react-native-firebase/firestore';
import {strings} from '../constants/strings'



class ModelsList extends React.Component{
    state = {
        modelSelected: false,
        downloadingModel: false,
        modelDownloadCompleted: false,
        labelsDownloadCompleted: false,
        imageDownloadCompleted: false,
        infoDownloadCompleted: false,
        downloadJobId: 0,
        stopDownload: false,
        selectedModel: { // dummy model for now
            key: 0,
            name: 'Model Name',
            shortDesc: 'Short Description',
            description: 'Normal Description',
            imageURI: '../../assets/logo.png',
            lables: [],
            assetLocation: '',
            fileName:  '',
            modelInformation: {
                'top-1': 'N/A',
                'top-5': 'N/A',
                numCategories: 'num categories',
                author: 'author'
            }
        }
    }

    viewModelPage = (key) => {
        /**
         * Open pop up window showing model info and download option
         */
        selectedModel = this.props.pageModels.find(obj => {return obj.key === key })
        this.setState(() => (
            {
                selectedModel: selectedModel,
            }
        ))
        this.toggleModelPage()
    }

    toggleModelPage = () => {
        /**
         * Toggle the boolean that states if a model's information modal should 
         * be showing or not
         */
        this.setState(() => (
            {
                modelSelected: !this.state.modelSelected
            }
        ))
    }

    checkIfModelIsAlreadyDownloaded = () => {
        /**
         * Returns whether or not the selected model has already been downloaded to the user's device
         */
        return (this.props.downloadedModels.some(e => e.name === this.state.selectedModel.name))
    }

    downloadModel = async () => {
        /**
         * Download model from online data store
         */

        this.setState(() => ({downloadingModel: true}))
        selectedModel = this.state.selectedModel
        modelLink = await selectedModel.modelStorageRef.getDownloadURL()
        imageLink = await selectedModel.imageURI
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/' + selectedModel.path)
        /**
         * For each component of them models download (the labels text file, the model image, the model, and the json that hold the 
         * model info), make sure download succceeds before proceeding on to the next. the {filename}DownloadCompleted booleans are there to show
         * the user the download progress. All downloads timeout at 60 seconds
         */
        if(!this.state.stopDownload) {
            downloadPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + selectedModel.path + '/labels.txt'
            labels = await (await selectedModel.modelDocRef.get()).data().labels
            var curLabelsStr = ''
            for (index = 0; index < labels.length; index++) { 
                curLabelsStr += labels[index] + '\n'
            } 
            await RNFS.writeFile(downloadPath, curLabelsStr).then((success) => {
                this.setState(() => ({labelsDownloadCompleted: true}))
            }).catch((err) => {
                this.setState(() => ({stopDownload: true}))
            });
        }
        if(!this.state.stopDownload) {
            downloadPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + selectedModel.path + '/' + selectedModel.image_path
            await RNFetchBlob.config({fileCache : true, path: downloadPath, timeout:60000}).fetch('GET', imageLink, {}).then(res => {
                this.setState(() => ({imageDownloadCompleted: true}))    
            }).catch((error) => {
                this.setState(() => ({stopDownload: true}))
            })   
        }
        if(!this.state.stopDownload) {
            downloadPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + selectedModel.path + '/info.json'
            info = await (await selectedModel.modelDocRef.get()).data().info
            info.modelInformation.author = selectedModel.authorEmail
            await RNFS.writeFile(downloadPath, JSON.stringify(info)).then((success) => {
                this.setState(() => ({infoDownloadCompleted: true}))    
            }).catch((err) => {
                this.setState(() => ({stopDownload: true}))
            });
        }
        if(!this.state.stopDownload) {
            downloadPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + selectedModel.path + '/' + selectedModel.fileName
            await RNFetchBlob.config({fileCache : true, path: downloadPath, timeout:60000}).fetch('GET', modelLink, {}).then(res => {
                this.setState(() => ({modelDownloadCompleted: true}))  
            }).catch((error) => {
                this.setState(() => ({stopDownload: true}))
            })     
        }
        if(!this.state.stopDownload) { // all downloads happened successfully
            this.setState(() => ( {downloadingModel: false, modelSelected: false}))    
            await this.props.drawerNavigation.navigate('ModelSelect')
            await this.updateDownloadedModels()
        } else { // not all the downloads were successful
            // there was an error on the download, so cleanup neccessary files and alert user
            var path = RNFetchBlob.fs.dirs.DocumentDir + '/' + selectedModel.path
            await RNFS.unlink(path)
            this.setState(() => ( {downloadingModel: false}))  
            alert(strings.downloadError)
        }
        // give modal time to change screens
        setTimeout((async () => {  
            this.setState(() => (
                {
                    labelsDownloadCompleted: false,
                    imageDownloadCompleted: false,
                    infoDownloadCompleted: false,
                    modelDownloadCompleted: false,
                }
            ))
            }).bind(this), 1000);
        
    }

    updateDownloadedModels = async () => {
        /**
         * update the list of downloaded models so that the modelselect screen rerenders
         */
        modelsDownloded = await getDownloadedModels()
        await this.props.updateDownloadedModels(modelsDownloded)
    }

    downloadFile = async(link, filepath) => {
        /**
         * given url and filepath, download file from the url to that filepath
         */
        console.log(filepath)
        await RNFS.downloadFile({fromUrl:link, toFile: filepath}).promise.then(res => {
            console.log('done!')
          });
    }

    componentWillUnmount() {
        /**
         * If the component is about to unmount and the 
         * refresh symbol is up, turn it off
         */
        this.setState(() => (
            {refreshing: false}
        ))
    }

    onRefresh = async () => {
        /**
         * call the refresh function that was passed from parent to refresh the models currently shown
         */
        await this.props.onRefresh()
        // Only the mymodels page will not cause modelsList to not unmount before this,
        // so this check is needed
        if(this.props.refreshComponent == 'MyModels') {
            this.setState(() => (
                {refreshing: false}
            ))
        }
    }
    
    render() {
        // allow the calling component to provide a message to the model list if there are no models present
        var additionalMessage = null;
        if(this.props.pageModels.length === 0) {
            additionalMessage = (<View style={styles.additionalMessageView}>
        <Text style={styles.additionalMessage}>{this.props.noModelsMessage}</Text>
            </View>)
        }

        // only important when a model is selected, these two variables dictate what the download model button when say and if it is disabled or not
        var actionLabel = (this.checkIfModelIsAlreadyDownloaded()) ? 'Downloaded' : 'Download Model (' + this.state.selectedModel.size + ')'
        var downloadDisabled = this.checkIfModelIsAlreadyDownloaded()

        return (
            
            <View style={styles.container}>
                <ScrollView testID={'modelsView'} style={styles.scroll} refreshControl={
                    <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh}/>}>
                    {
                        this.props.pageModels.map((l,i) => (
                        <ListItem
                                leftAvatar={{size: 'large', rounded: true, source: {uri:l.imageURI}}}
                                key={i}
                                title={
                                    (
                                        <View style={styles.titleView}>
                                            <Text style={styles.titleText}>
                                                {l.name + ' '}
                                            </Text>
                                            <Icon 
                                                name={l.rating < 0 ? 'arrow-downward' : 'arrow-upward'} 
                                                color={l.rating < 0 ? 'red' : 'green'} 
                                                size={22}
                                            />
                                            <Text style={[styles.titleText, {color: l.rating < 0 ? 'red' : 'green'}]}>
                                                {' ' + l.rating}
                                            </Text>
                                        </View>
                                    )
                                }
                                subtitle={l.shortDesc}
                                topDivider
                                rightIcon={{name: 'keyboard-arrow-right'}}
                                onPress={() => this.viewModelPage(l.key)}
                            />
                        ))
                    }
                    {additionalMessage}
                </ScrollView>
                <Modal isVisible={this.state.modelSelected && !this.state.downloadingModel}>
                    <ModelView 
                        testID={'modelViewVisible'} 
                        modelInfo={this.state.selectedModel} 
                        downloadDisabled={downloadDisabled} 
                        closeWindow={() => this.toggleModelPage()} 
                        actionLabel={actionLabel} 
                        iconName='cloud-download' 
                        actionFun={() => this.downloadModel()}
                    />
                </Modal>
                <Modal isVisible={this.state.downloadingModel}>
                    <DownloadingStats 
                        testID={'DownloadingStatsVisible'} 
                        modelName={this.state.selectedModel['name']} 
                        modelDownloadCompleted={this.state.modelDownloadCompleted}
                        labelsDownloadCompleted={this.state.labelsDownloadCompleted} 
                        imageDownloadCompleted={this.state.imageDownloadCompleted}
                        infoDownloadCompleted={this.state.infoDownloadCompleted}
                    />
                </Modal>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    titleText: {
        fontWeight:'bold', 
        fontSize:17
    },
    titleView: {
        flexDirection:'row'
    },
    container: {
        flex:14
    },
    text: {
        fontSize: 30,
    },
    scroll: {
        height: '100%'
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
    userModels: state.userModels,
    refreshComponent: state.refreshComponent
})

const mapDispatchToProps = dispatch => ({
    updateDownloadedModels:downloadedModels => dispatch({type:'UPDATE_DOWNLOADED_MODELS', downloadedModels})
})

export default connect(mapStateToProps, mapDispatchToProps)(ModelsList)