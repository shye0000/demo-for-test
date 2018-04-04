import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyVatRateModal from './ModifyVatRateModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		vatRate: null
	}

	getConfig = () => {
		const {ready, vatRate} = this.state;
		const {i18n} = this.props;

		if (ready && vatRate) {
			return {
				head: {
					title: vatRate.value,
					contents: [[]],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyVatRateModal width={750} vatRate={vatRate}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchVatRateData();
							}
						},
						requiredRights: [{uri: vatRate['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer ce taux de TVA?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								onOk: () => {
									apiClient.fetch(vatRate['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/vat_rates');
												notification['success']({
													message: i18n.t`Le taux de TVA a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`Le taux de TVA n'a pas été supprimé`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: vatRate['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchVatRateData() {
		let vatRate;
		this.setState({ready: false});
		const {vatRateId} = this.props.match.params;
		const vatRateResponse = await apiClient.fetch('/vat_rates/' + vatRateId).catch(() => this.setState({ready: true}));

		if (vatRateResponse && vatRateResponse.status === 200) {
			vatRate = vatRateResponse.json;

			this.setState({
				ready: true,
				vatRate
			});
		}
	}

	componentDidMount() {
		this.fetchVatRateData();
	}

	render() {
		const {ready, vatRate} = this.state;
		return (
			ready ?
				(
					vatRate ?
						<DashboardComp className="vat-rate-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le taux de TVA n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
