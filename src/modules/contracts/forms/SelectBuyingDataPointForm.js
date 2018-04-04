import React from 'react';
import {Link} from 'react-router-dom';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import classNames from 'classnames';
import Spin from 'antd/lib/spin';
import Select from 'antd/lib/select';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './SelectBuyingDataPointForm.scss';
import moment from 'moment/moment';

class SelectBuyingDataPointForm extends React.Component {

	state = {
		contacts: null,
		contactSearchFetching: false,
		selectedContact: null,
		buyingDataPoints: null,
		buyingDataPointFetching: false,
		selectedBuyingDataPoint: null
	}

	getFullOrganizations = (buyingDataPoint) => {
		let fullOrganizations, divisionId='', subDivisionId='';
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

	async searchContacts(searchContactValue) {
		const { division } = this.props.contract;
		this.setState({ contacts: [], contactSearchFetching: true });
		const searchResponse  = await apiClient.fetch('/contacts', {
			params: {
				search: searchContactValue ? searchContactValue : '',
				pagination: false,
				divisionOrParent: division.parent ? division.parent.id : division.id,
				isOut: false
			}
		});
		if (searchResponse.status === 200) {
			this.setState({
				contactSearchFetching: false,
				contacts: searchResponse.json['hydra:member']
			});
		}
	}

	async searchBuyingDataPoints(contact) {
		if (contact) {
			this.setState({ buyingDataPoints: [], buyingDataPointFetching: true });
			const { contract } = this.props;
			const response  = await apiClient.fetch('/data_points', {
				params: {
					'dataPointContacts.contact': contact,
					division: contract.division['@id'],
					type: 2,
					pagination: false
				}
			});
			if (response.status === 200) {
				this.setState({
					buyingDataPointFetching: false,
					buyingDataPoints: response.json['hydra:member']
				});
			}
		} else {
			this.setState({buyingDataPoints: null});
		}
	}

	handleContactValueChange = (selectedContact) => {
		this.searchBuyingDataPoints(selectedContact);
		this.setState({
			selectedContact,
			selectedBuyingDataPoint: null
		}, () => {
			this.props.form.setFieldsValue({buyingDataPoint: null});
		});
	}

	selectBuyingDataPoint = (buyingDataPoint) => {
		const { form } = this.props;
		form.setFieldsValue({buyingDataPoint: buyingDataPoint['@id']});
		this.setState({selectedBuyingDataPoint: buyingDataPoint['@id']});
	}

	getBuyingDataPointsComponent() {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const {selectedContact, buyingDataPointFetching, buyingDataPoints, selectedBuyingDataPoint} = this.state;
		return <Spin spinning={buyingDataPointFetching} size="large" >
			<div className="buying-data-points-wrapper">
				{
					buyingDataPoints && buyingDataPoints.length ?
						<div>
							<div className="label">
								{buyingDataPoints.length + ' '}
								<EditableTransWrapper>
									<Trans>{'points de contact achat ont été trouvés'}</Trans>
								</EditableTransWrapper>
							</div>
							{buyingDataPoints.map((dataPoint, idx) => {
								return <div
									key={idx} className={classNames('buying-data-point-block', {
										'selected': selectedBuyingDataPoint === dataPoint['@id']
									})} onClick={() => this.selectBuyingDataPoint(dataPoint)}>
									{this.getFullOrganizations(dataPoint)}
									{
										dataPoint.dataPointContacts && dataPoint.dataPointContacts.length ?
											<div className="contacts-wrapper">
												{dataPoint.dataPointContacts.map((dataPointContact, idx) => {
													const {contact} = dataPointContact;
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
														<div className="first-name">{contact.firstName}</div>
														<div className="last-name">{contact.lastName}</div>
													</div>;
												})}
											</div>
											:
											<div className="empty-tag">
												<EditableTransWrapper><Trans>{'Aucun contact'}</Trans></EditableTransWrapper>
											</div>
									}

								</div>;
							})}
						</div>
						:
						(
							selectedContact ?
								<div className="label">
									<EditableTransWrapper><Trans>{'Aucun point de contact trouvé'}</Trans></EditableTransWrapper>
								</div> : null
						)
				}
			</div>
			<FormCompItem>
				{getFieldDecorator('buyingDataPoint', {
					rules: [{required: true, message: i18n.t`Veuillez sélectionner un point de contact`}],
				})(
					<Input disabled={true} readOnly={true} style={{display: 'none'}} />
				)}
			</FormCompItem>
		</Spin>;
	}

	componentDidMount() {
		this.searchContacts();
		this.searchContacts = debounce(this.searchContacts, 500);
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const {contacts, contactSearchFetching} = this.state;
		return <FormComp className="select-buying-data-point-form" onSubmit={this.handleSubmit}>
			<FormCompItem
				label={
					<EditableTransWrapper><Trans>Rechercher un salarié tiers en activité</Trans></EditableTransWrapper>
				}
			>
				{getFieldDecorator('contact', {
					rules: [{required: true, message: i18n.t`Veuillez rechercher et sélectionner salarié tiers`}],
				})(
					<Select
						showSearch={true} allowClear={true} size="large" filterOption={false}
						notFoundContent={contactSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher un salarié tiers`}
						onSearch={(value) => this.searchContacts(value)}
						onChange={this.handleContactValueChange}>
						{
							contacts? contacts.map((contact, idx) => {
								return <Option key={idx} value={contact['@id']}>
									{`${contact.firstName} ${contact.lastName}`}
								</Option>;
							}) : null
						}
					</Select>
				)}
			</FormCompItem>
			{this.getBuyingDataPointsComponent()}
			<FormCompItem>
				{getFieldDecorator('errorFakeField')(
					<Input style={{display: 'none'}} disabled={true} readOnly={true} />
				)}
			</FormCompItem>
		</FormComp>;
	}
}


export default withI18n()(SelectBuyingDataPointForm);