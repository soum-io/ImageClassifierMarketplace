/**
 * When a model is selected to be used, this contianer is shown to 
 * take or select a picture, and then classify the picture.
 */

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView} from 'react-native'
import * as Permissions from 'expo-permissions';
import {Icon} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import { ListItem } from 'react-native-elements';
import { Tflite } from 'react-native-tflite-classification';
let tflite = new Tflite()
import {strings} from '../constants/strings'



export default class ModelUse extends React.Component{

    releaseResources = () => {
        /**
         * Releases all resources used by the model on the native side of things.
         */
        if(this.state.modelName !== '') {
            // tflite.close()
        }
        this.setState({ image: null });
        this.setState({ results: [] });
        this.setState({ modelName: '' });
    }

    takePicture = async () => {
        /**
         * Asks the user for permission to use the camera, has the user 
         * take a picture, and makes sure the picture has a square aspect
         * ratio so that it feeds in to the models correctly
         */
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        if (status !== strings.granted) {
          alert(strings.permissionNeeded);
          return
        }
        const { cancelled, uri } = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4,4]
        });

        if (!cancelled) {
            this.setState({ image: uri });
        }
    };

    selectPicture = async () => {
        /**
         * Asks the user for permission to obtain an image from the gallery, 
         * and makes sure the image has a square aspect ration through cropping
         */
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== strings.granted) {
          alert(strings.permissionNeeded);
          return
        }
        const { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4,4]
        });


        if (!cancelled) {
            this.setState({ image: uri });
        }
    };


    classifyPicture = () => {
        /**
         * If the user has a picture selected, classify it using the selected tflite
         * model.
         */
        modelInfo = this.props.navigation.getParam('modelInfo')
        console.log(modelInfo.assetLocation + modelInfo.fileName)
        console.log(modelInfo.assetLocation + strings.labelsTxt)
        if(this.state.modelName == '') {
            modelInfo = this.props.navigation.getParam('modelInfo')
            this.setState(() => (
                {modelName: modelInfo.name}
            ))
            // load in the model if the model has not been initialized yet
            tflite.loadModel({
                modelPath: modelInfo.assetLocation + modelInfo.fileName,
                labelsPath: modelInfo.assetLocation + strings.labelsTxt,
              },
              (err, res) => {
                if(err)
                  console.log(err);
                else
                  console.log(res);
              });
        }

        if(this.state.image != null) {
            // run the image against the loaded model
            tflite.runModelOnImage({
                path: this.state.image,
                numResults: 10,
                threshold: 0
              },
              (err, res) => {
                if(err)
                  console.log(err + '\n' + res);
                else {
                    this.setState(() => (
                        {results: res}
                    ))
                }
            });
        } else {
            alert(strings.pleaseSelectImage);
        }
    };

    state = {
        results: [],
        image: null,
        imageSize: 0,
        iconSize: 0,
        modelName: ''
    }

    find_image_dimesions(layout){
        /**
         * finds the dimensions of the current view to size image correctly
         */
        const {x, y, width, height} = layout;
        this.setState(() => (
            {imageSize: width > height ? height : width}
        ))
    }

    find_icon_dimesions(layout){
        /**
         * finds the dimensions of the current view to size icon in buttons correctly
         */
        const {x, y, width, height} = layout;
        this.setState(() => (
            {iconSize: (width > height ? height : width) - 20}
        ))
    }

    go_back = () => {
        /**
         * Go back to the select model page
         */
        this.props.navigation.navigate(strings.modelSelect)
        this.releaseResources()
    }

    render() {
        return (
            <View testID={'mainModelUse'} style={styles.container}>

                <View testID={'imageContainer'} style={styles.imageContainer} onLayout={(event) => { this.find_image_dimesions(event.nativeEvent.layout) }}>
                    <Image 
                        style={[{height:this.state.imageSize, width:this.state.imageSize}, styles.image]} 
                        source={{ uri: this.state.image }} 
                    />
                </View>

                <View testID={'buttonContainer'} style={styles.buttonContainer}>
                    <View testID={'cameraButtton'} style={styles.buttonAndLabel}>
                        <View style={styles.singleButtonContainer}>
                            <TouchableOpacity
                                style={styles.circleButton}
                                onPress={this.takePicture}
                                >
                                <Icon name={'camera-alt'}  size={this.state.iconSize} color='#01a699' />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonLabel}>
                            <Text>{strings.takeImage}</Text>
                        </View>
                    </View>
                    <View testID={'pictureSelector'} style={styles.buttonAndLabel}>
                        <View style={styles.singleButtonContainer}>
                            <TouchableOpacity
                                style={styles.circleButton}
                                onPress={this.selectPicture}
                                >
                                <Icon name={'photo-album'}  size={this.state.iconSize} color='#01a699' />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonLabel}>
                            <Text>{strings.selectImage}</Text>
                        </View>
                    </View>
                    <View testID={'classifyButtton'} style={styles.buttonAndLabel}>
                        <View style={styles.singleButtonContainer}>
                            <TouchableOpacity
                                onLayout={(event) => { this.find_icon_dimesions(event.nativeEvent.layout) }}
                                style={styles.circleButton}
                                onPress={this.classifyPicture}
                                >
                                <Icon name={'check'}  size={this.state.iconSize} color='#01a699' />
                             </TouchableOpacity>
                        </View>
                        <View style={styles.buttonLabel}>
                            <Text>{strings.classifyImage}</Text>
                        </View>
                    </View>
                    <View testID={'GoBackButtton'} style={styles.buttonAndLabel}>
                        <View style={styles.singleButtonContainer}>
                            <TouchableOpacity
                                onLayout={(event) => { this.find_icon_dimesions(event.nativeEvent.layout) }}
                                style={styles.circleButton}
                                onPress={this.go_back}
                                >
                                <Icon name={'arrow-back'}  size={this.state.iconSize} color='#01a699' />
                             </TouchableOpacity>
                        </View>
                        <View style={styles.buttonLabel}>
                            <Text>{strings.backCap}</Text>
                        </View>
                    </View>
                </View>

                <View testID={'resultsContainer'} style={styles.classifierList}>
                    <View style={styles.insideList}>
                        <ScrollView>
                            {
                                this.state.results.map((l,i) => (
                                    <ListItem
                                        key={i}
                                        title={(i+1).toString() + '. ' + l.label}
                                        rightTitle={strings.confidence + (l.confidence * 100).toFixed(2) + '%'}
                                        topDivider
                                        bottomDivider
                                    />
                                ))
                            }
                        </ScrollView>
                    </View>
                </View> 
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imageContainer: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30
    }, 
    image: {
        backgroundColor: 'gray' ,
        borderRadius: 10
    },
    buttonLabel: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        flex: 1
    },
    buttonAndLabel: {
        flex: 1
    },
    classifierList: {
        flex: 2
    },
    insideList: {
        flex: 1,
        margin: 20,
        borderColor: 'black',
        borderWidth: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden'
    },
    singleButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    circleButton: {
        borderWidth:1,
        borderColor:'rgba(0,0,0,0.2)',
        alignItems:'center',
        justifyContent:'center',
        height: '85%',
        aspectRatio: 1,
        backgroundColor:'#fff',
        borderRadius:50,
    }
})