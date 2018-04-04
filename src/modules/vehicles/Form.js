import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import DatePicker from 'antd/lib/date-picker';
import Spin from 'antd/lib/spin';
import ColorPicker from '../../components/ColorPicker';
import apiClient from '../../apiClient';
import moment from 'moment';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class Form extends React.Component {

	state = {
		ready: false,
		services: null,
		types: null,
		vehicle: null,
		technicians: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {vehicle} = this.state;
		if (vehicle) {
			form.setFieldsValue({
				name:               vehicle.name,
				plate:              vehicle.plate,
				removedOn:          vehicle.removedOn ? moment(vehicle.removedOn) : null,
				service:            vehicle.service['@id'],
				vehicleType:        vehicle.vehicleType['@id'],
				colorCalendar:      vehicle.colorCalendar,
				defaultTechnicians: vehicle.defaultTechnicians,
			});
		}
	}


	async fetch() {
		const {vehicle} = this.props;
		this.setState({ready: false});
		const servicesResponse = await apiClient.fetch('/services', {params:{pagination:false}});
		const typesResponse = await apiClient.fetch('/vehicle_types', {params:{pagination:false}});
		const techniciansResponse = await apiClient.fetch('/employees', {params:{pagination:false, employeeType: 1}});

		let vehicleResponse = null;
		if (vehicle) {
			vehicleResponse = await apiClient.fetch(vehicle['@id']);
		}
		if (servicesResponse.status === 200
			&& typesResponse.status === 200
			&& techniciansResponse.status === 200
			&& (!vehicleResponse || vehicleResponse.status === 200)) {
			this.setState({
				ready: true,
				services: servicesResponse.json['hydra:member'],
				types: typesResponse.json['hydra:member'],
				vehicle: vehicleResponse ? vehicleResponse.json : null,
				technicians: techniciansResponse.json['hydra:member']
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
		const { vehicle, services, types, technicians, ready } = this.state;
		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>N° de plaque</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('plate', {
								rules: [{
									required: true, message: 'Veuillez renseigner le numéro de plaque',
								}],
							})(
								<Input placeholder="N° de plaque" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Nom court</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('name', {
								rules: [{
									required: true, message: 'Veuillez renseigner le nom',
								}],
							})(
								<Input placeholder="Nom court" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('service', {
								rules: [{
									required: true, message: 'Veuillez renseigner la service'
								}],
							})(
								<Select allowClear={true} placeholder="Services" size="large">
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
							<EditableTransWrapper><Trans>Type de véhicule</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('vehicleType', {
								rules: [{
									required: true, message: 'Veuillez renseigner le type de véhicule'
								}],
							})(
								<Select allowClear={true} placeholder="Type de véhicule" size="large">
									{
										types.map((type, idx) => {
											return <Option key={idx} value={type['@id']}>{type.label}</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Techniciens par défaut</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('defaultTechnicians', {
								rules: [{
									required: true, message: 'Veuillez renseigner au moins un technicien'
								}],
							})(
								<Select mode="multiple" placeholder="Techniciens par défaut" size="large">
									{
										technicians.map((technician, idx) => {
											return <Option key={idx} value={technician['@id']}>
												{`${technician.firstName} ${technician.lastName}`}
											</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Couleur dans le calendrier</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('colorCalendar')(
								<ColorPicker
									placeholder="Couleur dans le calendrier"
									color={vehicle ? vehicle.colorCalendar : null}
									form={this.props.form} name={'colorCalendar'}
									size="large"/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Date de sortie du parc auto</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('removedOn')(
								<DatePicker
									format="DD/MM/YYYY"
									placeholder="JJ/MM/AAAA"
									size="large"
									style={{width: '100%'}}/>
							)}
						</FormCompItem>
					</Col>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}


export default Form;