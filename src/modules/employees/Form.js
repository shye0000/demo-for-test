import React from 'react';
import {withRouter} from 'react-router-dom';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import FormComp from 'antd/lib/form';
import notification from 'antd/lib/notification';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Button from 'antd/lib/button';
import InputNumber from 'antd/lib/input-number';
import Spin from 'antd/lib/spin';
import Card from 'antd/lib/card';
import DatePicker from 'antd/lib/date-picker';
import Genders from '../../apiConstants/Genders';
import ContractTypes from '../../apiConstants/ContractEmployeeTypes';
import EmployeeTypes from '../../apiConstants/EmployeeTypes';
import FileUpload from '../../components/FileUpload';
import {Trans, withI18n} from 'lingui-react';
import apiClient from '../../apiClient';
import debounce from 'lodash.debounce';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';
import PhoneNumberField from '../../components/PhoneNumberField';
import './Form.scss';

class Form extends React.Component {

	constructor(props) {
		super(props);
		this.searchCountries = debounce(this.searchCountries, 500);
	}

	state = {
		ready: false,
		services: null,
		skills: null,
		countries: null,
		submitting: false,
		countrySearchFetching: false
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, i18n, history} = this.props;
		form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				// reset api form errors
				let fieldValues = {};
				Object.keys(values).forEach(key => {
					fieldValues[key] = {
						value: values[key]
					};
				});
				form.setFields(fieldValues);
				this.setState({submitting: true});
				apiClient.fetch('/employees', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined({
						...values,
						nationality: values.nationality ? values.nationality.key : null,
						mutual: values.mutual ? true : false
					})
				}).then(
					(response) => {
						this.setState({submitting: false});
						history.push('/employees/' + response.json.id);
						notification['success']({
							message: i18n.t`Le salarié a été bien ajouté.`,
							className: 'qhs-notification success'
						});
					},
					(error) => {
						error.response.json().then(
							(body) => {
								if (body.violations && body.violations.length) {
									let fields = {};
									for(let i = 0; i < body.violations.length; i++) {
										const fieldError = body.violations[i];
										if (!fields[fieldError.propertyPath]) {
											fields[fieldError.propertyPath] = {
												value: values[fieldError.propertyPath],
												errors: []
											};
										}
										fields[fieldError.propertyPath].errors.push(new Error(fieldError.message));
									}
									form.setFields(fields);
								}
								this.setState({submitting: false});
								notification['error']({
									message: i18n.t`Le salarié n'a pas été ajouté.`,
									className: 'qhs-notification error'
								});
							}
						);

					}
				);
			}
		});
	}

	async fetch() {
		this.setState({ready: false});
		const servicesResponse = await apiClient.fetch('/services', {params:{pagination:false}});
		const skillsResponse  = await apiClient.fetch('/skills', {params:{pagination:false}});
		if (servicesResponse.status === 200 && skillsResponse.status === 200) {
			this.setState({
				ready: true,
				services: servicesResponse.json['hydra:member'],
				skills: skillsResponse.json['hydra:member']
			});
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
		const RadioGroup = Radio.Group;
		const { getFieldDecorator } = this.props.form;
		const { services, skills, countries, ready, submitting, countrySearchFetching } = this.state;
		const { i18n } = this.props;
		return(
			<div className="form">
				<div className="form-content">
					<Card title={
						<div className="form-title">
							<Icon type="plus-circle-o" />
							<EditableTransWrapper><Trans>{'Ajouter un salarié'}</Trans></EditableTransWrapper>
						</div>
					}>
						{
							ready ? <FormComp onSubmit={this.handleSubmit}>

								<div className="form-section">
									<div className="section-title">
										<EditableTransWrapper><Trans>Informations personnelles</Trans></EditableTransWrapper>
									</div>
									<Row gutter={20} type="flex" align="top">
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
													<Select placeholder={i18n.t`Genre`} size="large" allowClear={true}>
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
										<Col xs={24} md={12} >
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
								</div>

								<div className="form-section">
									<div className="section-title">
										<EditableTransWrapper><Trans>Informations professionnelles</Trans></EditableTransWrapper>
									</div>
									<Row gutter={20} type="flex" align="top">
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>}>
												{getFieldDecorator('services', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner au moins une service`
													}],
												})(
													<Select
														allowClear={true} placeholder={i18n.t`Services`}
														mode="multiple" size="large">
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
													<Select
														allowClear={true}
														placeholder={i18n.t`Type de salarié`}
														size="large">
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
												label={<EditableTransWrapper><Trans>Compétences</Trans></EditableTransWrapper>}>
												{getFieldDecorator('skills', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner au moins une compétence`,
													}],
												})(
													<Select
														allowClear={true}
														placeholder={i18n.t`Compétences`}
														mode="multiple" size="large">
														{
															skills.map((skill, idx) => {
																return <Option key={idx} value={skill['@id']}>{skill.label}</Option>;
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
								</div>

								<div className="form-section">
									<div className="section-title">
										<EditableTransWrapper><Trans>Informations complémentaires</Trans></EditableTransWrapper>
									</div>
									<Row gutter={20} type="flex" align="top">
										<Col xs={24} md={12}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Type de contrat</Trans></EditableTransWrapper>}>
												{getFieldDecorator('contractType', {
													rules: [{
														required: true,
														message: i18n.t`Veuillez renseigner le type de contrat`,
													}]
												})(
													<Select
														allowClear={true}
														placeholder={i18n.t`Type de contrat`}
														size="large">
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
												label={
													<EditableTransWrapper><Trans>{'Nombre d\'heures dans le contrat de travail'}</Trans></EditableTransWrapper>
												}>
												{getFieldDecorator('contractHours')(
													<InputNumber
														placeholder={i18n.t`Nombre d'heures dans le contrat de travail`}
														style={{width: '100%'}} min={0} size="large"/>
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
														<Radio value={1}>
															<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
														</Radio>
														<Radio value={0}>
															<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>
														</Radio>
													</RadioGroup>
												)}
											</FormCompItem>
										</Col>
										<Col span={24}>
											<FormCompItem
												label={<EditableTransWrapper><Trans>Commentaire</Trans></EditableTransWrapper>}>
												{getFieldDecorator('comment')(
													<Input.TextArea
														placeholder={i18n.t`Commentaire`}
														style={{width: '100%'}}/>
												)}
											</FormCompItem>
										</Col>
									</Row>
								</div>

								<div className="form-buttons">
									<FormCompItem>
										<Button size="large" type="primary" loading={submitting} htmlType="submit">
											<EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>
										</Button>
									</FormCompItem>
									<FormCompItem>
										<Button size="large" onClick={() => this.props.history.push('/employees')}>
											<EditableTransWrapper><Trans>Annuler</Trans></EditableTransWrapper>
										</Button>
									</FormCompItem>
								</div>
							</FormComp> : <Spin className="centered-spin" />
						}
					</Card>
				</div>
			</div>
		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(Form));

export default withRouter(WrappedFormComp);