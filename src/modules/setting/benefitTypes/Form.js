import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import ColorPicker from '../../../components/ColorPicker';

class Form extends React.Component {

	state = {
		ready: false,
		benefitType: null,
		services: null,
		requiredSkills: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {benefitType} = this.state;

		if (benefitType) {
			form.setFieldsValue({
				publicTitle: benefitType.publicTitle,
				internalTitle: benefitType.internalTitle,
				service: benefitType.service['@id'],
				requiredSkills: benefitType.requiredSkills,
				color: benefitType.color
			});
		}
	}

	async fetch() {
		const {benefitType} = this.props;
		this.setState({ready: false});
		const servicesResponse = await apiClient.fetch('/services', {params:{pagination:false}});
		const skillsResponse = await apiClient.fetch('/skills', {params:{pagination:false}});

		let benefitTypeResponse = null;
		if (benefitType) {
			benefitTypeResponse = await apiClient.fetch(benefitType['@id']);
		}

		if (servicesResponse.status === 200
			&& skillsResponse.status === 200
			&& (!benefitTypeResponse || benefitTypeResponse.status === 200)
		) {
			const services = [];

			for (let key in servicesResponse.json['hydra:member']) {
				if (servicesResponse.json['hydra:member'][key].reference === 'sootblower' ||
					servicesResponse.json['hydra:member'][key].reference === 'degreasing' ||
					servicesResponse.json['hydra:member'][key].reference === 'sanitation'
				) {
					services.push(servicesResponse.json['hydra:member'][key]);
				}
			}

			this.setState({
				ready: true,
				benefitType: benefitTypeResponse ? benefitTypeResponse.json : null,
				services: services,
				requiredSkills: skillsResponse.json['hydra:member']
			}, () => {
				this.setDefaultValues();
			});
		}
	}

	componentDidMount() {
		this.fetch();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { benefitType, services, requiredSkills, ready } = this.state;
		const { i18n } = this.props;

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Titre public</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('publicTitle', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner le titre public`,
								}],
							})(
								<Input placeholder="Titre public" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Titre interne</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('internalTitle')(
								<Input placeholder="Titre interne" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Couleur</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('color', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner la couleur`,
								}],
							})(
								<ColorPicker
									placeholder="Couleur"
									color={benefitType ? benefitType.color : null}
									form={this.props.form} name={'color'}
									size="large"/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('service', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner le service`
								}],
							})(
								<Select allowClear={true} placeholder="Service" size="large">
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
						<FormCompItem label={
							<EditableTransWrapper><Trans>Compétences requises</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('requiredSkills', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner au moins une compétence`
								}],
							})(
								<Select mode="multiple" placeholder="Compétences requises" size="large">
									{
										requiredSkills.map((requiredSkill, idx) => {
											return <Option key={idx} value={requiredSkill['@id']}>
												{`${requiredSkill.label}`}
											</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(Form);
