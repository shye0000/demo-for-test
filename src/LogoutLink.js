import React from 'react';
import {connect} from 'react-redux';
import {logout} from 'wbc-components/lib/utils/JWTAuthentication/redux/actions';
import {userIsAuthenticated} from 'wbc-components/lib/utils/JWTAuthentication/auth';
import {toggleEditTranslationInline} from 'wbc-components/lib/Translations/redux/actions';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './LogoutLink.scss';

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => {
			dispatch(toggleEditTranslationInline(false));
			dispatch(logout());
		}
	};
};

const LogoutComponent = connect(null, mapDispatchToProps)((props) => {
	return <div onClick={() => props.logout()} className="logout-link">
		<EditableTransWrapper><Trans>Déconnexion</Trans></EditableTransWrapper>
	</div>;
});

const LogoutLink = userIsAuthenticated(LogoutComponent);

export default LogoutLink;