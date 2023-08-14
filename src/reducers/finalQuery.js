/**
 * Stores information about the search query when the user presses the search button
 */

const finalQuery = (state = null, action) => {
    switch(action.type) {
        case 'UPDATE_FINAL_QUERY':
            return action.finalQuery
        default:
            return state
    }
}

export default finalQuery