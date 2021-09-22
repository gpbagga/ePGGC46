// we made this file just to wrap whole App component in Provider which has prop 
// = store
import React from 'react'
import store from './store'
import {Provider} from 'react-redux'
import App from './App'

const RootApp = () =>{
  return(
    <Provider store = {store}>
        <App/>
    </Provider>
  )
}

export default RootApp