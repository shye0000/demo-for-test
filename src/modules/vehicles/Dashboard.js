import React from 'react';
import moment from 'moment';
import DashboardComp from '../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import apiClient from '../../apiClient';
import Unavailability from './dashboardBoxes/Unavailability';
import AddUnavailabilityModal from './AddUnavailabilityModal';
import Documents from '../../components/dashboardBoxes/Documents';
import AddDocumentModal from '../../components/dashboardBoxes/AddDocumentModal';
import ModifyVehicleModal from './ModifyVehicleModal';
import {Trans} from 'lingui-react';
import {Link} from 'react-router-dom';
import Tag from '../../components/tag/Tag';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Dashboard.scss';


class Dashboard extends React.Component {

	state = {
		ready: false,
		vehicle: null,
		services: null,
		technicians: null,
	}

	getActivity = () => {
		const {vehicle} = this.state;
		const today = moment();

		if (!vehicle.removedOn || moment(vehicle.removedOn) > today)
			return <Tag label="En service" checked/>;
		else
			return <Tag label="Hors service" error/>;
	}

	getPhotoIcon = () => {
		return <div className="vehicle-icon-wrapper">
			<IconSvg className="vehicle-icon" type={import('../../../icons/car.svg')}/>
		</div>;
	}

	getConfig = () => {
		const {ready, vehicle, services, technicians} = this.state;

		if (ready && vehicle) {
			return {
				head: {
					title: vehicle.plate,
					subTitle: this.getActivity(),
					photoComponent: this.getPhotoIcon(),
					contents: [
						[{
							label: <EditableTransWrapper><Trans>Type</Trans></EditableTransWrapper>,
							value: vehicle.vehicleType.label
						}, {
							label: <EditableTransWrapper><Trans>Nom court</Trans></EditableTransWrapper>,
							value: vehicle.name
						}, {
							label: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
							value: services
						}], [{
							label: <EditableTransWrapper><Trans>Techniciens par défaut</Trans></EditableTransWrapper>,
							value: technicians.map((technician, idx) => {
								return <Link key={idx} className="" to={technician['@id']}>
									{technician.firstName + ' ' + technician.lastName + (idx!==technicians.length-1? ', ' : '')}
								</Link>;
							})
						}, {
							label: <EditableTransWrapper><Trans>Couleur dans le calendrier</Trans></EditableTransWrapper>,
							value: <div className='calendar-color' style={{backgroundColor: vehicle.colorCalendar}}/>
						}], []

					],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyVehicleModal width={750} vehicle={vehicle}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchVehicleData();
							}
						},
						requiredRights: [{uri: vehicle['@id'], action: 'PUT'}]
					}]
				},
				body: {
					boxes: [{
						id: 'unavailability',
						title: <EditableTransWrapper><Trans>Indisponibilités</Trans></EditableTransWrapper>,
						icon: <IconSvg type={import('../../../icons/car-delete.svg')}/>,
						actions: [{
							id: 'addUnavailability',
							title: <EditableTransWrapper><Trans>Ajouter une indisponibilité</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddUnavailabilityModal vehicle={vehicle}/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchVehicleData();
								}
							},
							requiredRights: [{uri: '/vehicle_unavailabilities', action: 'POST'}]
						}],
						content: <Unavailability vehicle={vehicle}/>,
						requiredRights: [{uri: '/vehicle_unavailabilities', action: 'GET'}]
					}, {
						id: 'documents',
						title: <EditableTransWrapper><Trans>Pièces jointes</Trans></EditableTransWrapper>,
						icon: <Icon type="paper-clip"/>,
						actions: [{
							id: 'addDocuments',
							title: <EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddDocumentModal entity={vehicle} uri="vehicle_documents" param="vehicle"/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchVehicleData();
								}
							},
							requiredRights: [{uri: '/vehicle_documents', action: 'POST'}]
						}],
						content: <Documents entity={vehicle} uri="vehicle_documents" param="vehicle"/>,
						requiredRights: [{uri: '/vehicle_documents', action: 'GET'}]
					}]
				}
			};
		}
		return null;
	}

	async fetchVehicleData() {
		let vehicle, technicians = [], services = [];
		this.setState({ready: false});
		const {vehicleId} =  this.props.match.params;
		const vehicleResponse = await apiClient.fetch('/vehicles/' + vehicleId).catch(() => this.setState({ready: true}));

		if (vehicleResponse && vehicleResponse.status === 200) {
			vehicle = vehicleResponse.json;
			const vehicleTechnicians = vehicle.defaultTechnicians;
			services.push(vehicle.service.label);

			for (let i = 0; i < vehicleTechnicians.length; i++) {
				const TechniciansResponse = await apiClient.fetch(vehicleTechnicians[i]).catch(() => this.setState({ready: true}));
				if (TechniciansResponse.status === 200) {
					technicians.push(TechniciansResponse.json);
				}
			}

			this.setState({
				ready: true,
				vehicle,
				services,
				technicians
			});
		}
	}

	componentDidMount() {
		this.fetchVehicleData();
	}

	render() {
		const {ready, vehicle} = this.state;
		return (
			ready ?
				(
					vehicle ?
						<DashboardComp className="vehicle-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">{'Le véhicule n\'existe pas'}</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default Dashboard;