import React from 'react';
import {withRouter, Link} from 'react-router-dom';
import classNames from 'classnames';
import Tree from 'antd/lib/tree';
import Spin from 'antd/lib/spin';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import apiClient from '../../apiClient';
import './SplitView.scss';
import './HierarchyTree.scss';
import {connect} from 'react-redux';
import {HIERARCHY_UPDATED} from './redux/actions';
import actions from './redux/actions';

const mapStateToProps = (state) => {
	return {
		updateHierarchy: state.divisions.updateHierarchy
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		hierarchyUpdated: () => {
			dispatch(actions[HIERARCHY_UPDATED]());
		}
	};
};

class HierarchyTree extends React.Component {

	state = {
		ready: false,
		divisionHierarchy: null
	}

	divisionIcons = {
		org:    <IconSvg type={import('../../../icons/organisation.svg')}/>,
		subOrg: <IconSvg type={import('../../../icons/sous-organisation.svg')}/>,
		site:   <IconSvg type={import('../../../icons/environment-o.svg')}/>,
		zone:   <IconSvg type={import('../../../icons/zone.svg')}/>
	};

	getDivisionIcon = (type) => {
		return this.divisionIcons[type];
	}

	getRouteUrl = (type, hierarchy, parentOrgId) => {
		switch (type) {
			case 'org':
			case 'subOrg':
				return '/divisions/split/' + hierarchy.id;
			case 'site':
			case 'zone':
				return '/divisions/split/' + parentOrgId + '/' + hierarchy.id;
		}
	}

	generateHierarchyTree = (hierarchy, type, parentTreeNodeKey, parentOrgId, level) => {

		const TreeNode = Tree.TreeNode;

		level = level || 0;

		let icon, routeUrl, hasChildren, orgId, isCurrentDivision;

		// define division type
		type = type || 'org';

		// define icon for division
		icon = this.getDivisionIcon(type);

		// generate division route url
		routeUrl = this.getRouteUrl(type, hierarchy, parentOrgId);

		// check whether current hierarchy has children
		hasChildren = hierarchy.subOrganisations || hierarchy.sites || hierarchy.zones;

		// check whether is current shown division
		isCurrentDivision = this.props.location.pathname === routeUrl;

		// define the organisation id to be passed to children
		orgId = hierarchy.id;
		if (type === 'site') {
			orgId = parentOrgId;
		}

		// if has children, call self for each child to generate and return the sub hierarchy tree
		if (hasChildren) {

			return <TreeNode className={classNames({'active': isCurrentDivision})} key={routeUrl} title={
				<Link style={{marginLeft: level*30 + 'px'}} onClick={ev => ev.stopPropagation()} to={routeUrl}>
					{icon}
					<span title={hierarchy.name}>{hierarchy.name}</span>
				</Link>
			}>
				{
					hierarchy.subOrganisations ?
						hierarchy.subOrganisations.map((subOrganisation) => {
							return this.generateHierarchyTree(subOrganisation, 'subOrg', routeUrl, null, level + 1);
						})
						: null
				}
				{
					hierarchy.sites ?
						hierarchy.sites.map((site) => {
							return this.generateHierarchyTree(site, 'site', routeUrl, orgId, level + 1);
						})
						: null
				}
				{
					hierarchy.zones ?
						hierarchy.zones.map((zone) => {
							return this.generateHierarchyTree(zone, 'zone', routeUrl, orgId, level + 1);
						})
						: null
				}
			</TreeNode>;
		}

		// if has no child return a final level tree item
		return <TreeNode
			isLeaf={true} className={classNames({'active': isCurrentDivision})}
			key={routeUrl} title={
				<Link style={{marginLeft: (level + 1)*30 + 'px'}} to={routeUrl}>
					{icon}
					<span title={hierarchy.name}>{hierarchy.name}</span>
				</Link>
			} />;
	}

	async fetchDivisionHierarchyData() {
		let divisionHierarchy;
		this.setState({ready: false});
		const {divisionId} =  this.props;
		const divisionHierarchyResponse = await apiClient.fetch('/divisions/' + divisionId + '/hierarchy').catch(
			() => this.setState({ready: true})
		);
		if (divisionHierarchyResponse && divisionHierarchyResponse.status === 200) {
			divisionHierarchy = divisionHierarchyResponse.json;
			this.setState({
				ready: true,
				divisionHierarchy
			}, () => {this.props.hierarchyUpdated();});
		}
	}

	componentDidMount() {
		this.fetchDivisionHierarchyData();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.updateHierarchy) {
			this.fetchDivisionHierarchyData();
		}
	}

	render() {
		const {ready, divisionHierarchy} = this.state;

		if (!ready) {
			return <Spin className="centered-spin" size="large" />;
		}

		else if (!divisionHierarchy) {
			return <div className="empty-tag">
				<EditableTransWrapper><Trans>{'Aucune organisation'}</Trans></EditableTransWrapper>
			</div>;
		}

		const hierarchyTree = this.generateHierarchyTree(divisionHierarchy);
		return <div className="divisions-hierarchy">
			<Tree
				defaultExpandAll={true}
				selectedKeys={[this.props.location.pathname]}
				className="hierarchy-tree">
				{hierarchyTree}
			</Tree>
		</div>;
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HierarchyTree));
