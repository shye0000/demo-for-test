import React from 'react';
import {connect} from 'react-redux';
import {renderRoutes} from 'react-router-config';
import Layout from 'antd/lib/layout';
import Icon from 'antd/lib/icon';
import  {actions} from 'wbc-components/lib/Translations';
import './layout.scss';
import Navigation from './Navigation.js';
// import Button from 'antd/lib/button';
// import classNames from 'classnames';
import AppUserMenu from './AppUserMenu';
import AppName from './AppName';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
// import {checkUserAdmin} from './modules/utils/userRightsManagement';

const mapStateToProps = (state) => {
	return {
		editTranslationsInlineActive: state.trans.activeEditTranslationInline
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		handleToggleEditTranslations: (activeEditTranslationInline) => {
			dispatch(actions.toggleEditTranslationInline(activeEditTranslationInline));
		}
	};
};

class LayoutComponent extends React.Component {

	state = { mainMenuCollapsed: true }

	toggleMainMenu = () => {
		this.setState({
			mainMenuCollapsed: !this.state.mainMenuCollapsed,
		});
	};

	toggleEditTranslationsInline = () => {
		this.props.handleToggleEditTranslations(!this.props.editTranslationsInlineActive);
	};

	componentWillReceiveProps() {
		if (typeof window !== 'undefined') {
			window.hasPreviousLocation = !!window.previousLocation;
			window.previousLocation = this.props.location;
		}
	}

	render() {
		const { Header, Sider, Content } = Layout;
		const {mainMenuCollapsed} = this.state;

		return (
			<div className="app-container">
				<Layout className="app-main">
					<Sider
						expanding="true"
						className="app-side-menu"
						width={280}
						collapsedWidth={70}
						collapsed={mainMenuCollapsed}>
						{
							!mainMenuCollapsed ?
								<div className="side-menu-focus" onClick={this.toggleMainMenu}/> : null
						}
						<div className="menu-toggle-trigger" onClick={this.toggleMainMenu}>
							<div className="app-name">
								<IconSvg type={import('../icons/QHS.svg')}/>
							</div>
							<Icon type="menu-fold"/>
						</div>
						<Navigation />
					</Sider>
					<div className="app-body">
						<div className="app-header">
							<Layout className="app-header-layout">
								<Header className="app-header-div">
									<AppName />
									<div className="app-right">
										{
											// checkUserAdmin() ?
											// 	<div className="edit-translation-trigger">
											// 		<Button
											// 			className={classNames({'edit-translation-active': this.props.editTranslationsInlineActive})}
											// 			onClick={this.toggleEditTranslationsInline} size="small" style={{padding: '0 8px'}}>
											// 			<Icon id="app-edit-icon" type="edit" />
											// 		</Button>
											// 	</div> : null
										}
										<AppUserMenu/>
									</div>
								</Header>
							</Layout>
						</div>
						<Layout className="page-content-wrapper">
							<Content className="page-content">
								{renderRoutes(this.props.route.routes)}
							</Content>
						</Layout>
					</div>
				</Layout>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutComponent);
