import React from 'react';
import moment from 'moment';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Tabs from 'antd/lib/tabs';
import Radio from 'antd/lib/radio';
import InputNumber from 'antd/lib/input-number';
import Spin from 'antd/lib/spin';
import DatePicker from 'antd/lib/date-picker';
import Genders from '../../apiConstants/Genders';
import ContractTypes from '../../apiConstants/ContractEmployeeTypes';
import FileUpload from '../../components/FileUpload';
import debounce from 'lodash.debounce';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import './ModifyEmployeeForm.scss';
import EmployeeTypes from '../../apiConstants/EmployeeTypes';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import PhoneNumberField from '../../components/PhoneNumberField';

class ModifyEmployeeForm extends React.Component {

	constructor(props) {
		super(props);
		this.searchCountries = debounce(this.searchCountries, 500);
	}

	state = {
		ready: false,
		services: null,
		employee: null,
		countries: null,
		submitting: false,
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

	async fetch() {
		const {employee, form} = this.props;
		this.setState({ready: false});
		const employeeResponse = await apiClient.fetch(employee['@id']);
		const servicesResponse = await apiClient.fetch('/services', {params:{pagination:false}});
		if (servicesResponse.status === 200 && employeeResponse.status === 200) {
			const employee = employeeResponse.json;
			this.setState({
				ready: true,
				services: servicesResponse.json['hydra:member'],
				employee: employee
			}, () => {
				const {employee} = this.state;
				let values = {
					lastName:                employee.lastName,
					firstName:               employee.firstName,
					email:                   employee.email,
					employeeType:            employee.employeeType,
					contractType:            employee.contractType,
					dateIn:                  employee.dateIn ? moment(employee.dateIn) : null,
					dateOut:                 employee.dateOut ? moment(employee.dateOut) : null,
					contractHours:           employee.contractHours,
					driverLicenseNumber:     employee.driverLicenseNumber,
					socialSecurityNumber:    employee.socialSecurityNumber,
					mutual:                  employee.mutual ? 1 : 0,
					birthday:                employee.birthday ? moment(employee.birthday) : null,
					phone:                   employee.phone,
					comment:                 employee.comment,
					gender:                  employee.gender,
					services:                employee.services.map((service) => service['@id']),
					address:                 employee.address,
					addressBis:              employee.addressBis,
					zipCode:                 employee.zipCode,
					city:                    employee.city,
					photo:                   employee.photo ? employee.photo['@id'] : null
				};
				if (employee.nationality) {
					values['nationality'] = {
						key: employee.nationality['@id'],
						value: employee.nationality['@id'],
						label: employee.nationality.name
					};
				}
				form.setFieldsValue(values);
			});
		}
	}

	componentDidMount() {
		this.fetch();
	}

	uploadSuccess = (filePromise) => {
		const {form} = this.props;
		filePromise.then((fileData) => {
			form.setFieldsValue({
				photo: fileData['@id']
			});
		});

	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const TabPane = Tabs.TabPane;
		const RadioGroup = Radio.Group;
		const { getFieldDecorator } = this.props.form;
		const { services, ready, countries, countrySearchFetching } = this.state;
		const { i18n } = this.props;
		return(
			<div className="modify-employee-form">
				{
					ready ? <div>
						<FormComp onSubmit={this.handleSubmit}>
							<Tabs defaultActiveKey="1" className="skills-form-tabs">
								<TabPane tab={<div className="tab-title">
									<EditableTransWrapper><Trans>Info. Personnelles</Trans></EditableTransWrapper>
								</div>} key="1">
									<Row gutter={20}>
										<Col span={24}>
											<FileUpload
												apiClient={apiClient} title={
													<EditableTransWrapper><Trans>Photo du salarié</Trans></EditableTransWrapper>
												}
												uploadSuccessCallback={this.uploadSuccess}/>
											<FormCompItem>
												{getFieldDecorator('photo')(
													<Input style={{display: 'none'}}/>
												)}
											</FormCompItem>
										</Col>
									</Row>
									<Row gutter={20} type="flex">
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Prénom</Trans></EditableTransWrapper>}>
												{getFieldDecorator('firstName', {
													rules: [ {
														required: true,
														message: i18n.t`Veuillez renseigner le prénom`,
													}],
												})(
													<Input placeholder={i18n.t`Prénom`} size="large" />
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>}>
												{getFieldDecorator('lastName', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner le nom`,
													}],
												})(
													<Input placeholder={i18n.t`Nom`} size="large" />
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Genre</Trans></EditableTransWrapper>}>
												{getFieldDecorator('gender', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner le genre`,
													}],
												})(
													<Select
														allowClear={true}
														placeholder={i18n.t`Genre`}
														size="large">
														{
															Genders.map((gender, idx) => {
																return <Option key={idx} value={gender.value}>{gender.label}</Option>;
															})
														}
													</Select>
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Nationalité</Trans></EditableTransWrapper>}>
												{getFieldDecorator('nationality')(
													<Select
														showSearch={true} allowClear={true}
														notFoundContent={countrySearchFetching ? <Spin size="small" /> : null}
														placeholder={i18n.t`Nationalité`} size="large" filterOption={false}
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
												label={<EditableTransWrapper><Trans>Date de naissance</Trans></EditableTransWrapper>}>
												{getFieldDecorator('birthday')(
													<DatePicker
														format="DD/MM/YYYY"
														placeholder={i18n.t`JJ/MM/AAAA`}
														size="large"
														style={{width: '100%'}}/>
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
												label={<EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>}>
												{getFieldDecorator('email')(
													<Input placeholder={i18n.t`E-mail`} size="large" />
												)}
											</FormCompItem>
										</Col>
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
									</Row>
								</TabPane>
								<TabPane tab={<div className="tab-title">
									<EditableTransWrapper><Trans>Info. Professionnelles</Trans></EditableTransWrapper>
								</div>} key="2">
									<Row gutter={20} type="flex">
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>}>
												{getFieldDecorator('services', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner au moins une service`
													}],
												})(
													<Select allowClear={true} placeholder={i18n.t`Services`} mode="multiple" size="large">
														{
															services.map((service, idx) => {
																return <Option key={idx} value={service['@id']}>{service.label}</Option>;
															})
														}
													</Select>
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Type de salarié</Trans></EditableTransWrapper>}>
												{getFieldDecorator('employeeType', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner le type de salarié`,
													}]
												})(
													<Select allowClear={true} placeholder={i18n.t`Type de salarié`} size="large">
														{
															EmployeeTypes.map((type, idx) => {
																return <Option key={idx} value={type.value}>{type.label}</Option>;
															})
														}
													</Select>
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>{'Date d\'entrée'}</Trans></EditableTransWrapper>}>
												{getFieldDecorator('dateIn')(
													<DatePicker
														disabledDate={this.disabledStartDate}
														format="DD/MM/YYYY"
														placeholder={i18n.t`JJ/MM/AAAA`}
														size="large"
														style={{width: '100%'}}
														onChange={this.onStartChange}
													/>

												)}

											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Date de sortie</Trans></EditableTransWrapper>}>
												{getFieldDecorator('dateOut')(
													<DatePicker
														disabledDate={this.disabledEndDate}
														format="DD/MM/YYYY"
														placeholder={i18n.t`JJ/MM/AAAA`}
														size="large"
														style={{width: '100%'}}
														onChange={this.onEndChange}
													/>
												)}

											</FormCompItem>
										</Col>
									</Row>
								</TabPane>
								<TabPane tab={<div className="tab-title">
									<EditableTransWrapper><Trans>Info. Complémentaires</Trans></EditableTransWrapper>
								</div>} key="3">
									<Row gutter={20} type="flex">
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Type de contrat</Trans></EditableTransWrapper>}>
												{getFieldDecorator('contractType', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner le type de contrat`,
													}]
												})(
													<Select allowClear={true} placeholder={i18n.t`Type de contrat`} size="large">
														{
															ContractTypes.map((type, idx) => {
																return <Option key={idx} value={type.value}>{type.label}</Option>;
															})
														}
													</Select>
												)}
											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>{'Nombre d\'heures dans le contrat de travail'}</Trans></EditableTransWrapper>}>
												{getFieldDecorator('contractHours')(
													<InputNumber placeholder={i18n.t`Heures contrat`} style={{width: '100%'}} min={0} size="large"/>
												)}

											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>N° de permis</Trans></EditableTransWrapper>}>
												{getFieldDecorator('driverLicenseNumber')(
													<Input placeholder={i18n.t`N° de permis`} size="large" />
												)}

											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>N° de sécu. sociale</Trans></EditableTransWrapper>}>
												{getFieldDecorator('socialSecurityNumber')(
													<Input placeholder={i18n.t`N° de sécu. sociale`} size="large" />
												)}

											</FormCompItem>
										</Col>
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Mutuelle</Trans></EditableTransWrapper>}>
												{getFieldDecorator('mutual')(
													<RadioGroup size="large">
														<Radio value={1}>Oui</Radio>
														<Radio value={0}>Non</Radio>
													</RadioGroup>
												)}
											</FormCompItem>
										</Col>
										<Col span={24}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Commentaire</Trans></EditableTransWrapper>}>
												{getFieldDecorator('comment')(
													<Input.TextArea placeholder={i18n.t`Commentaire`} style={{width: '100%'}}/>
												)}
											</FormCompItem>
										</Col>
									</Row>
								</TabPane>
							</Tabs>
						</FormComp>
					</div> : <Spin className="centered-spin" />
				}
			</div>
		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(ModifyEmployeeForm));

export default WrappedFormComp;