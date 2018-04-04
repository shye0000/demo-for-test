import React from 'react';
import {withRouter, NavLink} from 'react-router-dom';
import Menu from 'antd/lib/menu';
import Icon from 'antd/lib/icon';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import {checkUserHasRights} from './modules/utils/userRightsManagement';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import { matchPath } from 'react-router';
import routes from './routes';
import './Navigation.scss';

class Navigation extends React.Component {

	getCurrentSelectedKeys(matchedRoutes, routes) {
		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];
			let matchConfig = {
				path: route.path
			};
			if (route.path === '/') {
				matchConfig.exact = true;
			}
			if (matchPath(this.props.location.pathname, matchConfig) && route.path !== '/*') {
				matchedRoutes.push(route.path);
			}
			if (route.routes) {
				this.getCurrentSelectedKeys(matchedRoutes, route.routes);
			}
		}
	}

	render () {
		const selectedKeys = [];
		this.getCurrentSelectedKeys(selectedKeys, routes);
		return (
			<Menu
				selectedKeys={selectedKeys}
				id="navigation"
				mode="inline"
				theme="light"
				defaultOpenKeys={['subNav']}>
				<Menu.Item key="/">
					<NavLink to="/">
						<Icon className="nav-icon" type="home" />
						<span><EditableTransWrapper><Trans>Accueil</Trans></EditableTransWrapper></span>
					</NavLink>
				</Menu.Item>
				{/* todo */}
				<Menu.SubMenu className="sub-menu-qhs" key="clients" title={
					<span>
						<Icon className="nav-icon" type="contacts" />
						<span><EditableTransWrapper><Trans>Clients</Trans></EditableTransWrapper></span>
					</span>
				}>
					<Menu.Item key="/divisions">
						<NavLink to="/divisions">
							<span><EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item key="/sites">
						<NavLink to="/sites">
							<span><Trans>Sites</Trans></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/contacts"
						disabled={!checkUserHasRights([{uri: '/contacts', action: 'GET'}])}>
						<NavLink to="/contacts">
							<span><EditableTransWrapper><Trans>Salariés tiers</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
				</Menu.SubMenu>
				<Menu.SubMenu className="sub-menu-qhs" key="contracts" title={
					<span>
						<Icon className="nav-icon" type="copy" />
						<span><EditableTransWrapper><Trans>Contrats et devis</Trans></EditableTransWrapper></span>
					</span>
				}>
					<Menu.Item key="/contracts/list">
						<NavLink to="/contracts/list">
							<span><EditableTransWrapper><Trans>Contrats et devis</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item key="/validations" disabled={true}>
						<NavLink to="/">
							<span><EditableTransWrapper><Trans>Validation des dossiers</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item key="/contracts/emergencies">
						<NavLink to="/contracts/emergencies">
							<span><EditableTransWrapper><Trans>Urgences</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
				</Menu.SubMenu>

				<Menu.SubMenu className="sub-menu-qhs" key="calendar" title={
					<span>
						<Icon className="nav-icon" type="calendar" />
						<span><EditableTransWrapper><Trans>Calendrier des services</Trans></EditableTransWrapper></span>
					</span>
				}>
					<Menu.Item
						key="/calendar"
						disabled={!checkUserHasRights([{uri: '/scheduler', action: 'GET'}])}>
						<NavLink to="/scheduler">
							<span><EditableTransWrapper><Trans>Calendrier des services</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/interventions"
						disabled={!checkUserHasRights([{uri: '/interventions', action: 'GET'}])}>
						<NavLink to="/interventions">
							<span><EditableTransWrapper><Trans>Interventions</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/operations"
						disabled={!checkUserHasRights([{uri: '/operations', action: 'GET'}])}>
						<NavLink to="/operations">
							<span><EditableTransWrapper><Trans>Interventions à programmer</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
				</Menu.SubMenu>

				<Menu.SubMenu className="sub-menu-qhs" key="car" title={
					<span>
						<Icon className="nav-icon" type="car" />
						<span><EditableTransWrapper><Trans>Salariés et véhicules</Trans></EditableTransWrapper></span>
					</span>
				}>
					<Menu.Item
						key="/employees"
						disabled={!checkUserHasRights([{uri: '/employees', action: 'GET'}])}>
						<NavLink to="/employees">
							<span><EditableTransWrapper><Trans>Salariés</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/vehicles"
						disabled={!checkUserHasRights([{uri: '/vehicles', action: 'GET'}])}>
						<NavLink to="/vehicles">
							<span><EditableTransWrapper><Trans>Véhicules</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
				</Menu.SubMenu>
				<Menu.Item key="/solution">
					<NavLink to="/solution">
						<IconSvg className="nav-icon" type={import('../icons/euro.svg')}/>
						<span><EditableTransWrapper><Trans>Facturation</Trans></EditableTransWrapper></span>
					</NavLink>
				</Menu.Item>

				{/* TODO a supprimer pour activer les anomalies */}
				<Menu.Item key="/1">
					<NavLink to="/1">
						<Icon className="nav-icon" type="warning" />
						<span><EditableTransWrapper><Trans>Anomalies</Trans></EditableTransWrapper></span>
					</NavLink>
				</Menu.Item>
				{/* TODO Fin du bloc à supprimer */}

				{/* TODO a décommenter le bloc en dessous pour activer les anomalies + ajouter key & navLink*/}
				{/*<Menu.SubMenu className="sub-menu-qhs" key="anomaly" title={*/}
				{/*<span>*/}
				{/*<Icon className="nav-icon" type="warning" />*/}
				{/*<span><EditableTransWrapper><Trans>Anomalies</Trans></EditableTransWrapper></span>*/}
				{/*</span>*/}
				{/*}>*/}
				{/*<Menu.Item key="/1">*/}
				{/*<NavLink to="/1">*/}
				{/*<span><EditableTransWrapper><Trans>Anomalies administratives</Trans></EditableTransWrapper></span>*/}
				{/*</NavLink>*/}
				{/*</Menu.Item>*/}
				{/*<Menu.Item key="/2">*/}
				{/*<NavLink to="/2">*/}
				{/*<span><EditableTransWrapper><Trans>{'Anomalies D\'exploitation'}</Trans></EditableTransWrapper></span>*/}
				{/*</NavLink>*/}
				{/*</Menu.Item>*/}
				{/*</Menu.SubMenu>*/}

				{/* TODO a supprimer pour activer les parametres */}
				<Menu.SubMenu className="sub-menu-qhs" key="setting" title={
					<span>
						<Icon className="nav-icon" type="setting" />
						<span><EditableTransWrapper><Trans>Paramètres</Trans></EditableTransWrapper></span>
					</span>
				}>
					<Menu.Item
						key="/users"
						disabled={!checkUserHasRights([{uri: '/users', action: 'GET'}])}>
						<NavLink to="/users">
							<span><EditableTransWrapper><Trans>Utilisateurs</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/benefit_types"
						disabled={!checkUserHasRights([{uri: '/benefit_types', action: 'GET'}])}>
						<NavLink to="/benefit_types">
							<span><EditableTransWrapper><Trans>Types de prestation</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/product_types"
						disabled={!checkUserHasRights([{uri: '/product_types', action: 'GET'}])}>
						<NavLink to="/product_types">
							<span><EditableTransWrapper><Trans>Types de produit</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/skills"
						disabled={!checkUserHasRights([{uri: '/skills', action: 'GET'}])}>
						<NavLink to="/skills">
							<span><EditableTransWrapper><Trans>Compétences</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/vat_rates"
						disabled={!checkUserHasRights([{uri: '/vat_rates', action: 'GET'}])}>
						<NavLink to="/vat_rates">
							<span><EditableTransWrapper><Trans>Taux de TVA</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/vehicle_types"
						disabled={!checkUserHasRights([{uri: '/vehicle_types', action: 'GET'}])}>
						<NavLink to="/vehicle_types">
							<span><EditableTransWrapper><Trans>Types de véhicule</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
					<Menu.Item
						key="/invoices_due_date_days/1"
						disabled={!checkUserHasRights([{uri: '/invoices_due_date_days/1', action: 'GET'}])}>
						<NavLink to="/invoices_due_date_days/1">
							<span><EditableTransWrapper><Trans>Echéance par défaut des factures</Trans></EditableTransWrapper></span>
						</NavLink>
					</Menu.Item>
				</Menu.SubMenu>

				{/* TODO a décommenter le bloc en dessous pour activer les parametres */}

				{/*<Menu.SubMenu className="sub-menu-qhs" key="tool" title={*/}
				{/*<span>*/}
				{/*<Icon className="nav-icon" type="setting" />*/}
				{/*<span><EditableTransWrapper><Trans>Paramètres</Trans></EditableTransWrapper></span>*/}
				{/*</span>*/}
				{/*}>*/}
				{/*<Menu.Item*/}
				{/*key="/translation_management"*/}
				{/*disabled={!checkUserAdmin()}>*/}
				{/*<NavLink to="/translation_management">*/}
				{/*<span><EditableTransWrapper><Trans>Traductions</Trans></EditableTransWrapper></span>*/}
				{/*</NavLink>*/}
				{/*</Menu.Item>*/}
				{/*</Menu.SubMenu>*/}
			</Menu>
		);
	}
}

export default withRouter(Navigation);
