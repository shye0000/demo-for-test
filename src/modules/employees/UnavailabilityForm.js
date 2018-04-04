import React from 'react';
import moment from 'moment';
import Form from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import DatePicker from 'antd/lib/date-picker';
import Select from 'antd/lib/select';
import InputNumber from 'antd/lib/input-number';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import EmployeeUnavailabilityTypes from '../../apiConstants/EmployeeUnavailabilityTypes';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import './UnavailabilityForm.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class UnavailabilityForm extends React.Component {

	state={
		ready: true,
		error: false,
		unavailability: null,
		startValue: null,
		endValue: null,
		endOpen: false
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

	onChange = (field, value) => {
		this.setState({
			[field]: value,
		});
	}

	onStartChange = (value) => {
		this.onChange('startValue', value);
	}

	onEndChange = (value) => {
		this.onChange('endValue', value);
	}

	handleStartOpenChange = (open) => {
		if (!open) {
			this.setState({ endOpen: true });
		}
	}

	handleEndOpenChange = (open) => {
		this.setState({ endOpen: open });
	}

	async fetchUnavailability() {
		const {unavailability, form} = this.props;
		this.setState({ready: false});
		const unavailabilityResponse = await apiClient.fetch(unavailability['@id']).catch(() => this.setState({
			ready: true,
			error: true
		}));
		if (unavailabilityResponse.status === 200) {
			this.setState({
				ready: true,
				unavailability: unavailabilityResponse.json
			}, () => {
				form.setFieldsValue({
					startDate: this.state.unavailability ? moment(this.state.unavailability.startDate) :  moment(),
					endDate: moment(this.state.unavailability.endDate),
					type: this.state.unavailability.type,
					halfDays: this.state.unavailability.halfDays,
					typeDays: '0'
				});
			});
		}
	}

	componentDidMount() {
		const {unavailability} = this.props;
		if (unavailability) {
			this.fetchUnavailability();
		} else {
			this.props.form.setFieldsValue({
				startDate: moment('00:00', 'HH:mm'),
				typeDays: '1'
			});
		}
	}

	render() {
		const FormItem = Form.Item;
		const { getFieldDecorator } = this.props.form;
		const { ready, endOpen } = this.state;
		const { i18n } = this.props;
		const dateFieldConfig = {
			rules: [{
				type: 'object',
				required: true,
				message: i18n.t`Veuillez sélectionner une date`
			}],
		};

		const dateFormat = 'DD/MM/YYYY HH:mm';
		const placeholder = i18n.t`JJ/MM/AAAA hh:mm`;

		return (
			ready ?
				<Form className="unavailability-form">
					<Row gutter={20}>
						<Col xs={24} md={12}>
							<FormItem
								label={<EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>}>
								{getFieldDecorator('startDate', dateFieldConfig)(
									<DatePicker
										size="large"
										showToday={false}
										showTime={
											{
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
							</FormItem>
						</Col>
						<Col xs={24} md={12}>
							<FormItem
								label={<EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>}>
								{getFieldDecorator('endDate', dateFieldConfig)(
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
							</FormItem>
						</Col>
						<Col xs={24} md={12}>
							<FormItem
								label={<EditableTransWrapper><Trans>Type de congé</Trans></EditableTransWrapper>}>
								{getFieldDecorator('type', {
									rules: [{
										required: true,
										message: i18n.t`Veuillez sélectionner un type`
									}],
								})(
									<Select
										showSearch
										size="large"
										style={{ width: '100%' }}
										placeholder={i18n.t`sélectionner`}
										optionFilterProp="children"
										filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
									>
										{
											EmployeeUnavailabilityTypes.map((type, idx) => {
												return <Select.Option key={idx} value={type.value}>{type.label}</Select.Option>;
											})
										}
									</Select>
								)}
							</FormItem>
						</Col>
						<Col xs={24} md={12}>
							<Row gutter={6} type="flex">
								<Col xs={24} md={7}>
									<FormItem
										size="large"
										label={<EditableTransWrapper><Trans>Durée (gestion de la paie)</Trans></EditableTransWrapper>}>
										{getFieldDecorator('halfDays', {
											rules: [{
												required: true,
												message: i18n.t`Veuillez préciser la durée`
											}],
										})(
											<InputNumber
												size="large"
												style={{width: '100%'}}
												placeholder={i18n.t`Nb`}
												min={1} />
										)}
									</FormItem>
								</Col>
								<Col xs={24} md={17}>
									<FormItem className="form-item-halfdays" size="large" label=" ">
										{getFieldDecorator('typeDays', {
											rules: [{
												required: true,
												message: i18n.t`Veuillez préciser le type`
											}],
										})(
											<Select
												showSearch
												size="large"
												placeholder={i18n.t`Type`}
											>
												<Select.Option key="1" value="1">Journées</Select.Option>
												<Select.Option key="0" value="0">Demi-journées</Select.Option>
											</Select>
										)}
									</FormItem>
								</Col>
							</Row>
						</Col>
					</Row>
				</Form> : <Spin />
		);
	}
}
export default withI18n()(UnavailabilityForm);