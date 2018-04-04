import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import FormComp from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../../apiClient';

class BillingFormBody extends React.Component {

	state = {
		ready: false,
		dataPoint: null,
		factorCodes: null,
		invoiceDueDateDays: null,
		vatRates: null,
		countries: null,
		countrySearchFetching: false
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

	async fetchOptions() {
		this.setState({ready: false});
		const {form, dataPoint} = this.props;
		const dataPointResponse = await apiClient.fetch(dataPoint['@id']);
		const factorCodesResponse = await apiClient.fetch('/factor_codes', {params:{pagination:false}});
		const invoiceDueDateDaysResponse = await apiClient.fetch('/invoices_due_date_days', {params:{pagination:false}});
		const vatRatesResponse = await apiClient.fetch('/vat_rates', {params:{pagination:false}});
		if (dataPointResponse.status ===200
			&& factorCodesResponse.status === 200
			&& invoiceDueDateDaysResponse.status === 200
			&& vatRatesResponse.status ===200) {
			this.setState({
				ready: true,
				dataPoint: dataPointResponse.json,
				factorCodes: factorCodesResponse.json['hydra:member'],
				invoiceDueDateDays: invoiceDueDateDaysResponse.json['hydra:member'],
				vatRates: vatRatesResponse.json['hydra:member']
			}, () => {
				const {dataPoint, invoiceDueDateDays} = this.state;
				let values = {
					address:                 dataPoint.address,
					addressBis:              dataPoint.addressBis,
					zipCode:                 dataPoint.zipCode,
					city:                    dataPoint.city,
					reference:               dataPoint.reference,
					accountabilityCode:      dataPoint.accountabilityCode,
					factorCode:              dataPoint.factorCode ? dataPoint.factorCode['@id'] : undefined,
					vatRate:                 dataPoint.vatRate ? dataPoint.vatRate['@id'] : undefined,
					invoicesDueDateDays:     dataPoint.invoicesDueDateDays ? dataPoint.invoicesDueDateDays : invoiceDueDateDays[0].value,
					internalComment:         dataPoint.internalComment
				};
				if (dataPoint.country) {
					values['country'] = {
						key: dataPoint.country['@id'],
						value: dataPoint.country['@id'],
						label: dataPoint.country.name
					};
				}
				form.setFieldsValue(values);
			});
		}
	}

	componentDidMount() {
		this.fetchOptions();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { countrySearchFetching, countries, vatRates, factorCodes, ready} = this.state;

		return <div className="contact-point-form">
			{
				ready ?
					<FormComp onSubmit={this.handleSubmit}>
						<Row gutter={20} type="flex">
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>}>
									{getFieldDecorator('address')(
										<Input placeholder={i18n.t`Adresse`} size="large" />
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
								<Row gutter={20} type="flex">
									<Col xs={24} md={14}>
										<FormCompItem
											label={<EditableTransWrapper><Trans>Ville</Trans></EditableTransWrapper>}>
											{getFieldDecorator('city')(
												<Input placeholder={i18n.t`Ville`} size="large" />
											)}
										</FormCompItem>
									</Col>
									<Col xs={24} md={10}>
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
									label={<EditableTransWrapper><Trans>Référence pour factures</Trans></EditableTransWrapper>}>
									{getFieldDecorator('reference')(
										<Input placeholder={i18n.t`Référence pour factures`} size="large"/>
									)}
								</FormCompItem>
							</Col>
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Code comptable</Trans></EditableTransWrapper>}>
									{getFieldDecorator('accountabilityCode')(
										<Input placeholder={i18n.t`Code comptables`} size="large"/>
									)}
								</FormCompItem>
							</Col>
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Factor</Trans></EditableTransWrapper>}>
									{getFieldDecorator('factorCode')(
										<Select allowClear={true} placeholder={i18n.t`Factor`} size="large">
											{
												factorCodes.map((factorCode, idx) => {
													return <Option key={idx} value={factorCode['@id']}>{factorCode.company}</Option>;
												})
											}
										</Select>
									)}
								</FormCompItem>
							</Col>
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Taux de TVA</Trans></EditableTransWrapper>}>
									{getFieldDecorator('vatRate')(
										<Select allowClear={true} placeholder={i18n.t`Taux de TVA`} size="large">
											{
												vatRates.map((vatRate, idx) => {
													return <Option key={idx} value={vatRate['@id']}>{vatRate.value + '%'}</Option>;
												})
											}
										</Select>
									)}
								</FormCompItem>
							</Col>
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Echéance des factures</Trans></EditableTransWrapper>}>
									{getFieldDecorator('invoicesDueDateDays')(
										<InputNumber
											min={0}
											placeholder={i18n.t`Echéance des factures`}
											formatter={value => {
												let v = value;
												if (value.replace) {
													v = value.replace(/[a-zA-Z\s]/g, '');
													return v > 1 ?  `${v} ${i18n.t`jours`}` : `${v} ${i18n.t`jour`}`;
												}
												return v;
											}}
											parser={value => value.replace(/[a-zA-Z\s]/g, '')}
											size="large" style={{width: '100%'}} className="Number"/>
									)}
								</FormCompItem>
							</Col>
							<Col md={24}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
									{getFieldDecorator('internalComment')(
										<Input.TextArea placeholder={i18n.t`Commentaire interne`} style={{width: '100%'}}/>
									)}
								</FormCompItem>
							</Col>
						</Row>
					</FormComp> : <Spin className="centered-spin" />
			}
		</div>;
	}
}

export default withI18n()(BillingFormBody);