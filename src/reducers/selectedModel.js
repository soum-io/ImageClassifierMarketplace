/**
 * Stores what the current selected model is
 */

const selectedModel = (state = '', action) => {
    switch(action.type) {
        case 'CHANGE_SELECTED_MODEL':
            return action.selectedModel
        default:
            return state
    }
}

export default selectedModel