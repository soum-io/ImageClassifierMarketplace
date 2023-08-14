/**
 * Stores information about all the models stored locally on
 * the users phone
 */

const downloadedModels = (state = [], action) => {
    switch(action.type) {
        case 'UPDATE_DOWNLOADED_MODELS':
            return action.downloadedModels
        default:
            return state
    }
}

export default downloadedModels