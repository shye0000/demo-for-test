import React from 'react';
import {withRouter} from 'react-router-dom';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import moment from 'moment';
import FormComp from 'antd/lib/form';
import Tooltip from 'antd/lib/tooltip';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import InputNumber from 'antd/lib/input-number';
import Spin from 'antd/lib/spin';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import DatePicker from 'antd/lib/date-picker';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import ContractTypes from '../../../apiConstants/ContractTypes';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Form.scss';

class Form extends React.Component {

	constructor(props) {
		super(props);
	}

	state = {
		divisions: [],
		commercials: null,
		ready: false,
		submitting: false,
		countries: null,
		countrySearchFetching: false,
		divisionSearchFetching: false,
		activeAll: undefined,
		activatedFields: []
	}

	setModifyDefaultValues = () => {
		const {form, contract} = this.props;
		if (contract && contract.nature === 2) { // modify contract
			form.setFieldsValue({
				autoLiquidation        : contract.autoLiquidation.toString(),
				clientAddress          : {
					address                : contract.clientAddress.address,
					addressBis             : contract.clientAddress.addressBis,
					city                   : contract.clientAddress.city,
					zipCode                : contract.clientAddress.zipCode,
					country                : contract.clientAddress.country ? {
						key:   contract.clientAddress.country['@id'],
						value: contract.clientAddress.country['@id'],
						label: contract.clientAddress.country.name
					} : undefined
				},
				comment                : contract.comment,
				commercial             : contract.commercial['@id'],
				dc4Mode                : contract.dc4Mode.toString(),
				division               : {
					key: contract.division['@id'],
					value: contract.division['@id'],
					label: contract.division.name
				},
				duration               : contract.duration,
				linkedToPurchaseOrders : contract.linkedToPurchaseOrders.toString(),
				note                   : contract.note,
				startDate              : contract.startDate ? moment(contract.startDate) : null,
				tacitRenewal           : contract.tacitRenewal.toString(),
				type                   : contract.type
			});
		}
		if (contract && contract.nature === 3) { // modify quotation
			form.setFieldsValue({
				autoLiquidation        : contract.autoLiquidation.toString(),
				clientAddress          : {
					address                : contract.clientAddress.address,
					addressBis             : contract.clientAddress.addressBis,
					city                   : contract.clientAddress.city,
					zipCode                : contract.clientAddress.zipCode,
					country                : contract.clientAddress.country ? {
						key:   contract.clientAddress.country['@id'],
						value: contract.clientAddress.country['@id'],
						label: contract.clientAddress.country.name
					} : undefined
				},
				comment                : contract.comment,
				commercial             : contract.commercial['@id'],
				division               : {
					key: contract.division['@id'],
					value: contract.division['@id'],
					label: contract.division.name
				},
				duration               : contract.duration,
				linkedToPurchaseOrders : contract.linkedToPurchaseOrders.toString(),
				note                   : contract.note,
				startDate              : contract.startDate ? moment(contract.startDate) : null,
				tacitRenewal           : contract.tacitRenewal.toString(),
				type                   : contract.type
			});
		}

		if (contract && contract.nature === 1) { // modify additional clause
			form.setFieldsValue({
				comment                : contract.comment,
				commercial             : contract.commercial['@id'],
				note                   : contract.note
			});
		}
	}

	setActivatedFields = (noDivision) => {
		const {contract} = this.props;
		let activatedFields = [];
		let activeAll = false;
		if (noDivision) {
			activatedFields = ['division'];
		} else if (contract && contract.nature === 2) { // modify contract
			switch (contract.status) {
				case 1:
					activeAll = true;
					break;
				case 2:
				case 3:
				case 5:
				case 7:
				case 8:
					break;
				case 4:
				case 6:
					activatedFields = ['dc4Mode', 'autoLiquidation', 'linkedToPurchaseOrders'];
					break;
			}
		} else if (contract && contract.nature === 3) {
			switch (contract.status) {
				case 1:
					activeAll = true;
					break;
				case 2:
				case 3:
				case 5:
				case 7:
				case 8:
					break;
				case 4:
				case 6:
					activatedFields = ['autoLiquidation', 'linkedToPurchaseOrders'];
					break;
			}
		} else if (contract && contract.nature === 1) { // modify additional clause
			switch (contract.status) {
				case 1:
					activeAll = true;
					break;
				default:
					break;
			}
		} else {
			activeAll = true;
		}
		this.setState({activeAll, activatedFields});

	}

