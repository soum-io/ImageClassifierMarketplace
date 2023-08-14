/**
 * Main reducer for redux
 */

import {combineReducers} from 'redux'
import selectedModel from './selectedModel'
import user from './user'
import cloudModels from './cloudModels'
import userModels from './userModels'
import downloadedModels from './downloadedModels'
import refreshComponent from './refreshComponent'
import query from './query'
import finalQuery from './finalQuery'
import userReference from './userReference'

const appReducer = combineReducers({
    selectedModel,
    user,
    cloudModels,
    userModels,
    downloadedModels,
    refreshComponent,
    query,
    finalQuery,
    userReference
})

 export default (state, action) => {
    if (action.type === 'USER_LOGOUT') {
      state = undefined
    }
    return appReducer(state, action)
  }