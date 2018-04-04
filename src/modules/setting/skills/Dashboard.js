import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifySkillModal from './ModifySkillModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		skill: null
	}

	getConfig = () => {
		const {ready, skill} = this.state;
		const {i18n} = this.props;

		if (ready && skill) {
			return {
				head: {
					title: skill.label,
					contents: [[]],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifySkillModal width={750} skill={skill}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchSkillData();
							}
						},
						requiredRights: [{uri: skill['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer cette compétence?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								onOk: () => {
									apiClient.fetch(skill['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/skills');
												notification['success']({
													message: i18n.t`La compétence a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`La compétence n'a pas été supprimé`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: skill['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchSkillData() {
		let skill;
		this.setState({ready: false});
		const {skillId} = this.props.match.params;
		const skillResponse = await apiClient.fetch('/skills/' + skillId).catch(() => this.setState({ready: true}));

		if (skillResponse && skillResponse.status === 200) {
			skill = skillResponse.json;

			this.setState({
				ready: true,
				skill
			});
		}
	}

	componentDidMount() {
		this.fetchSkillData();
	}

	render() {
		const {ready, skill} = this.state;
		return (
			ready ?
				(
					skill ?
						<DashboardComp className="skill-type-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'La compétence n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
