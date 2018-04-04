import React from 'react';
import moment from 'moment';
import DashboardComp from '../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Tag from '../../components/tag/Tag';
import apiClient from '../../apiClient';
import {Trans} from 'lingui-react';
import {Link} from 'react-router-dom';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Dashboard.scss';
import DataPoint from './dashboardBoxes/DataPoint';
import Icon from 'antd/lib/icon';
import ModifyContactModal from './ModifyContactModal';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import showFormattedNumbers from '../utils/showFormattedNumbers';

class Dashboard extends React.Component {

	state = {
		ready: false,
		contact: null,
		userAdd: null
	}

	getDashboardHeadTitle = () => {
		const {contact} = this.state;
		if (contact) {
			const gender = contact.gender === 1 ?
				<EditableTransWrapper><Trans>Mme.</Trans></EditableTransWrapper>
				:
				<EditableTransWrapper><Trans>M.</Trans></EditableTransWrapper>;
			const fullName = `${contact.firstName} ${contact.lastName}`;
			return <div>
				{gender}
				{' ' + fullName}
			</div>;
		}
		return null;
	}

	getDashboardHeadSubTitle = (contact, userAdd) => {
		return (
			((contact.gender && contact.gender === 1) ? 'Ajoutée par ' : 'Ajouté par ')
			+ userAdd.employee.firstName + ' ' + userAdd.employee.lastName
			+ (contact.createdAt ? (' le ' + moment(contact.createdAt).format('L')) : null)
		);
	}

	getWorkingStatus = (contact) => {
		if(moment(contact.dateOut) > moment()){
			return <Tag label={
				<EditableTransWrapper><Trans>En poste</Trans></EditableTransWrapper>
			} checked={true}/>;
		}else{
			const text = (contact.gender && contact.gender === 1) ? <Trans>Sortie de la société</Trans> : <Trans>Sorti de la société</Trans>;
			return <Tag label={
				<EditableTransWrapper>{text}</EditableTransWrapper>
			} error={true}/>;
		}
	}

	getConfig = () => {
		const {ready, contact, userAdd} = this.state;
		if (ready && contact && userAdd) {
			return {
				head: {
					title: this.getDashboardHeadTitle(),
					photo: contact.photo ? AppConfig.apiEntryPoint + contact.photo.content_uri : null,
					subTitle: this.getDashboardHeadSubTitle(contact, userAdd),
					contents: [
						{
							component : <div>
								<Link to={'/divisions/split/' + contact.division.id} className="division-icon-head">
									<IconSvg size={17} type={import('../../../icons/organisation.svg')}/>
									{contact.division.name}
								</Link>
								<div className="division-status-head">
									{this.getWorkingStatus(contact)}
								</div>
							</div>
						},
						[
							{
								label: <EditableTransWrapper><Trans>Poste</Trans></EditableTransWrapper>,
								value:  contact.function
							}, {
								label: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
								value: contact.email
							}, {
								label: <EditableTransWrapper><Trans>Téléphone principal</Trans></EditableTransWrapper>,
								value: showFormattedNumbers(contact.phone)
							}
						], [
							{
								label: <EditableTransWrapper><Trans>Téléphone secondaire</Trans></EditableTransWrapper>,
								value: showFormattedNumbers(contact.phoneBis)
							},  {
								label: <EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>,
								value: showFormattedNumbers(contact.fax)
							}
						]
					],
					foot: contact.comment ? (<div className="foot-comment"><IconSvg type={import('../../../icons/message.svg')}/><span id="comment">{contact.comment}</span></div>): null,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyContactModal width={750} contact={contact}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchContactData();
							}
						},
						requiredRights: [{uri: contact['@id'], action: 'PUT'}]
					}]
				},
				body: {
					boxesColumnNb: 2,
					boxes: [{
						id: 'datapoints',
						icon: <Icon type="phone"/>,
						title: <EditableTransWrapper><Trans>Points de contacts liés</Trans></EditableTransWrapper>,
						content: <DataPoint contact={contact} />,
						requiredRights: [{uri: '/data_points', action: 'GET'}]
					}]
				},
			};
		}
		return null;
	}

	async fetchContactData() {
		let contact;
		let userAdd;
		this.setState({ready: false});
		const {contactId} =  this.props.match.params;
		const contactResponse = await apiClient.fetch('/contacts/' + contactId).catch(() => this.setState({ready: true}));
		if (contactResponse && contactResponse.status === 200) {
			contact = contactResponse.json;

			const userAddResponse = await apiClient.fetch(contact.createdBy).catch(() => this.setState({ready: true}));
			if (userAddResponse.status === 200) {
				userAdd = userAddResponse.json;
			}

			this.setState({
				ready: true,
				contact,
				userAdd
			});
		}


	}

	componentDidMount() {
		this.fetchContactData();
	}

	render() {
		const {ready, contact} = this.state;
		return (
			ready ?
				(
					contact ?
						<DashboardComp className="contact-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le salarié tiers n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin indicator="" className="centered-spin" size="large" />
		);
	}
}

export default Dashboard;
