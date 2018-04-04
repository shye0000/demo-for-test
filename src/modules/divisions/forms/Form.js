import React from 'react';
import {withRouter} from 'react-router-dom';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import PhoneNumberField from '../../../components/PhoneNumberField';
import './Form.scss';

class Form extends React.Component {

	state = {
		ready: false,
		countries: null,
		submitting: false,
		countrySearchFetching: false,
	}

	async fetch() {
		this.setState({ready: false});
		await this.searchCountries('france');
		const {countries} = this.state;
		const {division, form } = this.props;
		this.setState({ready: true});
		if(division){
			let countryValue = division.country ? {country: {key: division.country['@id'], label: division.country.name}} : null;
			form.setFieldsValue({
				...countryValue,
				name:           division.name,
				siretNumber:    division.siretNumber,
				address:        division.address,
				addressBis:     division.addressBis,
				zipCode:        division.zipCode,
				city:           division.city,
				phone:          division.phone,
				fax:            division.fax,
				email:          division.email,
				comment:        division.comment
			});
		}else{
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

	async componentDidMount() {
		await this.fetch();
		this.searchCountries = debounce(this.searchCountries, 500);
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { countries, ready, countrySearchFetching } = this.state;
		const { i18n, division } = this.props;
		return(
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<FormCompItem className="form-error-field" style={{marginBottom: 0}}>
					{getFieldDecorator('parent')(
						<Input style={{display: 'none'}} disabled={true}/>
					)}
				</FormCompItem>
				<div className="form-section">
					{
						(division && division.parent)?
							<Row className="sous-organisation" gutter={20} type="flex" align="top">
								<Col xs={24} md={12}>
									<span className="sous-organisation-label">Division parente : </span><span>{division.parent.name}</span>
								</Col>
								<Col xs={24} md={12}>
									<span className="sous-organisation-label">Type de division : </span><span>Sous-organisation</span>
								</Col>
							</Row> :null
					}
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
						<Col xs={24} md={12}>
							<FormCompItem
								label={<EditableTransWrapper><Trans>N° Siret</Trans></EditableTransWrapper>}>
								{getFieldDecorator('siretNumber')(
									<Input placeholder={i18n.t`N° Siret`} size="large" />
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
								label={<EditableTransWrapper><Trans>E-mail société</Trans></EditableTransWrapper>}>
								{getFieldDecorator('email')(
									<Input placeholder={i18n.t`E-mail société`} size="large" />
								)}
							</FormCompItem>
						</Col>
						<Col xs={24} md={24}>
							<FormCompItem
								label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
								{getFieldDecorator('comment')(
									<Input.TextArea placeholder={i18n.t`Commentaire interne`} size="large" />
								)}
							</FormCompItem>
						</Col>
					</Row>
				</div>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(Form));

export default withRouter(WrappedFormComp);