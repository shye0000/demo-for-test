import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Documents from '../../../components/dashboardBoxes/Documents';
import Contacts from '../dashboardBoxes/Contacts';
import AddDocumentModal from '../../../components/dashboardBoxes/AddDocumentModal';
import AddContactModal from '../modals/AddContactModal';
import AddContactPointModal from '../modals/AddContactPointModal';
import AddDivisionModal from '../modals/AddDivisionModal';
import AddSubDivisionModal from '../modals/AddSubDivisionModal';
import ContactPoints from '../dashboardBoxes/ContactPoints';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import showFormattedNumbers from '../../utils/showFormattedNumbers';
import ModifyDivisionModal from '../modals/ModifyDivisionModal';
import getFullAddress from '../../utils/getFullAddress';
import './DivisionDashboard.scss';

class DivisionDashboard extends React.Component {

	state = {
		ready: false,
		division: null,
		openedContactPoint: null
	}

	getFullAddress = () => {
		const {division} = this.state;
		if (division) {
			return getFullAddress(division);
		}
		return null;
	}

	getSubTitle = () => {
		const {division} = this.state;
		return <div className="division-sub-title">
			{
				division.parent ?
					<EditableTransWrapper><Trans>Sous organisation</Trans></EditableTransWrapper>
					:
					<EditableTransWrapper><Trans>Organisation</Trans></EditableTransWrapper>
			}
		</div>;
	}

	getPhotoIcon = () => {
		const {division} = this.state;
		return division.parent ?
			<IconSvg className="division-icon" type={import('../../../../icons/sous-organisation.svg')}/>
			:
			<IconSvg className="division-icon" type={import('../../../../icons/organisation.svg')}/>;
	}

