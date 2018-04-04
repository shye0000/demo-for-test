import React from 'react';
import {withRouter} from 'react-router-dom';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import Button from 'antd/lib/button';
import {Trans, withI18n} from 'lingui-react';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import classNames from 'classnames';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import PhoneNumberField from '../../../components/PhoneNumberField';
import './SubdivisionForm.scss';

class Form extends React.Component {

	state = {
		ready: false,
		countries: null,
		submitting: false,
		countrySearchFetching: false,
		isSite: false,
		addNewSite: false,
		selectSite: false,
		sites: [],
		siteSearchFetching: false,
		linkedSites: []
	}

	setDefaultCountryFieldValue = () => {
		const {form} = this.props;
		const {countries} = this.state;
		for(let country of  countries){
			if(country && country.name === 'France' && country.code === 'FR'){
				form.setFieldsValue({
					country: {
						key: country['@id'],
						value: country['@id'],
						label: country.name
					}
				});
			}
		}
	}

	setAddSiteMode = ({addNewSite, selectSite}) => {
		const {form, parentDivision} = this.props;
		const {linkedSites} = this.state;
		this.setState({addNewSite, selectSite}, () => {
			if (addNewSite) {
				let countryValue = parentDivision.country ?
					{country: {key: parentDivision.country['@id'], label: parentDivision.country.name}}
					: null;
				form.setFieldsValue({
					...countryValue,
					address:             parentDivision.address,
					addressBis:          parentDivision.addressBis,
					zipCode:             parentDivision.zipCode,
					city:                parentDivision.city
				});
			}
			if (selectSite) {
				form.setFieldsValue({
					linkedSites: linkedSites.map(linkedSite => linkedSite['@id'])
				});
			}
			form.setFieldsValue({
				addSiteModeSelected: addNewSite || selectSite ? true : undefined,
			});
		});
	}

	async fetchLinkedSites() {
		const {parentDivision} = this.props;
		const response  = await apiClient.fetch('/sub_divisions', {
			params: {
				hasParent: false,
				divisions: [parentDivision['@id']],
				pagination: false
			}
		});
		if (response.status === 200) {
			const linkedSites = response.json['hydra:member'];
			this.setState({ready: true, linkedSites});
		}
	}

	async fetch() {
		this.setState({ready: false});
		await this.searchCountries('france');
		const {subDivision, form, parentSubDivision} = this.props;
		const isSite = !parentSubDivision;
		this.setState({
			ready: true,
			isSite
		});
		if (subDivision){
			// when modification of site / zone
			// set fields value
			let countryValue = subDivision.country ? {country: {key: subDivision.country['@id'], label: subDivision.country.name}} : null;
			form.setFieldsValue({
				...countryValue,
				name:                subDivision.name,
				address:             subDivision.address,
				addressBis:          subDivision.addressBis,
				zipCode:             subDivision.zipCode,
				city:                subDivision.city,
				phone:               subDivision.phone,
				fax:                 subDivision.fax,
				email:               subDivision.email,
				comment:             subDivision.comment,
				technicianComment:   subDivision.technicianComment,
			});
		}
		else if (!isSite) {
			// when add zone
			// set country field default values as france
			this.setDefaultCountryFieldValue();
		} else if (!subDivision) {
			// when add site
			// fetch sites already linked to division
			this.setState({ready: false});
			await this.fetchLinkedSites();
		}
	}

	async searchCountries(searchCountryValue) {
		if (searchCountryValue) {
			this.setState({ countries: [], countrySearchFetching: true });
			const searchCountriesResponse  = await apiClient.fetch('/countries', {params: {search: searchCountryValue}});
			if (searchCountriesResponse.status === 200) {
				this.setState({
					countrySearchFetching: false,
					countries: searchCountriesResponse.json['hydra:member']
				});
			}
		} else {
			this.setState({ countries: [] });
		}
	}

	async searchSites(searchValue) {
		if (searchValue) {
			this.setState({ sites: [], siteSearchFetching: true });
			const searchSitesResponse  = await apiClient.fetch('/sub_divisions', {
				params: {
					search: searchValue,
					pagination: false,
					hasParent: false,
					'order[name]': 'ASC'
				}
			});
			if (searchSitesResponse.status === 200) {
				const {linkedSites} = this.state;
				this.setState({
					siteSearchFetching: false,
					sites: searchSitesResponse.json['hydra:member'].map(site => {
						return {
							...site,
							linkedToParentDivision: !!linkedSites.find(linkedSite => linkedSite['@id'] === site['@id'])
						};
					})
				});

			}
		} else {
			this.setState({ sites: [] });
		}
	}

	async componentDidMount() {
		await this.fetch();
		this.searchCountries = debounce(this.searchCountries, 500);
	}

