/**
 * Stores the state of the refernce to the current users firestore doc
 */

const userReference = (state = null, action) => {
    switch(action.type) {
        case 'UPDATE_USER_REFERENCE':
            return action.userReference
        default:
            return state
    }
}

export default userReference