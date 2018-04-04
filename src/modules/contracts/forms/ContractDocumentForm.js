import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import FileUpload from '../../../components/FileUpload/index';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import Radio from 'antd/lib/radio';
import DatePicker from 'antd/lib/date-picker';
import ContractDocumentTypes from '../../../apiConstants/ContractDocumentTypes';

class ContractDocumentForm extends React.Component {

	state = {
		ready: false,
		contractDocument: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {contractDocument} = this.state;

		if (contractDocument) {
			form.setFieldsValue({
				document: contractDocument.document['@id']
			});
		}
	}

	async fetch() {
		const {contractDocument} = this.props;
		this.setState({ready: false});

		let contractDocumentResponse = null;
		if (contractDocument) {
			contractDocumentResponse = await apiClient.fetch(contractDocument['@id']);
		}

		if ((!contractDocumentResponse || contractDocumentResponse.status === 200)) {
			this.setState({
				ready: true,
				contractDocument: contractDocumentResponse ? contractDocumentResponse.json : null
			}, () => {
				this.setDefaultValues();
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
				document: fileData['@id']
			});
		});
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const RadioGroup = Radio.Group;
		const { getFieldDecorator } = this.props.form;
		const { ready } = this.state;
		const { i18n } = this.props;

		const type = this.props.form.getFieldValue('type');
		const continuedValidity = this.props.form.getFieldValue('continuedValidity');

		let titleField = null;
		let purchaseOrderNumberField = null;
		let validityStartDateField = null;
		let validityEndDateField = null;

		if (ready) {
			if (type == 4) {
				titleField = <Col xs={24} md={12}>
					<FormCompItem label={<EditableTransWrapper><Trans>Titre</Trans></EditableTransWrapper>}>
						{getFieldDecorator('title', {
							rules: [{required: true, message: i18n.t`Veuillez renseigner le titre`}],
						})(
							<Input size="large" style={{width: '100%'}} placeholder={i18n.t`Titre`}/>
						)}
					</FormCompItem>
				</Col>;
			}

			if (type == 1) {
				purchaseOrderNumberField = <Col xs={24} md={12}>
					<FormCompItem label={<EditableTransWrapper><Trans>Numéro de bon de commande</Trans></EditableTransWrapper>}>
						{getFieldDecorator('purchaseOrderNumber', {
							rules: [{required: true, message: i18n.t`Veuillez renseigner le numéro de bon de commande`}],
						})(
							<Input size="large" style={{width: '100%'}} placeholder={i18n.t`Numéro de bon de commande`}/>
						)}
					</FormCompItem>
				</Col>;
			}

			if (continuedValidity == 0) {
				validityStartDateField = <Col xs={24} md={12}>
					<FormCompItem label={<EditableTransWrapper><Trans>Début de validité</Trans></EditableTransWrapper>}>
						{getFieldDecorator('validityStartDate', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner la date de début de validité`,
							}],
						})(
							<DatePicker format="DD/MM/YYYY" placeholder={i18n.t`JJ/MM/AAAA`} size="large" style={{width: '100%'}}/>
						)}
					</FormCompItem>
				</Col>;
				validityEndDateField = <Col xs={24} md={12}>
					<FormCompItem label={<EditableTransWrapper><Trans>Fin de validité</Trans></EditableTransWrapper>}>
						{getFieldDecorator('validityEndDate', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez renseigner la date de fin de validité`,
							}],
						})(
							<DatePicker format="DD/MM/YYYY" placeholder={i18n.t`JJ/MM/AAAA`} size="large" style={{width: '100%'}}/>
						)}
					</FormCompItem>
				</Col>;
			}
		}

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem label={<EditableTransWrapper><Trans>Type</Trans></EditableTransWrapper>}>
							{getFieldDecorator('type', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez renseigner le type`,
								}],
							})(
								<Select placeholder={i18n.t`Type`} size="large" allowClear={true}>
									{
										ContractDocumentTypes.map((ContractDocumentType, idx) => {
											return <Option key={idx} value={ContractDocumentType.value}>{ContractDocumentType.label}</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					{titleField}
					{purchaseOrderNumberField}
				</Row>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={24}>
						<FormCompItem label={<EditableTransWrapper><Trans>Validité permanente</Trans></EditableTransWrapper>}>
							{getFieldDecorator('continuedValidity', {
								rules: [{required: true, message: i18n.t`Veuillez renseigner ce champ`}],
							})(
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
					{validityStartDateField}
					{validityEndDateField}
				</Row>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={24}>
						<FileUpload apiClient={apiClient} uploadSuccessCallback={this.uploadSuccess}/>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem>
							{getFieldDecorator('document', {
								rules: [{required: true, message: i18n.t`Veuillez sélectionner un fichier`}],
							})(
								<Input style={{display: 'none'}}/>
							)}
						</FormCompItem>
					</Col>
					<FormCompItem>
						{getFieldDecorator('contract')(
							<Input style={{display: 'none'}} readOnly={true} disabled={true}/>
						)}
					</FormCompItem>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(ContractDocumentForm);
