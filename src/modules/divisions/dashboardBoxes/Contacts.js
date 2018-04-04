import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import {Link} from 'react-router-dom';
import Actions from '../../../components/actions/Actions';
import classNames from 'classnames';
import moment from 'moment';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import './Contacts.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import showFormattedNumbers from '../../utils/showFormattedNumbers';
import ModifyContactModal from '../modals/ModifyContactModal';

class Contacts extends React.Component {

	state = {
		ready: false,
		contacts: null,
		contactMembers: [],
		page: 1
	}

	async fetchContacts() {
		const {division} = this.props;
		const {page, contactMembers} = this.state;
		this.setState({ready: false});
		const contactsResponse = await apiClient.fetch('/contacts', {
			params: {
				['order[isOut]']: 'ASC',
				['order[fullName]']: 'ASC',
				division: division.id,
				itemsPerPage: 10,
				page
			}
		}).catch(
			() => this.setState({ready: true})
		);
		if (contactsResponse.status === 200) {
			this.setState({
				ready: true,
				contacts: contactsResponse.json,
				contactMembers : [...contactMembers, ...contactsResponse.json['hydra:member']]
			});
		}
	}

	reload = () => {
		this.setState({
			page : 1,
			contactMembers: []
		}, ()=> {
			this.fetchContacts();
		});
	}

	componentDidMount () {
		this.reload();
	}

	loadMore = () => {
		const {contacts, page} = this.state;
		if (contacts && contacts['hydra:view']['hydra:next']) {
			this.setState({
				page : page + 1
			}, ()=> {
				this.fetchContacts();
			});
		}
	}

	getActions = (contact) => {
		return [{
			id: 'modify',
			icon: <Icon type="edit"/>,
			title: <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>,
			modal: <ModifyContactModal width={750} contact={contact}/>,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					this.reload();
				}
			},
			requiredRights: [{uri: contact['@id'], action: 'PUT'}]
		}];
	}

	render() {
		const {contacts, ready, contactMembers} = this.state;
		return <div className="contacts">
			<Spin spinning={!ready} >
				{
					contacts && contactMembers && contactMembers.length ?
						<div>
							{
								contactMembers.map((contact, idx) => {
									return <div key={idx} className={classNames('contact-item', {
										disabled: contact.dateOut && moment(contact.dateOut).valueOf() <= moment().valueOf()
									})}>
										<div
											className="contact-photo"
											style={{backgroundImage: contact.photo ? `url(${AppConfig.apiEntryPoint}${contact.photo.content_uri})` : ''}}>
											{!contact.photo ? `${contact.firstName[0]}${contact.lastName[0]}` : null}
										</div>
										<div className="contact-info">
											<Link to={'/contacts/' + contact.id} className="name">
												{`${contact.firstName} ${contact.lastName}`}
											</Link>
											<div>{contact.function}</div>
											{
												<div>
													<EditableTransWrapper><Trans>Tél.</Trans></EditableTransWrapper>
													{' '}
													{showFormattedNumbers(contact.phone)}
												</div>
											}
										</div>
										<div className="contact-actions">
											<Actions  actions={this.getActions(contact)}/>
										</div>
									</div>;
								})
							}
							{
								contacts['hydra:view']['hydra:next'] ?
									<div className="load-more-button" onClick={this.loadMore}>
										<EditableTransWrapper><Trans>Charger plus</Trans></EditableTransWrapper>
									</div> : null
							}

						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>Aucun salarié</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;
	}
}

export default withI18n()(Contacts);