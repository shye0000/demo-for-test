import React from 'react';
import moment from 'moment';
import Form from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import DatePicker from 'antd/lib/date-picker';
import Input from 'antd/lib/input';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import apiClient from '../../apiClient';
import {Trans} from 'lingui-react';
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
					startDate: moment(this.state.unavailability.startDate),
					endDate: moment(this.state.unavailability.endDate),
					comment: this.state.unavailability.comment,
				});
			});
		}
	}

	componentDidMount() {
		const {unavailability} = this.props;
		if (unavailability) {
			this.fetchUnavailability();
		}
	}

	render() {
		const FormItem = Form.Item;
		const { getFieldDecorator } = this.props.form;
		const { ready, endOpen } = this.state;
		const dateFieldConfig = {
			rules: [{ type: 'object', required: true, message: 'Veuillez sélectionner une date' }],
		};

		const dateFormat = 'DD/MM/YYYY HH:mm';
		const placeholder='JJ/MM/AAAA hh:mm ';

		return (
			ready ?
				<Form>
					<Row gutter={20}>
						<Col xs={24} md={12}>
							<FormItem label={
								<EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>
							}>
								{getFieldDecorator('startDate', dateFieldConfig)(
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
							</FormItem>
						</Col>
						<Col xs={24} md={12}>
							<FormItem label={
								<EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>
							}>
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
						<Col xs={24} md={24}>
							<FormItem label={
								<EditableTransWrapper><Trans>Commentaire</Trans></EditableTransWrapper>
							}>
								{getFieldDecorator('comment')(
									<Input.TextArea/>
								)}
							</FormItem>
						</Col>
					</Row>
				</Form> : <Spin />
		);
	}
}
export default UnavailabilityForm;