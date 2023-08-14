/**
 * Stores the state of the current user
 */

const user = (state = {email:''}, action) => {
    switch(action.type) {
        case 'UPDATE_USER':
            return action.user
        default:
            return state
    }
}

export default user