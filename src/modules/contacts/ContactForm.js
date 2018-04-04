import React from 'react';
import moment from 'moment';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import DatePicker from 'antd/lib/date-picker';
import Genders from '../../apiConstants/Genders';
import FileUpload from '../../components/FileUpload';
import './ContactForm.scss';
import apiClient from '../../apiClient';
import PhoneNumberField from '../../components/PhoneNumberField';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';



class ContactForm extends React.Component {

	state = {
		ready: false,
		contact: null,
		submitting: false,
	}

	async fetch() {
		const {contact, form} = this.props;
		this.setState({ready: false});
		if (! contact || !contact['@id']) {
			this.setState({
				ready: true,
				contact: null
			});
			return;
		}
		const contactResponse = await apiClient.fetch(contact['@id']);
		if (contactResponse.status === 200) {
			const contact = contactResponse.json;
			this.setState({
				ready: true,
				contact: contact
			}, () => {
				const {contact} = this.state;
				let values = {
					lastName:                contact.lastName,
					firstName:               contact.firstName,
					email:                   contact.email,
					dateOut:                 contact.dateOut ? moment(contact.dateOut) : null,
					gender:                  contact.gender,
					photo:                   contact.photo ? contact.photo['@id'] : null,
					phone:					 contact.phone,
					phoneBis:			     contact.phoneBis,
					fax:					 contact.fax,
					function:				 contact.function,
					comment:                 contact.comment,
					division:                contact.division['@id']
				};
				form.setFieldsValue(values);
			});
		}
	}

	componentDidMount() {
		const {contact, division, form} = this.props;
		if (contact) {
			// modification
			this.fetch();
		} else if (division) {
			// creation
			this.setState({ready: true}, () => {
				form.setFieldsValue({
					division: division['@id']
				});
			});
		}

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
		const { getFieldDecorator } = this.props.form;
		const { ready, contact } = this.state;
		const { i18n } = this.props;
		return(
			<div className="contact-form">
				{
					ready ? <div>
						<FormComp onSubmit={this.handleSubmit}>
							<FormCompItem className="form-error-field" style={{marginBottom: 0}}>
								{getFieldDecorator('division')(
									<Input style={{display: 'none'}} readOnly={true}/>
								)}
							</FormCompItem>
							<Row gutter={20}>
								<Col span={24}>
									<FileUpload
										apiClient={apiClient} title={
											<EditableTransWrapper><Trans>Photo du salarié tiers</Trans></EditableTransWrapper>
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
											<Select className="" combobox={false}
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
										label={<EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>}>
										{getFieldDecorator('email')(
											<Input placeholder={i18n.t`E-mail`} size="large" />
										)}
									</FormCompItem>
								</Col>
								<Col xs={24} md={12}>
									<FormCompItem
										label={<EditableTransWrapper><Trans>Téléphone principal</Trans></EditableTransWrapper>}>
										{getFieldDecorator('phone')(
											<PhoneNumberField form={this.props.form} phone={contact ? contact.phone : null}/>
										)}

									</FormCompItem>
								</Col>
								<Col xs={24} md={12}>
									<FormCompItem
										label={<EditableTransWrapper><Trans>Téléphone secondaire</Trans></EditableTransWrapper>}>
										{getFieldDecorator('phoneBis')(
											<PhoneNumberField form={this.props.form} phone={contact ? contact.phoneBis : null}/>
										)}

									</FormCompItem>
								</Col>
								<Col xs={24} md={12}>
									<FormCompItem
										label={<EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>}>
										{getFieldDecorator('fax')(
											<PhoneNumberField form={this.props.form} phone={contact ? contact.fax : null}/>
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
							<Row gutter={20} type="flex">
								<Col xs={24} md={12}>
									<FormCompItem
										label={<EditableTransWrapper><Trans>Poste</Trans></EditableTransWrapper>}>
										{getFieldDecorator('function')(
											<Input placeholder={i18n.t`Poste`} size="large" />
										)}

									</FormCompItem>
								</Col>
								<Col span={24}>
									<FormCompItem
										label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
										{getFieldDecorator('comment')(
											<Input.TextArea placeholder={i18n.t`Commentaire interne`} style={{width: '100%'}}/>
										)}
									</FormCompItem>
								</Col>
							</Row>
						</FormComp>
					</div> : <Spin indicator="" className="centered-spin" />
				}
			</div>
		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(ContactForm));

export default WrappedFormComp;