import React from 'react';
import moment from 'moment';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyUserModal from './ModifyUserModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		user: null,
		groups: null
	}

	getConfig = () => {
		const {ready, user, groups} = this.state;
		const {i18n} = this.props;

		if (ready && user) {
			return {
				head: {
					title: user.employee.firstName + ' ' + user.employee.lastName,
					contents: [[
						{
							label: <EditableTransWrapper><Trans>Email</Trans></EditableTransWrapper>,
							value: user.email
						},
						{
							label: <EditableTransWrapper><Trans>Ajouté le</Trans></EditableTransWrapper>,
							value: user.createdAt ? moment(user.createdAt).format('L') : null
						}
					], [
						{
							label: <EditableTransWrapper><Trans>Rôle(s)</Trans></EditableTransWrapper>,
							value: groups.map((group) => group.label).join(', ')
						}
					], []
					],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyUserModal width={750} user={user}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchUserData();
							}
						},
						requiredRights: [{uri: user['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer cet utilisateur?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								onOk: () => {
									apiClient.fetch(user['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/users');
												notification['success']({
													message: i18n.t`L'utilisateur a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`L'utilisateur user n'a pas été supprimé`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: user['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchUserData() {
		let user, groups = [];
		this.setState({ready: false});
		const {userId} = this.props.match.params;
		const userResponse = await apiClient.fetch('/users/' + userId).catch(() => this.setState({ready: true}));

		if (userResponse && userResponse.status === 200) {
			user = userResponse.json;
			const userGroups = user.groups;

			for (let i = 0; i < userGroups.length; i++) {
				const groupResponse = await apiClient.fetch(userGroups[i]['@id']).catch(() => this.setState({ready: true}));

				if (groupResponse.status === 200) {
					groups.push(groupResponse.json);
				}
			}

			this.setState({
				ready: true,
				user: user,
				groups: groups
			});
		}
	}

	componentDidMount() {
		this.fetchUserData();
	}

	render() {
		const {ready, user} = this.state;
		return (
			ready ?
				(
					user ?
						<DashboardComp className="user-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'L\'utilisateur n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
