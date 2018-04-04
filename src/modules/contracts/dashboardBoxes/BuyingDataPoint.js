import React from 'react';
import {Link} from 'react-router-dom';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import './BuyingDataPoint.scss';
import classNames from 'classnames';
import moment from 'moment/moment';

class BuyingDataPoint extends React.Component {

	state = {
		ready: false,
		buyingDataPoint: null
	}

	getFullOrganizations = () => {
		const {buyingDataPoint} = this.state;
		let fullOrganizations, divisionId = '', subDivisionId = '';
		if (buyingDataPoint && buyingDataPoint.division) {
			if (buyingDataPoint.division.parent)
				fullOrganizations = buyingDataPoint.division.parent.name + ' > ' + buyingDataPoint.division.name;
			else
				fullOrganizations = buyingDataPoint.division.name;
			divisionId = buyingDataPoint.division.id;
		}
		if (buyingDataPoint && buyingDataPoint.subDivision) {
			if (buyingDataPoint.subDivision.parent)
				fullOrganizations  += ' > ' + buyingDataPoint.subDivision.parent.name + ' > ' + buyingDataPoint.subDivision.name;
			else
				fullOrganizations += ' > ' + buyingDataPoint.subDivision.name;
			subDivisionId = buyingDataPoint.subDivision.id;

		}

		return <div className="division-link">
			<Link to={`/divisions/split/${divisionId}/${subDivisionId}`}>
				{fullOrganizations}
			</Link>
		</div>;
	}

	async fetchBuyingDataPoint() {
		this.setState({ready: false});
		let buyingDataPoint;
		const {contract} = this.props;
		const response = await apiClient.fetch(contract.buyingDataPoint['@id']);
		if (response && response.status === 200) {
			buyingDataPoint = response.json;
			this.setState({
				ready: true,
				buyingDataPoint,
			});
		}
	}

	componentDidMount () {
		const {contract} = this.props;
		if (contract.buyingDataPoint) {
			this.fetchBuyingDataPoint();
		} else {
			this.setState({ready: true});
		}

	}

	render() {
		const {buyingDataPoint, ready} = this.state;
		return <Spin spinning={!ready}>
			<div className="buying-data-point">
				{
					buyingDataPoint ?
						<div className="body">
							{this.getFullOrganizations()}
							{
								buyingDataPoint.dataPointContacts && buyingDataPoint.dataPointContacts.length ?
									buyingDataPoint.dataPointContacts.map((contact, idx) => {
										contact = contact.contact;
										return <div key={idx} className={classNames('contact', {
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
											<div className="info">
												<div className="name">
													{`${contact.firstName} ${contact.lastName}`}
												</div>
												<div className="email">{contact.email}</div>
											</div>
										</div>;
									}) : <div className="empty-tag">
										<EditableTransWrapper><Trans>{'Aucun contact'}</Trans></EditableTransWrapper>
									</div>
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Vous n\'avez pas encore sélectionné le point de contact achat'}</Trans></EditableTransWrapper>
						</div>
				}
			</div>
		</Spin>;
	}
}

export default withI18n()(BuyingDataPoint);