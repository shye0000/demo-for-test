import ApiClient, {
	API_ENTRY_POINT,
	APP_STORE,
	REQUEST_RUNNER,
	CHECK_USER_AUTH,
	ADD_USER_AUTH_INFO_TO_REQUEST_OPTIONS,
	USER_AUTH_NOT_VALID_CALLBACK,
	LOGIN_CHECK,
	FILE_ENTRY_POINT
} from 'wbc-components/lib/utils/ApiClient';
import fetchHydra from 'wbc-components/lib/utils/hydra';
import {
	checkUserTokenValid,
	addUserTokenToRequestOptions,
} from 'wbc-components/lib/utils/JWTAuthentication/userSessionStorage';
import {refreshToken, login} from 'wbc-components/lib/utils/JWTAuthentication/redux/actions';
import appStore from './redux/store';


const userAuthCallOptions = {
	method: 'POST',
	headers: new Headers({
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded'
	})
};
const fetchUserRightsConfig = {
	endPoint: AppConfig.apiEntryPoint + '/users/me/rights',
	options: {
		method: 'GET',
		headers: new Headers({
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		})
	}
};

const apiClient = new ApiClient({
	[API_ENTRY_POINT]: AppConfig.apiEntryPoint,
	[APP_STORE]: appStore,
	[REQUEST_RUNNER]: fetchHydra,
	[CHECK_USER_AUTH]: checkUserTokenValid,
	[ADD_USER_AUTH_INFO_TO_REQUEST_OPTIONS]: addUserTokenToRequestOptions,
	[USER_AUTH_NOT_VALID_CALLBACK]: refreshToken({
		config: {
			endPoint: AppConfig.apiEntryPoint + '/token/refresh',
			options: userAuthCallOptions,
			extraData: {from: 1}
		},
		fetchUserRightsConfig
	}),
	[LOGIN_CHECK]: login({
		config: {
			endPoint: AppConfig.apiEntryPoint + '/login_check',
			options: userAuthCallOptions,
			extraData: {from: 1}
		},
		fetchUserRightsConfig
	}),
	[FILE_ENTRY_POINT]: 'files/upload'
});

export default apiClient;