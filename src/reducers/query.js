/**
 * Stores information about the current search query for the marketplace
 */

const query = (state = null, action) => {
    switch(action.type) {
        case 'UPDATE_QUERY':
            return action.query
        default:
            return state
    }
}

export default query