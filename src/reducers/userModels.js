/**
 * Stores what models the current user has made
 */

const userModels = (state = [], action) => {
    switch(action.type) {
        case 'UPDATE_USER_MODELS':
            return action.userModels
        default:
            return state
    }
}

export default userModels