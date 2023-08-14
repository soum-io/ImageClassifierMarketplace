/**
 * Store available models from the cloud. The models are displayed
 * on the featured screen.
 */

const cloudModels = (state = [], action) => {
    switch(action.type) {
        case 'UPDATE_CLOUD_MODELS':
            return action.cloudModels
        default:
            return state
    }
}

export default cloudModels