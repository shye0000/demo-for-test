import React from 'react';
import DatePicker from 'antd/lib/date-picker';
import Form from 'antd/lib/form';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class DownloadUnavailabilityForm extends React.Component {

	state = {
		startValue: null,
		endValue: null,
		endOpen: false,
	};

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


	render() {
		const FormItem = Form.Item;
		const { endOpen } = this.state;
		const { i18n } = this.props;
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
			labelCol: {
				xs: { span: 24 },
				sm: { span: 8 },
			},
			wrapperCol: {
				xs: { span: 24 },
				sm: { span: 16 },
			},
		};
		const config = {
			rules: [{ type: 'object', required: true, message: i18n.t`Veuillez sélectionner une date!` }],
		};

		const dateFormat = 'DD/MM/YYYY';
		const placeholder = i18n.t`JJ/MM/AAAA`;

		return (
			<Form>
				<FormItem
					{...formItemLayout}
					label={
						<EditableTransWrapper><Trans>Date de début</Trans></EditableTransWrapper>
					}>
					{getFieldDecorator('start', config)(
						<DatePicker
							style={{width: 200}}
							placeholder={placeholder}
							format={dateFormat}
							disabledDate={this.disabledStartDate}
							onChange={this.onStartChange}
							onOpenChange={this.handleStartOpenChange}
						/>
					)}
				</FormItem>
				<FormItem
					{...formItemLayout}
					label={
						<EditableTransWrapper><Trans>Date de fin</Trans></EditableTransWrapper>
					}>
					{getFieldDecorator('end', config)(
						<DatePicker
							style={{width: 200}}
							placeholder={placeholder}
							format={dateFormat}
							disabledDate={this.disabledEndDate}
							onChange={this.onEndChange}
							open={endOpen}
							onOpenChange={this.handleEndOpenChange}
						/>
					)}
				</FormItem>
			</Form>
		);
	}
}
export default withI18n()(DownloadUnavailabilityForm);