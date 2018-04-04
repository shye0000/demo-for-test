import React from 'react';
import {connect} from 'react-redux';
import Icon from 'antd/lib/icon';
import Dropdown from 'antd/lib/dropdown';
import './layout.scss';
import LogoutLink from './LogoutLink';
import Menu from 'antd/lib/menu';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

const mapStateToProps = (state) => {
	return {
		authData: state.user.data
	};
};

class AppUserMenu extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		const {authData} = this.props;

		return (
			<div className="app-user">
				<Dropdown overlay={
					<Menu className="app-user-menu">
						<Menu.Item disabled={true}>
							<EditableTransWrapper><Trans>Changer mon mot de passe</Trans></EditableTransWrapper>
						</Menu.Item>
						<Menu.Divider/>
						<Menu.Item>
							<LogoutLink/>
						</Menu.Item>
					</Menu>
				} trigger={['click']}>
					<div className="user-menu-title">
						<div
							className="avatar"
							style={{backgroundImage: `url(${AppConfig.apiEntryPoint}${authData.user_informations.avatar})`}}>
							{
								!authData.user_informations.avatar ?
									`${authData.user_informations.firstName.charAt(0)}${authData.user_informations.lastName.charAt(0)}`
									: null
							}
						</div>
						<div className="user-name">
							{`${authData.user_informations.firstName} ${authData.user_informations.lastName}`}
						</div>
						<Icon type="down"/>
					</div>
				</Dropdown>
			</div>
		);
	}
}

export default connect(mapStateToProps, null)(AppUserMenu);
