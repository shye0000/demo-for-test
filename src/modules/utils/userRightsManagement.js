import {
	getUser,
	USER_RIGHTS,
	USER_DATA
} from 'wbc-components/lib/utils/JWTAuthentication/userSessionStorage';

const matchResourceUri = (uri, targetUris) => {
	let match = false;
	targetUris.forEach(targetUri => {
		const reg = new RegExp('^' + targetUri);
		if (uri.match(reg)) {
			match = true;
		}
	});
	return match;
};

const matchAction = (action, targetActions) => {
	action = action.toUpperCase();
	return targetActions.indexOf(action) > -1;
};

export const checkUserHasRole = (role) => {
	let hasRole = false;
	const currentUser = getUser();
	if (currentUser && currentUser[USER_DATA]) {
		const roles = currentUser[USER_DATA].roles;
		hasRole = roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN') || roles.includes(role);
	}
	return hasRole;
};

export const checkUserAdmin = () => {
	let isAdmin = false;
	const currentUser = getUser();
	if (currentUser && currentUser[USER_DATA]) {
		const roles = currentUser[USER_DATA].roles;
		isAdmin = roles.includes('ROLE_SUPER_ADMIN') || roles.includes('ROLE_ADMIN');
	}
	return isAdmin;
};

export const checkUserSuperAdmin = () => {
	let isAdmin = false;
	const currentUser = getUser();
	if (currentUser && currentUser[USER_DATA]) {
		const roles = currentUser[USER_DATA].roles;
		isAdmin = roles.includes('ROLE_SUPER_ADMIN');
	}
	return isAdmin;
};

export const checkUserHasRights = (requiredRights) => {
	let hasRights = true;
	const currentUser = getUser();
	if (requiredRights && requiredRights.length &&currentUser && currentUser[USER_RIGHTS]) {
		const userStrategies = currentUser[USER_RIGHTS];
		requiredRights.forEach(requiredRight => {
			let authorized = false;
			const uri = requiredRight.uri;
			const action = requiredRight.action;
			userStrategies.forEach(strategy => {
				const statements = strategy.statements;
				statements.forEach(statement => {
					if (!matchAction(action, statement.Action)) {
						return;
					}
					if (!matchResourceUri(uri, statement.Resources)) {
						return;
					}
					authorized = !!statement.Effect;
				});
			});
			hasRights = hasRights && authorized;
		});
	}
	return hasRights;
};