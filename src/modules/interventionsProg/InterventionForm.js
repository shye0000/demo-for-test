import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Select from 'antd/lib/select';
import DatePicker from 'antd/lib/date-picker';
import {Link} from 'react-router-dom';
import Spin from 'antd/lib/spin';
import apiClient from '../../apiClient';
import moment from 'moment';
import RecurrenceFormFields from './RecurrenceFormFields';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './InterventionForm.scss';

class InterventionForm extends React.Component {

	state = {
		ready: false,
		benefits : null,
		vehicles : null,
		technicians: null,
		endOpen: false,
		recurrence : null
	}

	setRecurrence = (value) => {
		this.setState({
			recurrence : value
		});
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
		const {contract} = this.props;
		this.setState({ready: false});

		const benefitsResponse    = await apiClient.fetch('/benefits', {params:{pagination:false, contract: contract['@id']}});
		const vehiclesResponse    = await apiClient.fetch('/vehicles', {params:{pagination:false}});
		const techniciansResponse = await apiClient.fetch('/employees', {params:{pagination:false, employeeType: 1}});

		if (benefitsResponse.status === 200 && vehiclesResponse.status == 200 && techniciansResponse.status == 200) {
			this.setState({
				ready: true,
				benefits: benefitsResponse.json['hydra:member'],
				vehicles: vehiclesResponse.json['hydra:member'],
				technicians: techniciansResponse.json['hydra:member'],
			});
		}
	}

	onChange = (field, value) => {
		this.setState({
			[field]: value,
		});
	}

	disabledStartDate = (startValue) => {
		const endValue = this.state.endValue;
		if (!startValue || !endValue) {
			return false;
		}
		return startValue.valueOf() > endValue.valueOf();
	}

	disabledEndDate = (endValue) => {
		const startValue = this.state.startValue;
		if (!endValue || !startValue) {
			return false;
		}
		return endValue.valueOf() <= startValue.valueOf();
	}

	handleStartOpenChange = (open) => {
		if (!open) {
			this.setState({ endOpen: true });
		}
	}

	handleEndOpenChange = (open) => {
		this.setState({ endOpen: open });
	}

	onStartChange = (value) => {
		this.onChange('startValue', value);
	}

	onEndChange = (value) => {
		this.onChange('endValue', value);
	}

	componentDidMount() {
		this.fetch();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const {contract, form} = this.props;
		const { getFieldDecorator } = this.props.form;
		const { ready, benefits, vehicles, technicians, endOpen, recurrence } = this.state;
		const dateFormat = 'DD/MM/YYYY HH:mm';
		const placeholder='JJ/MM/AAAA hh:mm ';
		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<div id="form-contract">
					<span>Contrat : </span>
					<Link to={'contracts/list/'+contract.id}>{contract.number}</Link>
				</div>
				<Row gutter={20} type="flex">
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Préstations</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('benefits', {
								rules: [{
									required: true, message: 'Veuillez renseigner au moins une préstation'
								}],
							})(
								<Select allowClear={true} placeholder="Préstation" size="large" combobox={false} mode="multiple">
									{
										benefits.map((benefit, idx) => {
											return <Option key={idx} value={benefit['@id']}>{benefit.title}</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Véhicule</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('vehicle', {
								rules: [{
									required: true, message: 'Veuillez renseigner un vehicule'
								}],
							})(
								<Select allowClear={true} placeholder="Type de véhicule" size="large">
									{
										vehicles.map((vehicle, idx) => {
											return <Option key={idx} value={vehicle['@id']}>{vehicle.name}</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('startDate', {
								rules: [{
									required: true, message: 'Veuillez renseigner une date de début'
								}],
							})(
								<DatePicker
									size="large"
									showToday={false}
									showTime={
										{
											defaultValue: moment('00:00', 'HH:mm'),
											minuteStep: 30,
											secondStep: 60,
											format: 'HH:mm'
										}
									}
									style={{width: '100%'}}
									placeholder={placeholder}
									format={dateFormat}
									disabledDate={this.disabledStartDate}
									onChange={this.onStartChange}
									onOpenChange={this.handleStartOpenChange}
								/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('endDate', {
								rules: [{
									required: true, message: 'Veuillez renseigner une date de fin'
								}],
							})(
								<DatePicker
									size="large"
									showToday={false}
									showTime={
										{
											defaultValue: moment('00:00', 'HH:mm'),
											minuteStep: 30,
											secondStep: 60,
											format: 'HH:mm'
										}
									}
									style={{width: '100%'}}
									placeholder={placeholder}
									format={dateFormat}
									disabledDate={this.disabledEndDate}
									onChange={this.onEndChange}
									open={endOpen}
									onOpenChange={this.handleEndOpenChange}
								/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Techniciens</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('technician', {
								rules: [{
									required: true, message: 'Veuillez renseigner un technicien'
								}],
							})(
								<Select allowClear={true} placeholder="Technicien" size="large">
									{
										technicians.map((technician, idx) => {
											return <Option key={idx} value={technician['@id']}>{technician.firstName + ' ' + technician.lastName}</Option>;
										})
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Réccurence</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('repeatType', {
								rules: [{
									required: true, message: 'Veuillez renseigner le type de récurrence'
								}],
							})(
								<Select allowClear={true} placeholder="Type de récurrence" size="large" onChange={(value) => this.setRecurrence(value)}>
									<Option value={1}>Jamais</Option>
									<Option value={2}>Par jour</Option>
									<Option value={3}>Par semaine</Option>
									<Option value={4}>Par mois</Option>
									<Option value={5}>Par année</Option>
								</Select>
							)}
						</FormCompItem>
					</Col>
					<RecurrenceFormFields form={form} recurrence={recurrence}/>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(InterventionForm);