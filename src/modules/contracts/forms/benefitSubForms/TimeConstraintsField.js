import React from 'react';
import Icon from 'antd/lib/icon';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Tooltip from 'antd/lib/tooltip';
import InputNumber from 'antd/lib/input-number';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './TimeConstraintsField.scss';
import moment from 'moment/moment';

class TimeConstraintsField extends React.Component {

	state = {
		timeConstraints: {},
		timeConstraintKey: 0,
		fieldValues: {}
	}

	weekdayNames = Array.apply(null, Array(7)).map((_, i) => {
		return moment(i, 'e').format('dddd');
	});

	addTimeConstraint = () => {
		this.setState({
			timeConstraints: {
				...this.state.timeConstraints,
				[this.state.timeConstraintKey]: {'@id': false}
			},
			timeConstraintKey: this.state.timeConstraintKey + 1
		});
	}

	deleteTimeConstraint = (idx) => {
		let timeConstraints = {...this.state.timeConstraints};
		delete timeConstraints[idx];
		this.setState({timeConstraints});
	}

	getTimeConstraintsField = () => {
		const {timeConstraints} = this.state;
		const FormCompItem = Form.Item;
		const { getFieldDecorator } = this.props.form;
		const { disabled } = this.props;
		return Object.keys(timeConstraints).map((key) => {
			const constraintsIdName = 'constraintsIds[' + key + ']';
			const startDayName = 'startDays[' + key + ']';
			const startHourName = 'startHours[' + key + ']';
			const endDayName = 'endDays[' + key + ']';
			const endHourName = 'endHours[' + key + ']';
			return <div className="time-constraint-wrapper" key={key}>
				<FormCompItem style={{display: 'none'}}>
					{getFieldDecorator(constraintsIdName)(
						<InputNumber style={{display: 'none'}} disabled={disabled} />
					)}
				</FormCompItem>
				<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
				<FormCompItem className="day">
					{getFieldDecorator(startDayName, {rules: [{required: true}]})(
						<Select size="large" allowClear={true} disabled={disabled} >
							{this.weekdayNames.map((weekDay, idx) => {
								return <Select.Option key={idx} value={idx + 1} >
									{weekDay}
								</Select.Option>;
							})}
						</Select>
					)}
				</FormCompItem>
				<FormCompItem className="hour">
					{getFieldDecorator(startHourName, {rules: [{required: true}]})(
						<InputNumber size="large" min={0} max={24} disabled={disabled} />
					)}
				</FormCompItem>
				<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
				<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
				<FormCompItem className="day">
					{getFieldDecorator(endDayName, {rules: [{required: true}]})(
						<Select size="large" allowClear={true} disabled={disabled} >
							{this.weekdayNames.map((weekDay, idx) => {
								return <Select.Option key={idx} value={idx + 1} >
									{weekDay}
								</Select.Option>;
							})}
						</Select>
					)}
				</FormCompItem>
				<FormCompItem className="hour">
					{getFieldDecorator(endHourName, {rules: [{required: true}]})(
						<InputNumber size="large" min={0} max={24} disabled={disabled} />
					)}
				</FormCompItem>
				<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
				{disabled ?
					null
					:
					<Tooltip
						placement="topLeft" arrowPointAtCenter
						title={<EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>}>
						<Icon type="delete" onClick={() => this.deleteTimeConstraint(key)}/>
					</Tooltip>}
			</div>;
		});
	}

	async setDefaultTimeConstraints(defaultTimeConstraints) {
		if (defaultTimeConstraints) {
			const {form} = this.props;
			let timeConstraints = {};
			let constraintsIds = [];
			let startDays = [];
			let startHours = [];
			let endDays = [];
			let endHours = [];
			for (let key in defaultTimeConstraints) {
				timeConstraints[key] = {'@id': defaultTimeConstraints[key]['@id']};
				const constraint = defaultTimeConstraints[key];
				constraintsIds.push(constraint['@id']);
				startDays.push(constraint.startDay);
				startHours.push(constraint.startHour);
				endDays.push(constraint.endDay);
				endHours.push(constraint.endHour);
			}
			await this.setState({
				timeConstraints,
				timeConstraintKey: defaultTimeConstraints.length
			});
			form.setFieldsValue({startDays, startHours, endDays, endHours, constraintsIds});
		}
	}

	componentWillReceiveProps(nextProps) {
		const {defaultTimeConstraints} = nextProps;
		if (defaultTimeConstraints !== this.props.defaultTimeConstraints) {
			this.setDefaultTimeConstraints(defaultTimeConstraints);
		}
	}

	render() {
		const { fieldName, disabled } = this.props;
		const { timeConstraintKey } = this.state;
		const FormCompItem = Form.Item;
		const { getFieldDecorator } = this.props.form;
		return <div className="time-constraints-field">
			<FormCompItem
				className="time-constraint-label"
				label={<EditableTransWrapper><Trans>Contraintes horaires</Trans></EditableTransWrapper>} />
			{this.getTimeConstraintsField()}
			{disabled ?
				null
				:
				<div>
					<span className="link-add-time-constraint" onClick={() => this.addTimeConstraint(timeConstraintKey)}>
						<Icon type="plus-circle-o" />
						<span>
							<EditableTransWrapper><Trans>Ajouter une contrainte horaire</Trans></EditableTransWrapper>
						</span>
					</span>
				</div>}
			<FormCompItem>
				{getFieldDecorator(fieldName)(
					<Input style={{display: 'none'}} disabled={true} readOnly={true} />
				)}
			</FormCompItem>
		</div>;
	}
}


export default withI18n()(TimeConstraintsField);