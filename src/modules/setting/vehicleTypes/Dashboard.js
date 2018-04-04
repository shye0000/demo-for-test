import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyVehicleTypeModal from './ModifyVehicleTypeModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		vehicleType: null
	}

	getConfig = () => {
		const {ready, vehicleType} = this.state;
		const {i18n} = this.props;

		if (ready && vehicleType) {
			return {
				head: {
					title: vehicleType.label,
					contents: [[]],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyVehicleTypeModal width={750} vehicleType={vehicleType}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchVehicleTypeData();
							}
						},
						requiredRights: [{uri: vehicleType['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer ce type de véhicule?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								width: 450,
								onOk: () => {
									apiClient.fetch(vehicleType['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/vehicle_types');
												notification['success']({
													message: i18n.t`Le type de véhicule a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`Le type de véhicule n'a pas été supprimé`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: vehicleType['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchVehicleTypeData() {
		let vehicleType;
		this.setState({ready: false});
		const {vehicleTypeId} = this.props.match.params;
		const vehicleTypeResponse = await apiClient.fetch('/vehicle_types/' + vehicleTypeId).catch(() => this.setState({ready: true}));

		if (vehicleTypeResponse && vehicleTypeResponse.status === 200) {
			vehicleType = vehicleTypeResponse.json;

			this.setState({
				ready: true,
				vehicleType
			});
		}
	}

	componentDidMount() {
		this.fetchVehicleTypeData();
	}

	render() {
		const {ready, vehicleType} = this.state;
		return (
			ready ?
				(
					vehicleType ?
						<DashboardComp className="vehicle-type-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le type de véhicule n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