	getSubDivisionFormBody = () => {
		const {countries, countrySearchFetching} = this.state;
		const { i18n } = this.props;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const FormCompItem = FormComp.Item;
		return <FormComp onSubmit={this.handleSubmit}>
			<div className="form-section">
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Dénomination</Trans></EditableTransWrapper>}>
							{getFieldDecorator('name', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez renseigner le nom de l'organisation`,
								}],
							})(
								<Input placeholder={i18n.t`Nom`} size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12} className="organisations-street">
						<FormCompItem
							label={<EditableTransWrapper><Trans>N° / Rue</Trans></EditableTransWrapper>}>
							{getFieldDecorator('address')(
								<Input
									placeholder={i18n.t`Nom de la voie`} min={0} size="large"/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>{'Complément d\'adresse'}</Trans></EditableTransWrapper>}>
							{getFieldDecorator('addressBis')(
								<Input placeholder={i18n.t`Complément d'adresse`} size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<Row gutter={20} type="flex" align="top">
							<Col xs={24} md={15}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Ville</Trans></EditableTransWrapper>}>
									{getFieldDecorator('city')(
										<Input placeholder={i18n.t`Ville`} size="large" />
									)}
								</FormCompItem>
							</Col>
							<Col xs={24} md={9}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Code postal</Trans></EditableTransWrapper>}>
									{getFieldDecorator('zipCode')(
										<Input placeholder={i18n.t`Code postal`} size="large" />
									)}
								</FormCompItem>
							</Col>
						</Row>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Pays</Trans></EditableTransWrapper>}>
							{getFieldDecorator('country')(
								<Select
									showSearch={true} allowClear={true}
									notFoundContent={countrySearchFetching ? <Spin size="small" /> : null}
									placeholder={i18n.t`Pays`} size="large" filterOption={false}
									onSearch={(value) => this.searchCountries(value)} labelInValue>
									{
										countries? countries.map((country, idx) => {
											return <Option key={idx} value={country['@id']}>{country.name}</Option>;
										}) : null
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>}>
							{getFieldDecorator('phone')(
								<PhoneNumberField form={this.props.form} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>}>
							{getFieldDecorator('fax')(
								<PhoneNumberField form={this.props.form} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>}>
							{getFieldDecorator('email')(
								<Input placeholder={i18n.t`E-mail`} size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Commentaire pour techniciens</Trans></EditableTransWrapper>}>
							{getFieldDecorator('technicianComment')(
								<Input.TextArea placeholder={i18n.t`Commentaire pour techniciens`} size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Commentaire</Trans></EditableTransWrapper>}>
							{getFieldDecorator('comment')(
								<Input.TextArea placeholder={i18n.t`Commentaire`} size="large" />
							)}
						</FormCompItem>
					</Col>
				</Row>
			</div>
		</FormComp>;
	}

	getAddSiteModeSelect = () => {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { addNewSite, selectSite } = this.state;
		const { i18n } = this.props;
		return <div className="add-site-mode-select-wrapper">
			<div className="title">
				<EditableTransWrapper><Trans>Choisir un type de site</Trans></EditableTransWrapper>
			</div>
			<div className="add-site-mode-select">
				<Button
					size ="large" className={classNames({selected: addNewSite})}
					onClick={() => this.setAddSiteMode({
						addNewSite: true,
						selectSite: false
					})}>
					<EditableTransWrapper><Trans>Nouveau site</Trans></EditableTransWrapper>
				</Button>
				<Button
					size ="large" className={classNames({selected: selectSite})}
					onClick={() => this.setAddSiteMode({
						addNewSite: false,
						selectSite: true
					})}>
					<EditableTransWrapper><Trans>Site déjà existant</Trans></EditableTransWrapper>
				</Button>
			</div>
			<FormCompItem>
				{getFieldDecorator('addSiteModeSelected', {
					rules: [{
						required: true,
						message: i18n.t`Veuillez choisir un type de site`,
					}],
				})(
					<Input disabled={true} readOnly={true} style={{display: 'none'}} />
				)}
			</FormCompItem>
		</div>;
	}

	getSelectSiteFormBody = () => {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { sites, siteSearchFetching, linkedSites } = this.state;
		const { i18n } = this.props;
		return <FormComp onSubmit={this.handleSubmit}>
			<Row gutter={20} type="flex" align="top">
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Choisir un site</Trans></EditableTransWrapper>}>
						{getFieldDecorator('site', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez rechercher et sélectionner un site`,
							}],
						})(
							<Select
								showSearch={true} allowClear={true}
								notFoundContent={siteSearchFetching ? <Spin size="small" /> : null}
								placeholder={i18n.t`Rechercher un site`} size="large" filterOption={false}
								onSearch={(value) => this.searchSites(value)} labelInValue>
								{
									sites? sites.map((site, idx) => {
										return <Option
											key={idx} value={site['id']}
											disabled={site.linkedToParentDivision}>
											{site.name + ' '}
											{
												site.linkedToParentDivision ?
													<EditableTransWrapper>
														<Trans>(Déjà ajouté)</Trans>
													</EditableTransWrapper> : null
											}
										</Option>;
									}) : null
								}
							</Select>
						)}
					</FormCompItem>
					<FormCompItem>
						{getFieldDecorator('linkedSites')(
							<Select disabled={true} readOnly={true} style={{display: 'none'}}>
								{
									linkedSites? linkedSites.map((linkedSite, idx) => {
										return <Option
											key={idx} value={linkedSite['@id']}
											disabled={linkedSite.linkedToParentDivision}>
											{linkedSite.name + ' '}
										</Option>;
									}) : null
								}
							</Select>
						)}
					</FormCompItem>
				</Col>
			</Row>
		</FormComp>;
	}

	render() {
		const { ready, isSite, addNewSite, selectSite } = this.state;
		const { subDivision } = this.props;
		// when needed data not ready, show spinner
		if (!ready) {
			return <Spin className="centered-spin" />;
		}
		// when add zone and when modify site / zone, show the sub_division form body only.
		if (!isSite || subDivision) {
			return this.getSubDivisionFormBody();
		}

		// when add new site, show mode select and sub_division form body.
		if (addNewSite) {
			return <div>
				{this.getAddSiteModeSelect()}
				{this.getSubDivisionFormBody()}
			</div>;
		}
		// when select existed site, show mode select and site select.
		if (selectSite) {
			return <div>
				{this.getAddSiteModeSelect()}
				{this.getSelectSiteFormBody()}
			</div>;
		}
		// when add site and mode not selected, show only mode select.
		return this.getAddSiteModeSelect();
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(Form));

export default withRouter(WrappedFormComp);