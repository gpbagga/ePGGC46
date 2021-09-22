import {createStore, applyMiddleware} from 'redux'
import rootReducer from './reducer/index'

import thunk from 'redux-thunk'

import {composeWithDevTools} from 'redux-devtools-extension'

const middlewares = [thunk]

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(...middlewares))
)

//Middleware comes in play when we want to debug Redux state or we want to know what
// is the current state

export default store