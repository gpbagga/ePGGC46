/**
 * NOTE- 
 * reducers are basically to maintain state of redux store
 */

import {SET_USER, IS_AUTHENTICATED} from '../action/action.types'

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    
}
//loading is there to indicate spinner on screen that onAuthStateChanged listening
//is listening to get authState 

export default (state = initialState, action) => {
    switch(action.type){
        case SET_USER:
            return {
                ...state,
                user: action.payload,
                loading: false,
            }

        case IS_AUTHENTICATED:
            return{
                ...state,
                isAuthenticated: action.payload,
                loading: false
            }

        default:
            return state; 
    }
}