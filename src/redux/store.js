import {createStore as _createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {routerMiddleware} from 'react-router-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import appReducers from './reducers';
import Registry from 'wbc-components/lib/utils/CodeSplitting/store/registry/registry';
import registryMiddleware from 'wbc-components/lib/utils/CodeSplitting/store/registry/middleware';

function createStore(history, initialState = {}) {

	const reduxRouterMiddleware = routerMiddleware(history);
	const registry = new Registry(appReducers);
	let finalCreateStore = applyMiddleware(
		registryMiddleware(registry),
		reduxRouterMiddleware,
		thunkMiddleware
	);

	// if we have redux devtools installed hook into it.
	if (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
		finalCreateStore = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(finalCreateStore);
	}

	const store = finalCreateStore(_createStore)(
		registry.initialReducers,
		initialState
	);

	registry.store = store;

	return store;
}

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

// create the redux router middleware
const history = createBrowserHistory();

const appStore = createStore(history, preloadedState);
export default appStore;

