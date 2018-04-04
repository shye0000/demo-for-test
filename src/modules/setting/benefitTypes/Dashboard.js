import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyBenefitTypeModal from './ModifyBenefitTypeModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		benefitType: null,
		service: null,
		requiredSkills: null
	}

	getConfig = () => {
		const {ready, benefitType, service, requiredSkills} = this.state;
		const {i18n} = this.props;

		if (ready && benefitType) {
			let config = {
				head: {
					title: benefitType.publicTitle,
					contents: [
						[{
							label: <EditableTransWrapper><Trans>Titre interne</Trans></EditableTransWrapper>,
							value: benefitType.internalTitle
						}, {
							label: <EditableTransWrapper><Trans>Couleur</Trans></EditableTransWrapper>,
							value: <div className='calendar-color' style={{backgroundColor: benefitType.color}}/>
						}, {
							label: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
							value: service.label
						}], [{
							label: <EditableTransWrapper><Trans>Compétences requises</Trans></EditableTransWrapper>,
							value: requiredSkills.map((requiredSkill) => requiredSkill.label).join(', ')
						}], []

					],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyBenefitTypeModal width={750} benefitType={benefitType}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchBenefitTypeData();
							}
						},
						requiredRights: [{uri: benefitType['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer ce type de prestation?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								width: 450,
								onOk: () => {
									apiClient.fetch(benefitType['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/benefit_types');
												notification['success']({
													message: i18n.t`Le type de prestation a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`Le type de prestation n'a pas été supprimé car il est utilisé dans un contrat`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: benefitType['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};

			if (!benefitType.isAdministrable) {
				delete config.head.actions;
			}

			return config;
		}

		return null;
	}

	async fetchBenefitTypeData() {
		let benefitType, requiredSkills = [];
		this.setState({ready: false});
		const {benefitTypeId} = this.props.match.params;
		const benefitTypeResponse = await apiClient.fetch('/benefit_types/' + benefitTypeId).catch(() => this.setState({ready: true}));

		if (benefitTypeResponse && benefitTypeResponse.status === 200) {
			benefitType = benefitTypeResponse.json;
			let service = benefitType.service;
			const benefitTypeRequiredSkills = benefitType.requiredSkills;

			const serviceResponse = await apiClient.fetch(service['@id']).catch(() => this.setState({ready: true}));
			if (serviceResponse.status === 200) {
				service = serviceResponse.json;
			}
			for (let i = 0; i < benefitTypeRequiredSkills.length; i++) {
				const requiredSkillsResponse = await apiClient.fetch(benefitTypeRequiredSkills[i]).catch(() => this.setState({ready: true}));

				if (requiredSkillsResponse.status === 200) {
					requiredSkills.push(requiredSkillsResponse.json);
				}
			}

			this.setState({
				ready: true,
				benefitType,
				service,
				requiredSkills
			});
		}
	}

	componentDidMount() {
		this.fetchBenefitTypeData();
	}

	render() {
		const {ready, benefitType} = this.state;
		return (
			ready ?
				(
					benefitType ?
						<DashboardComp className="benefit-type-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le type de prestation n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