	setCreationDefaultValue = (defaultClientAddressValue, defaultDivisionValue) => {
		let values;
		const {form} = this.props;
		const {nature} = this.props.match.params;
		values = {
			duration: 12,
			clientAddress: defaultClientAddressValue,
			...defaultDivisionValue,
			tacitRenewal : 'false',
			linkedToPurchaseOrders: 'false',
			autoLiquidation: 'false'
		};
		if (nature === '2') {
			values.dc4Mode = 'false';
		}
		form.setFieldsValue(values);
	}

	async fetch() {
		this.setState({ready: false});
		const {contract} = this.props;
		const {divisionId} = this.props.match.params;
		let defaultClientAddressValue, fetchDivisionResponse, defaultDivisionValue, defaultDivision;
		if (divisionId) {
			fetchDivisionResponse = await apiClient.fetch('/divisions/' + divisionId);
		}
		await this.searchCountries('france');
		const commercialResponse = await apiClient.fetch('/employees', {
			params:{
				employeeType: 2,
				pagination: false,
				'order[fullName]': 'ASC'

			}
		});

		const {countries} = this.state;
		for(let country of  countries){
			if(country && country.name === 'France' && country.code === 'FR'){
				defaultClientAddressValue = {
					country: {
						key: country['@id'],
						value: country['@id'],
						label: country.name
					}
				};
			}
		}

		if (fetchDivisionResponse && fetchDivisionResponse.status === 200) {
			defaultDivision = fetchDivisionResponse.json;
		}

		if (defaultDivision && defaultDivision.canHaveContracts) {
			defaultDivisionValue = {
				division: {
					key: defaultDivision['@id'],
					value: defaultDivision['@id'],
					label: this.getDivisionFullName(defaultDivision)
				}
			};
			defaultClientAddressValue = {
				address: defaultDivision.address,
				addressBis: defaultDivision.addressBis,
				city: defaultDivision.city,
				zipCode: defaultDivision.zipCode,
				country: defaultDivision.country ? {
					key: defaultDivision.country['@id'],
					value: defaultDivision.country['@id'],
					label: defaultDivision.country.name
				} : undefined
			};
		}

		if ( commercialResponse.status === 200 ) {
			this.setState({
				ready: true,
				commercials: commercialResponse.json['hydra:member']
			});
			if (contract){
				this.setModifyDefaultValues();
				this.setActivatedFields();
			} else {
				this.setActivatedFields(!defaultDivisionValue);
				this.setCreationDefaultValue(defaultClientAddressValue, defaultDivisionValue);
			}
		}
	}

	getDivisionFullName = (division) => {
		return division.parent ?
			`${division.parent.name} > ${division.name}`
			:
			division.name;
	}

	async searchDivisions(searchDivisionValue) {
		if (searchDivisionValue) {
			this.setState({ divisions: [], divisionSearchFetching: true });
			const searchDivisionsResponse  = await apiClient.fetch('/divisions', {
				params: {
					search: searchDivisionValue,
					pagination: false,
					'order[name]': 'ASC'
				}
			});
			if (searchDivisionsResponse.status === 200) {
				this.setState({
					divisionSearchFetching: false,
					divisions: searchDivisionsResponse.json['hydra:member']
						.filter(division => division.canHaveContracts)
						.map((division) => {
							const fullName = this.getDivisionFullName(division);
							return {...division, fullName};
						})
						.sort((a, b) => {
							if(a.fullName < b.fullName) return -1;
							if(a.fullName > b.fullName) return 1;
							return 0;
						})
				});
			}
		} else {
			this.setState({ divisions: [] });
		}
	}

