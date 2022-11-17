const {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware
} = require('./dist/redux')
// {
//     __DO_NOT_USE__ActionTypes: {
//       INIT: '@@redux/INIT2.j.u.7.8.t',
//       REPLACE: '@@redux/REPLACEn.2.o.8.t.v',
//       PROBE_UNKNOWN_ACTION: [Function: PROBE_UNKNOWN_ACTION]
//     },
//     applyMiddleware: [Function: applyMiddleware],
//     bindActionCreators: [Function: bindActionCreators],
//     combineReducers: [Function: combineReducers],
//     compose: [Function: compose],
//     createStore: [Function: createStore]
//   }
const reducers = combineReducers({
  box: (state = { count: 0 }, action) => {
    switch (action.type) {
      case 'box_increase':
        return { ...state, count: state.count + 1 }
      case 'box_decrease':
        return { ...state, count: state.count - 1 }
      default:
        return state
    }
  },
  todo: (state = { list: [] }, action) => {
    switch (action.type) {
      case 'todo_add':
        return { ...state, list: [...state.list, action.payload] }
      case 'todo_remove':
        return {
          ...state,
          list: state.list.filter(item => item === action.payload)
        }
      default:
        return state
    }
  }
})
const initialState = {
  box: {
    count: 0
  },
  todo: {
    list: ['a']
  }
}

const logger =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // redux-logger git hub: https://github.com/LogRocket/redux-logger
    //Note: logger must be the last middleware in chain, otherwise it will log thunk and promise, not actual actions (#20).
    console.log(`before action: ${action.type}: ${JSON.stringify(getState())}`)
    next(action)
    console.log(`after action: ${action.type}: ${JSON.stringify(getState())}`)
    console.log('===============')
  }

const createThunkMiddleware = extraArgument => {
  //redux-thunk git hub: https://github.com/reduxjs/redux-thunk/blob/master/src/index.ts
  const middleware =
    ({ dispatch, getState }) =>
    next =>
    action => {
      // The thunk middleware looks for any functions that were passed to `store.dispatch`.
      // If this "action" is really a function, call it and return the result.
      if (typeof action === 'function') {
        // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
        return action(dispatch, getState, extraArgument)
      }

      // Otherwise, pass the action down the middleware chain as usual
      return next(action)
    }
  return middleware
}

const enhancer = applyMiddleware(createThunkMiddleware(), logger)

const store = createStore(reducers, initialState, enhancer)

const listener = () => {
  console.log(store.getState())
}
const unSubscribe = store.subscribe(listener)

const actions = bindActionCreators(
  {
    increase: () => ({ type: 'box_increase' }),
    add: () => ({ type: 'todo_add', payload: 'b' }),
    remove: () => ({ type: 'todo_remove', payload: 'a' }),
    thunkAction: () => (dispatch, getState, extraArgument) => {
      setTimeout(() => {
        dispatch({ type: 'todo_add', payload: 'thunkAction' })
      }, 1000)
    }
  },
  store.dispatch
)

actions.increase()
actions.add()
unSubscribe()
actions.remove()

actions.thunkAction()
