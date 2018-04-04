import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import Select from 'antd/lib/select/index';

class Form extends React.Component {

	state = {
		ready: false,
		productType: null,
		services: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {productType} = this.state;

		if (productType) {
			form.setFieldsValue({
				name: productType.name,
				service: productType.service['@id']
			});
		}
	}

	async fetch() {
		const {productType} = this.props;
		this.setState({ready: false});
		const servicesResponse = await apiClient.fetch('/services', {params:{pagination:false}});

		let productTypeResponse = null;
		if (productType) {
			productTypeResponse = await apiClient.fetch(productType['@id']);
		}

		if (servicesResponse.status === 200 && (!productTypeResponse || productTypeResponse.status === 200)) {
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
				productType: productTypeResponse ? productTypeResponse.json : null,
				services: services
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
		const { services, ready } = this.state;
		const { i18n } = this.props;

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('name', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner le nom`,
								}],
							})(
								<Input placeholder="Nom" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('service', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner la service`
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
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(Form);
