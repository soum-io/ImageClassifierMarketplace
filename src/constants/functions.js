/**
 * File to store functions that are used throughout the application
 */

const RNFS = require('react-native-fs');
import storage from '@react-native-firebase/storage';
import RNFetchBlob from 'rn-fetch-blob'
import firestore from '@react-native-firebase/firestore';
import {strings} from './strings'


export const getDownloadedModel = async (modelPath, shortPath, key) => {
    // read in the labels of the model and the info.json file which contains 
    // all the information the app needs to run the model, such as filename.
    const modelInfo = await JSON.parse(await RNFS.readFile(modelPath + '/info.json'));
    const labels = (await RNFS.readFile(modelPath + '/labels.txt')).split('\n')
    new_labels = labels
    shortDesc = await modelInfo.description.slice(0,50)
    if(modelInfo.description.length > 50) {
        shortDesc += '...'
    }
    newModel = {
        key: key,
        name: modelInfo.modelName,
        shortDesc: shortDesc,
        description: modelInfo.description,
        imageURI: 'file://' + modelPath + '/' + modelInfo.image,
        labels: new_labels,
        assetLocation: '/' + shortPath + '/',
        fileName:  modelInfo.fileName,
        modelInformation: {
            'top-1': modelInfo.modelInformation[strings.top1],
            'top-5': modelInfo.modelInformation[strings.top5],
            numCategories: new_labels.length,
            author: modelInfo.modelInformation.author
        }
    }
    return newModel
}

export const getDownloadedModels = async () => {
    /**
     * Read in all the downloaded models on the internal storage of the
     * current device
     */
    // list of all models found
    model_dirs = []
    // all the local models are stored inside the models directory inside the app's internal storage
    if(!(await RNFS.exists(RNFS.DocumentDirectoryPath + '/Models'))) {
        await RNFS.mkdir(RNFS.DocumentDirectoryPath + '/Models')
    }
    result = await RNFS.readDir(RNFS.DocumentDirectoryPath + '/Models')
    for (i = 0; i < result.length; i++) { 
        newModel = await getDownloadedModel(RNFS.DocumentDirectoryPath + '/Models/' + result[i].name, 'Models/' + result[i].name, i)
        await model_dirs.push(newModel)
    } 

    return model_dirs
}

export const makeLocalModelArrayFromRefs = async (modelRefs) => {
    var cloudModels = []
    // Loop through each model, and obtain all the required info from each 
    // models directory on the server, and store it in memory
    for (idx = 0; idx < await modelRefs.length; idx++) { 
        var path = await modelRefs[idx].path
        var modelRef = firestore().doc(path)
        var cloudModel = await makeLocalModelFromRef(modelRef)
        cloudModels.push(await cloudModel)
    } 
    return cloudModels
}

export const makeLocalModelFromRef = async (modelRef) => {
    var path = modelRef.path
    var modelDoc = (await modelRef.get()).data()
    // get author's email
    var authorRef = modelDoc.info.modelInformation.author
    var authorData = await (await authorRef.get()).data()
    var authorEmail = authorData.email
    var json = modelDoc.info
    modelStorageRef = storage().ref(path + '/' + json.fileName)
    modelData = await modelStorageRef.getMetadata()
    var shortDesc = await json.description.slice(0,50)
    if(await json.description.length > 50) {
        shortDesc += '...'
    }
    cloudModel = {
        key: await idx,
        path: await path,
        size: (modelData.size/1000000.0).toFixed(1) + ' MB',
        modelStorageRef: await modelStorageRef,
        modelDocRef: modelRef,
        fileName: await json.fileName,
        name: await json.modelName,
        description: await json.description,
        shortDesc: await shortDesc,
        modelInformation: await json.modelInformation,
        image_path: await json.image,
        imageURI: await storage().ref(path + '/' + json.image).getDownloadURL(),
        rating: modelDoc.numLikes,
        numberOfReviews: modelDoc.comments.length,
        commentRefs: modelDoc.comments,
        authorEmail: authorEmail
    }
    cloudModel.modelInformation.numCategories = modelDoc.labels.length
    return cloudModel
}

export const getCloudModels = async () => {
    /**
     * Get a list of all the models available on the server 
     */

    // all the models are stored in the 'Models' folder on the root of the
    // server storage
    modelsRef = storage().ref('Models/')
    modelRefs = await (await modelsRef.listAll())._prefixes
    return makeLocalModelArrayFromRefs(modelRefs)
}