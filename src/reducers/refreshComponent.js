/**
 * Stores information about that last component that was refreshed, so the 
 * app knows where to navigate to after refresh
 */

import {strings} from '../constants/strings'

const refreshComponent = (state = strings.featuredModels, action) => {
    switch(action.type) {
        case 'UPDATE_REFRESH_COMPONENT':
            return action.refreshComponent
        default:
            return state
    }
}

export default refreshComponent