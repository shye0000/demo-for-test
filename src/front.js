import React from 'react';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import {checkUserTokenValid} from 'wbc-components/lib/utils/JWTAuthentication/userSessionStorage';
import {loginSuccess} from 'wbc-components/lib/utils/JWTAuthentication/redux/actions';
import { AppContainer } from 'react-hot-loader';
import './apiClient';
import routes from './routes';
import App from './App';
import appStore from './redux/store';

// create the redux router middleware
const history = createBrowserHistory();

if (checkUserTokenValid()) {
	appStore.dispatch(loginSuccess());
}

const render = Component => {
	ReactDOM.hydrate(
		<AppContainer>
			<Component store={appStore} routes={routes} history={history}/>
		</AppContainer>,
		document.getElementById('main')
	);
};

render(App);

if (module.hot) {
	module.hot.accept('./App', () => {
		const nextApp = require('./App').default;
		render(nextApp) ;
	});
}