	handleDivisionChange = (value) => {
		let clientAddressValue;
		const {form, contract} = this.props;
		if (contract && contract.nature === 1) {
			return;
		}
		if (value) {
			const {divisions} = this.state;
			const selectedDivisionId = value.key;
			const selectedDivision  = divisions.find((division) => division['@id'] === selectedDivisionId);
			clientAddressValue = {
				address: selectedDivision.address,
				addressBis: selectedDivision.addressBis,
				zipCode: selectedDivision.zipCode,
				city: selectedDivision.city,
				country: selectedDivision.country ? {
					key: selectedDivision.country['@id'],
					value: selectedDivision.country['@id'],
					label: selectedDivision.country.name
				} : undefined
			};
			form.setFieldsValue({
				clientAddress: clientAddressValue
			});
			this.setActivatedFields();
		} else {
			clientAddressValue = {
				address: undefined,
				addressBis: undefined,
				city: undefined,
				zipCode: undefined,
				country: undefined
			};
			form.setFieldsValue({
				clientAddress: clientAddressValue
			});
			this.setActivatedFields(true);
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
		this.searchDivisions = debounce(this.searchDivisions, 500);
	}

	isFieldDisabled = (fieldName) => {
		const { activeAll, activatedFields} = this.state;
		return !activeAll && !activatedFields.includes(fieldName);
	}

	getFormBody = () => {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { countries, countrySearchFetching, divisions, commercials, divisionSearchFetching } = this.state;
		const { i18n, contract, match } = this.props;
		let {nature} = match.params;
		if (contract) {
			nature = contract.nature;
		}
		nature = parseInt(nature);
		if (contract && nature === 1) { // modify additional clause
			return <Row gutter={20} type="flex" align="top">
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Commercial en charge</Trans></EditableTransWrapper>}>
						{getFieldDecorator('commercial', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner un commercial en charge`,
							}],
						})(
							<Select
								size="large" allowClear={true} placeholder="Commercial en charge"
								disabled={this.isFieldDisabled('commercial')}
							>
								{
									commercials.map((commercial, idx) => {
										return <Option key={idx} value={commercial['@id']}>{commercial.firstName +' '+commercial.lastName}</Option>;
									})
								}
							</Select>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Note de bas de tableau</Trans></EditableTransWrapper>}>
						{getFieldDecorator('note')(
							<Input
								placeholder={i18n.t`Note de bas de tableau`} size="large"
								disabled={this.isFieldDisabled('note')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
						{getFieldDecorator('comment')(
							<Input
								placeholder={i18n.t`Commentaire interne`} size="large"
								disabled={this.isFieldDisabled('comment')}
							/>
						)}
					</FormCompItem>
				</Col>
			</Row>;
		}
		if (!contract || nature === 2 || nature === 3) { // add / modify contract / quotation

			const autoLiquidationCol = nature === 2 ? 6 : 12;

			return <Row gutter={20} type="flex" align="top">
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Organisation ou sous-organisation</Trans></EditableTransWrapper>}>
						{getFieldDecorator('division', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner une organisation`,
							}],
						})(
							<Select
								filterOption={false}
								notFoundContent={divisionSearchFetching ? <Spin size="small" /> : null}
								showSearch={true}
								placeholder={i18n.t`Organisation`}
								size="large"
								disabled={this.isFieldDisabled('division')}
								allowClear={true}
								onSearch={(value) => this.searchDivisions(value)}
								onChange={this.handleDivisionChange}
								labelInValue >
								{
									divisions.map((division, idx) => {
										return <Option key={idx} value={division['@id']}>
											{division.fullName}
										</Option>;
									})
								}
							</Select>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Date de début</Trans></EditableTransWrapper>}>
						{getFieldDecorator('startDate', {
							rules: [ {
								required: true,
								message: i18n.t`Veuillez renseigner la date de début du contrat`,
							}],
						})(
							<DatePicker
								format="DD/MM/YYYY"
								placeholder={i18n.t`JJ/MM/AAAA`}
								size="large"
								disabled={this.isFieldDisabled('startDate')}
								style={{width: '100%'}}/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Type de contrat</Trans></EditableTransWrapper>}>
						{getFieldDecorator('type', {
							rules: [ {
								required: true,
								message: i18n.t`Veuillez renseigner le type de contrat`,
							}],
						})(
							<Select
								allowClear={true} placeholder={i18n.t`Type de contrat`}
								size="large" disabled={this.isFieldDisabled('type')}>
								{
									ContractTypes.map((type, idx) => {
										return <Option key={idx} value={type.value} title={type.label}>
											<span>{type.label}</span>
											<Tooltip title={type.constant} placement="right">
												<span>
													<IconSvg
														className="icon-info"
														type={import('../../../../icons/info.svg')}
													/>
												</span>
											</Tooltip>
										</Option>;
									})
								}
							</Select>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={6}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Durée (mois)</Trans></EditableTransWrapper>}>
						{getFieldDecorator('duration', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner ce champ`,
							}],
						})(
							<InputNumber
								min={1} style={{width: '100%'}} size="large"
								disabled={this.isFieldDisabled('duration')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={6}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Reconduction tacite</Trans></EditableTransWrapper>}>
						{getFieldDecorator('tacitRenewal')(
							<Select
								size="large" allowClear={true} placeholder={i18n.t`Reconduction tacite`}
								disabled={this.isFieldDisabled('tacitRenewal')} >
								<Option key={0} value="true">Oui</Option>
								<Option key={1} value="false">Non</Option>
							</Select>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Sur bon de commande</Trans></EditableTransWrapper>}>
						{getFieldDecorator('linkedToPurchaseOrders')(
							<Select
								size="large" allowClear={true} placeholder={i18n.t`Sur bon de commande`}
								disabled={this.isFieldDisabled('linkedToPurchaseOrders')} >
								<Option key={0} value="true">Oui</Option>
								<Option key={1} value="false">Non</Option>
							</Select>
						)}
					</FormCompItem>
				</Col>
				{ nature === 2 ?
					<Col xs={24} md={6}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Mode DC4</Trans></EditableTransWrapper>}>
							{getFieldDecorator('dc4Mode')(
								<Select
									size="large" allowClear={true} placeholder={i18n.t`Mode DC4`}
									disabled={this.isFieldDisabled('dc4Mode')}
								>
									<Option key={0} value="true">Oui</Option>
									<Option key={1} value="false">Non</Option>
								</Select>
							)}
						</FormCompItem>
					</Col> : null }
				<Col xs={24} md={autoLiquidationCol}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Client en auto-liquidation</Trans></EditableTransWrapper>}>
						{getFieldDecorator('autoLiquidation')(
							<Select
								size="large" allowClear={true} disabled={this.isFieldDisabled('autoLiquidation')}
								placeholder={i18n.t`Client en auto-liquidation`}>
								<Option key={0} value="true">Oui</Option>
								<Option key={1} value="false">Non</Option>
							</Select>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Adresse</Trans></EditableTransWrapper>}>
						{getFieldDecorator('clientAddress.address')(
							<Input
								placeholder={i18n.t`Adresse de contrat`} size="large"
								disabled={this.isFieldDisabled('clientAddress.address')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>{'Complément d\'adresse'}</Trans></EditableTransWrapper>}>
						{getFieldDecorator('clientAddress.addressBis')(
							<Input
								placeholder={i18n.t`Complément d'adresse`} size="large"
								disabled={this.isFieldDisabled('clientAddress.addressBis')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={4}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Code postal</Trans></EditableTransWrapper>}>
						{getFieldDecorator('clientAddress.zipCode')(
							<Input
								placeholder={i18n.t`Code postal`} size="large"
								disabled={this.isFieldDisabled('clientAddress.zipCode')} />
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={8}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Ville</Trans></EditableTransWrapper>}>
						{getFieldDecorator('clientAddress.city')(
							<Input
								placeholder={i18n.t`Ville`} size="large"
								disabled={this.isFieldDisabled('clientAddress.city')} />
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Pays</Trans></EditableTransWrapper>}>
						{getFieldDecorator('clientAddress.country')(
							<Select
								showSearch={true} allowClear={true}
								disabled={this.isFieldDisabled('clientAddress.country')}
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
						label={<EditableTransWrapper><Trans>Note de bas de tableau</Trans></EditableTransWrapper>}>
						{getFieldDecorator('note')(
							<Input
								placeholder={i18n.t`Note de bas de tableau`} size="large"
								disabled={this.isFieldDisabled('note')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
						{getFieldDecorator('comment')(
							<Input
								placeholder={i18n.t`Commentaire interne`} size="large"
								disabled={this.isFieldDisabled('comment')}
							/>
						)}
					</FormCompItem>
				</Col>
				<Col xs={24} md={12}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Commercial en charge</Trans></EditableTransWrapper>}>
						{getFieldDecorator('commercial', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner un commercial en charge`,
							}],
						})(
							<Select
								size="large" allowClear={true} placeholder="Commercial en charge"
								disabled={this.isFieldDisabled('commercial')}
							>
								{
									commercials.map((commercial, idx) => {
										return <Option key={idx} value={commercial['@id']}>{commercial.firstName +' '+commercial.lastName}</Option>;
									})
								}
							</Select>
						)}
					</FormCompItem>
				</Col>
			</Row>;
		}
	}

	render() {
		const { ready } = this.state;
		return(
			ready ? <FormComp onSubmit={this.handleSubmit}>
				{this.getFormBody()}
			</FormComp> : <Spin className="centered-spin" />

		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(Form));

export default withRouter(WrappedFormComp);