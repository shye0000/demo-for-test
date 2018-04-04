import React from 'react';
import moment from 'moment';
import DashboardComp from '../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../apiClient';
import Skills from './dashboardBoxes/Skills';
import Unavailability from './dashboardBoxes/Unavailability';
import Documents from '../../components/dashboardBoxes/Documents';
import ContractTypes from '../../apiConstants/ContractEmployeeTypes';
import EmployeeTypes from '../../apiConstants/EmployeeTypes';
import ModifySkillsModal from './ModifySkillsModal';
import ModifyEmloyeeModal from './ModifyEmloyeeModal';
import AddUnavailabilityModal from './AddUnavailabilityModal';
import {Trans} from 'lingui-react';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import AddDocumentModal from '../../components/dashboardBoxes/AddDocumentModal';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import showFormattedNumbers from '../utils/showFormattedNumbers';
import getFullAddress from '../utils/getFullAddress';
import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';
import './Dashboard.scss';

class Dashboard extends React.Component {

	state = {
		ready: false,
		employee: null,
		services: null,
	}

	getDashboardHeadTitle = () => {
		const {employee} = this.state;
		if (employee) {
			const gender = employee.gender === 1 ?
				<EditableTransWrapper><Trans>Mme.</Trans></EditableTransWrapper>
				:
				<EditableTransWrapper><Trans>M.</Trans></EditableTransWrapper>;
			const fullName = `${employee.firstName} ${employee.lastName}`;
			return <div>
				{gender}
				{' ' + fullName}
			</div>;
		}
		return null;
	}

	getContractType = () => {
		const {employee} = this.state;
		if (employee && employee.contractType) {
			const contractType = ContractTypes.find((type) => type.value === employee.contractType);
			return contractType.label;
		}
		return null;
	}

	getFullAddress = () => {
		const {employee} = this.state;
		if (employee) {
			return getFullAddress(employee);
		}
		return null;
	}

