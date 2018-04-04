import React from 'react';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import Select from 'antd/lib/select';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyBillingInfoForm extends React.Component {

	state = {
		ready: false,
		countries: null,
		countrySearchFetching: false,
	}

	async fetch() {
		this.setState({ready: false});
		await this.searchCountries('france');
		const {countries} = this.state;
		const {form, contract} = this.props;
		const {billingAddress} = contract;
		this.setState({ready: true});
		if (billingAddress){
			let countryValue = billingAddress.country ? {country: {key: billingAddress.country['@id'], label: billingAddress.country.name}} : null;
			form.setFieldsValue({
				...countryValue,
				address:             billingAddress.address,
				addressBis:          billingAddress.addressBis,
				zipCode:             billingAddress.zipCode,
				city:                billingAddress.city,
				clientReference:     contract.clientReference
			});
		} else {
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
		const { i18n } = this.props;
		const { ready, countries, countrySearchFetching } = this.state;
		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<div className="form-section">
					<Row gutter={20} type="flex" align="top">
						<Col xs={24} md={12} className="organisations-street">
							<FormCompItem
								label={<EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>}>
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
						<Col xs={24} md={24}>
							<FormCompItem
								label={<EditableTransWrapper><Trans>Référence à reporter sur les factures</Trans></EditableTransWrapper>}>
								{getFieldDecorator('clientReference')(
									<Input placeholder={i18n.t`Référence à reporter sur les factures`} size="large" />
								)}
							</FormCompItem>
						</Col>
					</Row>
				</div>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(ModifyBillingInfoForm);