	getConfig = () => {
		const {ready, division, openedContactPoint} = this.state;
		if (ready && division) {
			let config = {
				head: {
					title: division.name,
					subTitle: this.getSubTitle(),
					photoComponent: this.getPhotoIcon(),
					contents: [[
						{
							label: <EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>,
							value: this.getFullAddress()
						}, {
							label: <EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>,
							value: showFormattedNumbers(division.phone)
						}, {
							label: <EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>,
							value: showFormattedNumbers(division.fax)
						}
					], [
						{
							label: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
							value: division.email
						}, {
							label: <EditableTransWrapper><Trans>N° Siret</Trans></EditableTransWrapper>,
							value: division.siretNumber
						}
					]],
					foot: division.comment ? (<div className="foot-comment"><IconSvg type={import('../../../../icons/message.svg')}/><span className="comment">{division.comment}</span></div>): null,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyDivisionModal width={750} division={division}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchDivisionData();
							}
						},
						requiredRights: [{uri: division['@id'], action: 'PUT'}]
					}, {
						id: 'showContract',
						icon: <Icon type="eye-o"/>,
						title: <EditableTransWrapper><Trans>Voir les contrats</Trans></EditableTransWrapper>,
						disabled: !division.canHaveContracts,
						link: '/contracts/list?division=' + division['@id'],
						requiredRights: [{uri: '/contracts', action: 'GET'}]
					}, {
						id: 'addContract',
						icon: <Icon type="plus-circle-o"/>,
						disabled: !division.canHaveContracts,
						link: '/contracts/add/2/' + division.id,
						title: <EditableTransWrapper><Trans>Créer un contrat</Trans></EditableTransWrapper>,
						requiredRights: [{uri: '/contracts', action: 'POST'}]
					}, {
						id: 'addSubOrganisation',
						icon: <Icon type="plus-circle-o"/>,
						disabled: !division.allowedAdditionalDivisions.subOrganisation,
						title: <EditableTransWrapper><Trans>Ajouter une sous-organisation</Trans></EditableTransWrapper>,
						modal: <AddDivisionModal width={750} parentDivision={division}/>,
						requiredRights: [{uri: '/divisions', action: 'POST'}]
					}, {
						id: 'addSite',
						icon: <Icon type="plus-circle-o"/>,
						disabled: !division.allowedAdditionalDivisions.site,
						title: <EditableTransWrapper><Trans>Ajouter un site</Trans></EditableTransWrapper>,
						modal: <AddSubDivisionModal width={750} parentDivision={division}/>,
						requiredRights: [{uri: '/sub_divisions', action: 'POST'}]
					}, {
						id: 'addZone',
						icon: <Icon type="plus-circle-o"/>,
						disabled:  !division.allowedAdditionalDivisions.zone,
						title: <EditableTransWrapper><Trans>Ajouter une zone</Trans></EditableTransWrapper>,
						requiredRights: [{uri: '/sub_divisions', action: 'POST'}]
					}]
				},
				body: {
					boxesColumnNb: 2,
					boxes: [{
						id: 'contactPoints',
						title: <EditableTransWrapper><Trans>Points de contact</Trans></EditableTransWrapper>,
						icon: <Icon type="phone" />,
						actions: [{
							id: 'addContactPoint',
							title: <EditableTransWrapper><Trans>Ajouter un point de contact</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddContactPointModal entity={division} param="division"/>,
							modalCloseCallback: (refresh, newContactPoint) => {
								if (refresh) {
									this.fetchDivisionData(newContactPoint);
								}
							},
							requiredRights: [{uri: '/data_points', action: 'POST'}]
						}],
						content: <ContactPoints
							openedContactPoint={openedContactPoint} entity={division}
							division={division} param="division"/>,
						requiredRights: [{uri: '/data_points', action: 'GET'}]
					}, {
						id: 'documents',
						title: <EditableTransWrapper><Trans>Pièces jointes</Trans></EditableTransWrapper>,
						icon: <Icon type="paper-clip"/>,
						actions: [{
							id: 'addDocuments',
							title: <EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddDocumentModal entity={division} uri="/division_documents" param="division"/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchDivisionData();
								}
							},
							requiredRights: [
								{uri: '/files/upload', action: 'POST'},
								{uri: '/division_documents', action: 'POST'}
							]
						}],
						content: <Documents entity={division} uri="/division_documents" param="division"/>,
						requiredRights: [{uri: '/division_documents', action: 'GET'}]
					}]
				}
			};
			if (!division.parent) {
				config.body.boxes.push({
					id: 'contacts',
					title: <EditableTransWrapper><Trans>{'Salariés de l\'organisation'}</Trans></EditableTransWrapper>,
					icon: <IconSvg className="division-icon" type={import('../../../../icons/contacts.svg')}/>,
					actions: [{
						id: 'addContact',
						title: <EditableTransWrapper><Trans>Ajouter un salarié tiers</Trans></EditableTransWrapper>,
						icon: <Icon type="plus"/>,
						unfolded: true,
						modal: <AddContactModal width={750} division={division}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchDivisionData();
							}
						},
						requiredRights: [
							{uri: '/contacts', action: 'POST'}
						]
					}],
					content: <Contacts division={division} />,
					requiredRights: [{uri: '/contacts', action: 'GET'}]
				});
			}
			return config;
		}
		return null;
	}

	async fetchDivisionData(openedContactPoint) {
		let division;
		this.setState({ready: false});
		const {divisionId} =  this.props.match.params;
		const divisionResponse = await apiClient.fetch('/divisions/' + divisionId).catch(() => this.setState({ready: true}));
		if (divisionResponse && divisionResponse.status === 200) {
			division = divisionResponse.json;
			this.setState({
				ready: true,
				division,
				openedContactPoint: openedContactPoint ? openedContactPoint['@id'] : null
			});
		}
	}

	componentDidMount() {
		this.fetchDivisionData();
	}

	render() {
		const {ready, division} = this.state;
		return (
			ready ?
				(
					division ?
						<DashboardComp className="division-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'L\'organisation n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin indicator="" className="centered-spin" size="large" />
		);
	}
}

export default DivisionDashboard;