	getConfig = () => {
		const {ready, employee, services} = this.state;
		if (ready && employee) {
			return {
				head: {
					title: this.getDashboardHeadTitle(),
					photo: employee.photo ? AppConfig.apiEntryPoint + employee.photo.content_uri : null,
					contents: [[
						{
							label: <EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>,
							value:  showFormattedNumbers(employee.phone)
						}, {
							label: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
							value: employee.email
						}, {
							label: <EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>,
							value: this.getFullAddress()
						}, {
							label: <EditableTransWrapper><Trans>Nationalité</Trans></EditableTransWrapper>,
							value: employee.nationality ? employee.nationality.name : null
						}, {
							label: <EditableTransWrapper><Trans>Date de naissance</Trans></EditableTransWrapper>,
							value: employee.birthday ? moment(employee.birthday).format('L') : null
						}
					], [
						{
							label: <EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>,
							value: services.map((service) => service.label).join(', ')
						}, {
							label: <EditableTransWrapper><Trans>Type de salarié</Trans></EditableTransWrapper>,
							value: EmployeeTypes.filter(type => {
								return type.value === employee.employeeType;
							})[0].label
						}, {
							label: <EditableTransWrapper><Trans>{'Date d\'entrée'}</Trans></EditableTransWrapper>,
							value: employee.dateIn ? moment(employee.dateIn).format('L') : null
						}, {
							label: <EditableTransWrapper><Trans>Date de sortie</Trans></EditableTransWrapper>,
							value: employee.dateOut ? moment(employee.dateOut).format('L') : null
						}
					], [
						{
							label: <EditableTransWrapper><Trans>N° de permis</Trans></EditableTransWrapper>,
							value: employee.driverLicenseNumber
						}, {
							label: <EditableTransWrapper><Trans>N° de sécurité sociale</Trans></EditableTransWrapper>,
							value: employee.socialSecurityNumber
						}, {
							label: <EditableTransWrapper><Trans>Mutuelle</Trans></EditableTransWrapper>,
							value: employee.mutual ?
								<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
								:
								<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>
						}, {
							label: <EditableTransWrapper><Trans>Type de contrat</Trans></EditableTransWrapper>,
							value: <div>
								{this.getContractType()}
								{
									employee.contractHours ?
										<span>
											{' ' + employee.contractHours}
											<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
										</span> : null
								}

							</div>
						}
					]],
					foot: employee.comment ? (<div className="foot-comment"><IconSvg type={import('../../../icons/message.svg')}/><span id="comment">{employee.comment}</span></div>): null,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyEmloyeeModal width={750} employee={employee}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchEmployeeData();
							}
						},
						requiredRights: [{uri: employee['@id'], action: 'PUT'}]
					}, {
						id: 'printWeekPlanning',
						icon: <Icon type="printer"/>,
						title: <EditableTransWrapper><Trans>Imprimer un planning de semaine</Trans></EditableTransWrapper>
						// todo action to be complete, and requiredRights to be defined
					}]
				},
				body: {
					boxes: [{
						id: 'skills',
						title: <EditableTransWrapper><Trans>Compétences</Trans></EditableTransWrapper>,
						icon: <Icon type="solution"/>,
						actions: [{
							id: 'modifySkills',
							title: <EditableTransWrapper><Trans>Modifier les compétences</Trans></EditableTransWrapper>,
							icon: <Icon type="edit"/>,
							unfolded: true,
							modal: <ModifySkillsModal employee={employee}/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchEmployeeData();
								}
							},
							requiredRights: [{uri: employee['@id'], action: 'PUT'}]
						}],
						content: <Skills employee={employee} />,
						requiredRights: [{uri: '/skills', action: 'GET'}]
					}, {
						id: 'unavailability',
						title: <EditableTransWrapper><Trans>Indisponibilités</Trans></EditableTransWrapper>,
						icon: <Icon type="user-delete"/>,
						actions: [{
							id: 'addUnavailability',
							title: <EditableTransWrapper><Trans>Ajouter une indisponibilité</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddUnavailabilityModal employee={employee}/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchEmployeeData();
								}
							},
							requiredRights: [{uri: '/employee_unavailabilities', action: 'POST'}]
						}],
						content: <Unavailability employee={employee}/>,
						requiredRights: [{uri: '/employee_unavailabilities', action: 'GET'}]
					}, {
						id: 'documents',
						title: <EditableTransWrapper><Trans>Pièces jointes</Trans></EditableTransWrapper>,
						icon: <Icon type="paper-clip"/>,
						actions: [{
							id: 'addDocuments',
							title: <EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddDocumentModal entity={employee} uri="/employee_documents" param="employee"/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchEmployeeData();
								}
							},
							requiredRights: [
								{uri: '/files/upload', action: 'POST'},
								{uri: '/employee_documents', action: 'POST'}
							]
						}],
						content: <Documents entity={employee} uri="/employee_documents" param="employee"/>,
						requiredRights: [{uri: '/employee_documents', action: 'GET'}]
					}]
				}
			};
		}
		return null;
	}

	async fetchEmployeeData() {
		let employee, services = [];
		this.setState({ready: false});
		const {employeeId} =  this.props.match.params;
		const employeeResponse = await apiClient.fetch('/employees/' + employeeId).catch(() => this.setState({ready: true}));
		if (employeeResponse && employeeResponse.status === 200) {
			employee = employeeResponse.json;

			const serviceResponse = await apiClient.fetch('/services', {
				params: {
					['employees']: employee.id,
					pagination: false
				}
			}).catch(() => this.setState({ready: true}));
			if (serviceResponse.status === 200) {
				services = serviceResponse.json['hydra:member'];
			}

			this.setState({
				ready: true,
				employee,
				services,
			});
		}
	}

	componentDidMount() {
		this.fetchEmployeeData();
	}

	render() {
		const {ready, employee} = this.state;
		return (
			ready ?
				(
					employee ?
						<DashboardComp className="employee-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le salarié n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default Dashboard;
