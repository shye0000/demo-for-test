import React from 'react';
import Icon from 'antd/lib/icon';
import Spin from 'antd/lib/spin';
import {Link} from 'react-router-dom';
import {Trans, withI18n} from 'lingui-react';
import classNames from 'classnames';
import Actions from '../../../components/actions/Actions';
import './ContactPointContacts.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import apiClient from '../../../apiClient';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import moment from 'moment/moment';
import {connect} from 'react-redux';


const mapStateToProps = (state) => {
	return {
		modifiedContact: state.divisions.modifiedContact
	};
};

class ContactPointContacts extends React.Component {

	state = {
		ready: true,
		dataPointContacts: []
	}

	changeContactPointContactPosition = (currentDataPointContact, direction) => {
		const {i18n} = this.props;
		this.setState({ready: false});
		apiClient.fetch(currentDataPointContact['@id'], {
			method: 'PUT',
			body: jsonStringifyPreserveUndefined({
				position: currentDataPointContact.position + direction
			})
		}).then(
			() => {
				this.props.callback();
				this.setState({ready: true});
				notification['success']({
					message: i18n.t`La position du salarié a bien été changée.`,
					className: 'qhs-notification success'
				});
			},
			() => {
				this.setState({ready: true});
				notification['error']({
					message: i18n.t`La position du salarié n'a pas été changée.`,
					className: 'qhs-notification error'
				});
			}
		);
	}

	componentDidMount () {
		this.setState({
			dataPointContacts: this.props.dataPointContacts
		});
	}

	componentWillReceiveProps(nextProps) {
		const dataPointContacts = nextProps.dataPointContacts || this.state.dataPointContacts;
		let idxModifiedContact = -1;
		if (nextProps.modifiedContact) {
			idxModifiedContact = dataPointContacts.findIndex((dataPointContact) => {
				return dataPointContact.contact['@id'] === nextProps.modifiedContact['@id'];
			});
		}
		if (idxModifiedContact > -1) {
			dataPointContacts[idxModifiedContact].contact = nextProps.modifiedContact;
		}
		this.setState({dataPointContacts});
	}

	getActions = (currentDataPointContact) => {
		const {dataPoint, i18n} = this.props;
		const {dataPointContacts} = this.state;

		return [{
			id: 'delete',
			icon: <Icon type="delete" />,
			title: <EditableTransWrapper><Trans>Retirer du point de contact</Trans></EditableTransWrapper>,
			method: () => {

				let dataPointContactsValue = dataPointContacts.map((dataPointContact) => {
					if (currentDataPointContact['@id'] !== dataPointContact['@id']) {
						return {'@id': dataPointContact['@id']};
					}
				}).filter((item) => item);
				Modal.confirm({
					title: i18n.t`Voulez-vous retirer ce salarié?`,
					className: 'qhs-confirm-modal delete',
					iconType: 'exclamation-circle',
					okText: i18n.t`Retirer`,
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					maskClosable: true,
					onOk: () => {
						apiClient.fetch(dataPoint['@id'], {
							method: 'PUT',
							body: jsonStringifyPreserveUndefined({
								dataPointContacts: dataPointContactsValue
							})
						}).then(
							() => {
								this.props.callback();
								notification['success']({
									message: i18n.t`Le salarié a bien été retiré du point de contact.`,
									className: 'qhs-notification success'
								});
							},
							() => {
								notification['error']({
									message: i18n.t`Le salarié n'a pas été retiré du point de contact.`,
									className: 'qhs-notification error'
								});
							}
						);
					}
				});
			},
			requiredRights: [{uri: dataPoint['@id'], action: 'PUT'}]
		}, {
			id: 'positionUp',
			icon: <Icon type="arrow-up" />,
			disabled: currentDataPointContact.position === 0,
			title: <EditableTransWrapper><Trans>Remonter</Trans></EditableTransWrapper>,
			method: () => {
				this.changeContactPointContactPosition(currentDataPointContact, -1);
			},
			requiredRights: [{uri: currentDataPointContact['@id'], action: 'PUT'}]
		}, {
			id: 'positionDown',
			icon: <Icon type="arrow-down" />,
			disabled: currentDataPointContact.position === dataPointContacts.length - 1,
			title: <EditableTransWrapper><Trans>Descendre</Trans></EditableTransWrapper>,
			method: () => {
				this.changeContactPointContactPosition(currentDataPointContact, 1);
			},
			requiredRights: [{uri: currentDataPointContact['@id'], action: 'PUT'}]
		}];

	}

	render() {
		const {dataPointContacts, ready} = this.state;
		dataPointContacts.sort(function(a, b) {
			return a.position - b.position;
		});
		return <Spin spinning={!ready}>
			<div className="contact-point-contacts">
				<div className="title">
					<EditableTransWrapper>
						<Trans>Salariés</Trans>
					</EditableTransWrapper>
				</div>
				{
					dataPointContacts && dataPointContacts.length ?
						<div>
							{
								dataPointContacts.map((dataPointContact, idx) => {
									const {contact} = dataPointContact;
									return <div key={idx} className={classNames('data-point-contact', {
										'contact-out': contact.dateOut && moment(contact.dateOut).valueOf() <= moment().valueOf()
									})}>
										<div className="photo" style={{
											backgroundImage: contact.photo ?
												`url(${AppConfig.apiEntryPoint}${contact.photo.content_uri})` : null
										}}>
											{
												!contact.photo ?
													`${contact.firstName[0]}${contact.lastName[0]}` : null
											}
										</div>
										<div className="name">
											<Link to={'/contacts/' + contact.id}>
												{`${contact.firstName} ${contact.lastName}`}
											</Link>
										</div>
										<div className="contact-actions">
											<Actions  actions={this.getActions(dataPointContact)}/>
										</div>
									</div>;
								})
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper>
								<Trans>{'Vous n\'avez pas encore ajouté de salarié dans ce point de contact'}</Trans>
							</EditableTransWrapper>
						</div>
				}
			</div>
		</Spin>
		;
	}
}

export default connect(mapStateToProps, null)(withI18n()(ContactPointContacts));