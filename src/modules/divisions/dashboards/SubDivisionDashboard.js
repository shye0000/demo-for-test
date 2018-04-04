import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Documents from '../../../components/dashboardBoxes/Documents';
import AddDocumentModal from '../../../components/dashboardBoxes/AddDocumentModal';
import ContactPoints from '../dashboardBoxes/ContactPoints';
import AddContactPointModal from '../modals/AddContactPointModal';
import AddSubDivisionModal from '../modals/AddSubDivisionModal';
import AddDivisionModal from '../modals/AddDivisionModal';
import ModifySubDivisionModal from '../modals/ModifySubDivisionModal';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import showFormattedNumbers from '../../utils/showFormattedNumbers';
import apiClient from '../../../apiClient';
import getFullAddress from '../../utils/getFullAddress';
import './DivisionDashboard.scss';

class SubDivisionDashboard extends React.Component {

	state = {
		ready: false,
		division: null,
		subDivision: null,
		openedContactPoint: null
	}

	getFullAddress = () => {
		const {subDivision} = this.state;
		if (subDivision) {
			return getFullAddress(subDivision);
		}
		return null;
	}

	getSubTitle = () => {
		const {subDivision} = this.state;
		return <div className="division-sub-title sub-division-sub-title">
			{
				subDivision.parent ?
					<EditableTransWrapper><Trans>Zone</Trans></EditableTransWrapper>
					:
					<EditableTransWrapper><Trans>Site</Trans></EditableTransWrapper>
			}
		</div>;
	}

	getPhotoIcon = () => {
		const {subDivision} = this.state;
		return subDivision.parent ?
			<IconSvg className="sub-division-icon division-icon" type={import('../../../../icons/zone.svg')}/>
			:
			<IconSvg className="sub-division-icon division-icon" type={import('../../../../icons/environment-o.svg')}/>;
	}

	getConfig = () => {
		const {ready, subDivision, openedContactPoint, division} = this.state;
		if (ready && subDivision && division) {
			let config = {
				head: {
					title: subDivision.name,
					subTitle: this.getSubTitle(),
					photoComponent: this.getPhotoIcon(),
					contents: [[
						{
							label: <EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>,
							value: this.getFullAddress()
						}, {
							label: <EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>,
							value:  showFormattedNumbers(subDivision.phone)
						}
					], [
						{
							label: <EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>,
							value:  showFormattedNumbers(subDivision.fax)
						}, {
							label: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
							value: subDivision.email
						}
					]],
					foot: <div>
						{
							subDivision.comment ?
								<div className="foot-comment">
									<Tooltip title="Commentaire" arrowPointAtCenter placement="left">
										<IconSvg type={import('../../../../icons/message.svg')}/>
										<span className="comment">
											{subDivision.comment}
										</span>
									</Tooltip>
								</div>: null
						}
						{
							subDivision.technicianComment ?
								<div className="foot-comment">
									<Tooltip title="Commentaire interne" arrowPointAtCenter placement="left">
										<IconSvg type={import('../../../../icons/cone.svg')}/>
										<span className="comment">
											{subDivision.technicianComment}
										</span>
									</Tooltip>
								</div>: null
						}
					</div>,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifySubDivisionModal width={750} subDivision={subDivision} parent={subDivision.parent}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchDivisionData();
							}
						},
						requiredRights: [{uri: subDivision['@id'], action: 'PUT'}]
					}, {
						id: 'addSubOrganisation',
						icon: <Icon type="plus-circle-o"/>,
						disabled: !subDivision.allowedAdditionalDivisions.subOrganisation,
						title: <EditableTransWrapper><Trans>Ajouter une sous-organisation</Trans></EditableTransWrapper>,
						modal: <AddDivisionModal width={750} parentDivision={division}/>,
						requiredRights: [{uri: '/divisions', action: 'POST'}]
					}, {
						id: 'addSite',
						icon: <Icon type="plus-circle-o"/>,
						disabled: !subDivision.allowedAdditionalDivisions.site,
						title: <EditableTransWrapper><Trans>Ajouter un site</Trans></EditableTransWrapper>,
						modal: <AddSubDivisionModal width={750} parentDivision={division}/>,
						requiredRights: [{uri: '/sub_divisions', action: 'POST'}]
					}, {
						id: 'addZone',
						icon: <Icon type="plus-circle-o"/>,
						disabled:  !subDivision.allowedAdditionalDivisions.zone,
						title: <EditableTransWrapper><Trans>Ajouter une zone</Trans></EditableTransWrapper>,
						modal: <AddSubDivisionModal width={750} parentDivision={division} parentSubDivision={subDivision}/>,
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
							modal: <AddContactPointModal entity={subDivision} division={division} param="subDivision"/>,
							modalCloseCallback: (refresh, newContactPoint) => {
								if (refresh) {
									this.fetchDivisionData(newContactPoint);
								}
							},
							requiredRights: [{uri: '/data_points', action: 'POST'}]
						}],
						content: <ContactPoints
							openedContactPoint={openedContactPoint} division={division}
							entity={subDivision} param="subDivision"/>,
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
							modal: <AddDocumentModal entity={subDivision} uri='/sub_division_documents' param="subDivision"/>,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.fetchDivisionData();
								}
							},
							requiredRights: [
								{uri: '/files/upload', action: 'POST'},
								{uri: '/sub_division_documents', action: 'POST'}
							]
						}],
						content: <Documents entity={subDivision} uri='/sub_division_documents' param="subDivision"/>,
						requiredRights: [{uri: '/sub_division_documents', action: 'GET'}]
					}]
				}
			};
			return config;
		}
		return null;
	}

	async fetchDivisionData(openedContactPoint) {
		let subDivision, division;
		this.setState({ready: false});
		const {subDivisionId, divisionId} =  this.props.match.params;
		const subDivisionResponse = await apiClient.fetch('/sub_divisions/' + subDivisionId).catch(() => this.setState({ready: true}));
		const divisionResponse = await apiClient.fetch('/divisions/' + divisionId).catch(() => this.setState({ready: true}));
		if (subDivisionResponse && subDivisionResponse.status === 200
			&& divisionResponse && divisionResponse.status ===200) {
			subDivision = subDivisionResponse.json;
			division = divisionResponse.json;
			this.setState({
				ready: true,
				division,
				subDivision,
				openedContactPoint: openedContactPoint ? openedContactPoint['@id'] : null
			});
		}
	}

	componentDidMount() {
		this.fetchDivisionData();
	}

	render() {
		const {ready, subDivision} = this.state;
		return (
			ready ?
				(
					subDivision ?
						<DashboardComp className="sub-division-dashboard division-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'La sous-organisation n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin indicator="" className="centered-spin" size="large" />
		);
	}
}

export default SubDivisionDashboard;
