import {routerReducer} from 'react-router-redux';
import {reducer as routeDispatcherReducer} from 'react-router-dispatcher';
import authReducers from 'wbc-components/lib/utils/JWTAuthentication/redux/reducers';
import {reducers as translationsReducers} from 'wbc-components/lib/Translations';


const appReducers = {
	user: authReducers,
	trans: translationsReducers,
	router: routerReducer,
	routeDispatcher: routeDispatcherReducer
};

export default appReducers;