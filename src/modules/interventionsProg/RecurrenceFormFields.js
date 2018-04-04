import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Radio from 'antd/lib/radio';
import Select from 'antd/lib/select';
import InputNumber from 'antd/lib/input-number';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './RecurrenceFormFields.scss';
import moment from 'moment/moment';

class RecurrenceFormField extends React.Component {

	state = {
		endAfterChecked : false,
		repeatOnChecked : false,
	}

	repeatEvery = (name) => {
		let size     = '85%';
		const {i18n} = this.props;
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;

		if(name === 'semaine(s)' || name === 'année(s)')
			size = '75%';

		return(
			<Col xs={24} md={12}>
				<FormCompItem label={
					<EditableTransWrapper><Trans>Répeter chaque</Trans></EditableTransWrapper>
				}>
					{getFieldDecorator('repeatEvery', {
						rules: [{
							required: true, message: 'Veuillez renseigner la récurrence'
						}],
					})(
						<InputNumber
							size="large"
							style={{width: size}}
							placeholder={i18n.t`Nb`}
							min={1}/>
					)}<span>{name}</span>
				</FormCompItem>
			</Col>
		);
	}

	endAfter = () => {
		const FormCompItem = FormComp.Item;
		const RadioGroup   = Radio.Group;
		const { i18n }     = this.props;
		const { endAfterChecked }   = this.state;
		const { getFieldDecorator } = this.props.form;

		return(
			<Col xs={24} md={12}>
				<FormCompItem label={
					<EditableTransWrapper><Trans>Fin de recurrence</Trans></EditableTransWrapper>
				}>
					<div>
						{getFieldDecorator('radioEndAfter')(
							<RadioGroup onChange={this.endAfterOnChange}>
								<Col xs={24} md={24}>
									<Radio value={0}><Trans>Jamais</Trans></Radio>
								</Col>
								<Col xs={24} md={24}>
									<FormCompItem>
										<Radio value={1} className="recurrence-wrapper" >
											<div className="recurrence-display" >
												<Trans>Après</Trans>
												{' '}
												{getFieldDecorator('endAfter', {
													rules: [{
														required: endAfterChecked,
														message: i18n.t`Veuillez renseigner la fin de la récurrence`
													}]
												})(
													<InputNumber
														id="recurrence-input-number"
														disabled={!endAfterChecked}
														size="large"
														style={{width: '100%'}}
														placeholder={i18n.t`Nb`}
														min={1} />
												)}
												<span>occurence(s)</span>
											</div>

										</Radio>
									</FormCompItem>
								</Col>
							</RadioGroup>)}
					</div>
				</FormCompItem>
			</Col>
		);
	}

	endAfterOnChange = (e) => {
		this.setState({
			endAfterChecked: !!e.target.value,
		}, () => {
			this.props.form.validateFields(['endAfter'], { force: true });
		});
	}

	repeatOnChange = (e) => {
		this.setState({
			repeatOnChecked: !!e.target.value,
		});
	}

	componentDidUpdate(prevProps) {
		const { recurrence, form } = this.props;
		if (prevProps.recurrence !== recurrence && recurrence !== 1) {
			// if the mode the recurrence is changed and is not 'never'
			// reset end of recurrence values and reset state
			let fieldValues = {
				radioEndAfter              : 0,
				endAfter                   : undefined,
				repeatOnGenericFrequency   : undefined,
				repeatOnGenericDayOfWeek   : undefined,
				repeatOnSpecificDaysOfWeek : undefined
			};
			if(recurrence === 4)
				fieldValues.radioRepeatOnMonth = 0;
			if(recurrence === 5)
				fieldValues.radioRepeatOnYear = 0;

			form.setFieldsValue({...fieldValues});
			this.setState({
				endAfterChecked: false,
				repeatOnChecked : false
			});
		}
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option       = Select.Option;
		const RadioGroup   = Radio.Group;
		const months       = moment.months();
		const weekdays     = moment.weekdays();
		const order        = [ 'Premier', 'Second', 'Troisième', 'Quatrième', 'Dernier' ];

		const { i18n, recurrence }  = this.props;
		const { repeatOnChecked }   = this.state;
		const { getFieldDecorator } = this.props.form;


		switch (recurrence) {
			case 1: // no repeat
				return null;
			case 2: // by day
				return(
					<Row className="recurrence-row" gutter={20} type="flex">
						{this.repeatEvery(<Trans>jour(s)</Trans>)}
						{this.endAfter()}
					</Row>
				);
			case 3: // by week
				return(
					<Row className="recurrence-row" gutter={20} type="flex">
						{this.repeatEvery('semaine(s)')}
						<Col xs={24} md={12}>
							<FormCompItem label={
								<EditableTransWrapper><Trans>Répéter le</Trans></EditableTransWrapper>
							}>
								{getFieldDecorator('repeatOnSpecificDaysOfWeek', {
									rules: [{
										required: true, message: 'Veuillez renseigner le(s) jours de la récurrence'
									}],
								})(
									<Select
										combobox={false} mode="multiple"
										placeholder={i18n.t`Répéter le`} size="large" filterOption={false}>
										{
											weekdays.map((name, idx) => {
												return <Option key={name} value={idx + 1}>{name}</Option>;
											})
										}
									</Select>
								)}
							</FormCompItem>
						</Col>
						{this.endAfter()}
					</Row>
				);
			case 4: // by month
				return(
					<Row className="recurrence-row" gutter={20} type="flex">
						{this.repeatEvery('mois')}
						<Col xs={24} md={12}>
							<FormCompItem  label={
								<EditableTransWrapper><Trans>Répéter le</Trans></EditableTransWrapper>
							}>
								{getFieldDecorator('radioRepeatOnMonth')(
									<RadioGroup onChange={this.repeatOnChange} style={{width: '100%'}}>
										<Row gutter={10} type="flex">
											<Col xs={2} md={2}>
												<FormCompItem>
													<Radio value={0}/>
												</FormCompItem>
											</Col>
											<Col xs={20} md={22}>
												<FormCompItem>
													{getFieldDecorator('repeatOnSpecificDay',
														!repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le(s) jours de la récurrence'
																}],
															}
															: {})(
														<InputNumber
															disabled={repeatOnChecked}
															size="large"
															style={{width: '78%'}}
															placeholder={i18n.t`jour`}
															min={1} />
													)}<span>du mois</span>
												</FormCompItem>
											</Col>
										</Row>
										<Row gutter={10} type="flex" className="recurrence-row-month">
											<Col xs={2} md={2}>
												<Radio value={1}/>
											</Col>
											<Col xs={11} md={10}>
												<FormCompItem>
													{getFieldDecorator('repeatOnGenericFrequency',
														repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner la fréquence de la récurrence'
																}],
															}
															: {})(
														<Select placeholder={i18n.t`Premier`} size="large" style={{width: '100%'}}
															filterOption={false} disabled={!repeatOnChecked}>
															{
																order.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
											<Col xs={11} md={12}>
												<FormCompItem>
													{getFieldDecorator('repeatOnGenericDayOfWeek',
														repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le(s) jours de la récurrence'
																}],
															}
															: {})(
														<Select
															placeholder={i18n.t`Lundi`} size="large"
															style={{width: '100%'}} filterOption={false}
															disabled={!repeatOnChecked}>
															{
																weekdays.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
										</Row>
									</RadioGroup>
								)}
							</FormCompItem>
						</Col>
						{this.endAfter()}
					</Row>
				);
			case 5: // by year
				return(
					<Row className="recurrence-row" gutter={20} type="flex">
						{this.repeatEvery('année(s)')}
						{this.endAfter()}
						<Col xs={24} md={24}>
							<FormCompItem  label={
								<EditableTransWrapper><Trans>Répéter le</Trans></EditableTransWrapper>
							}>
								{getFieldDecorator('radioRepeatOnYear')(
									<RadioGroup onChange={this.repeatOnChange} style={{width: '100%'}}>
										<Row gutter={10} type="flex">
											<Col xs={2} md={1}>
												<Radio value={0}/>
											</Col>
											<Col xs={11} md={8}>
												<FormCompItem>
													{getFieldDecorator('repeatOnSpecificDay',
														!repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le(s) jours de la récurrence'
																}],
															}
															: {})(
														<InputNumber
															disabled={repeatOnChecked}
															size="large"
															style={{width: '100%'}}
															placeholder={i18n.t`Nb`}
															min={1} />
													)}
												</FormCompItem>
											</Col>
											<Col xs={11} md={8}>
												<FormCompItem>
													{getFieldDecorator('repeatOnSpecificMonth',
														!repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le mois de la récurrence'
																}],
															}
															: {})(
														<Select
															placeholder={i18n.t`Mois`} size="large"
															style={{width: '100%'}} filterOption={false}
															disabled={repeatOnChecked}>
															{
																months.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
										</Row>
										<Row gutter={10} type="flex"  className="recurrence-row-year">
											<Col xs={2} md={1}>
												<Radio value={1}/>
											</Col>
											<Col xs={11} md={8}>
												<FormCompItem>
													{getFieldDecorator('repeatOnGenericFrequency',
														repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner la fréquence de la récurrence'
																}],
															}
															: {})(
														<Select
															placeholder={i18n.t`Premier`} size="large"
															style={{width: '100%'}} filterOption={false}
															disabled={!repeatOnChecked}>
															{
																order.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
											<Col xs={11} md={8}>
												<FormCompItem>
													{getFieldDecorator('repeatOnGenericDayOfWeek',
														repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le jours de la récurrence'
																}],
															}
															: {})(
														<Select
															placeholder={i18n.t`Lundi`} size="large" style={{width: '100%'}} filterOption={false} disabled={!repeatOnChecked}>
															{
																weekdays.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
											<Col xs={2} md={1}>
												<span>de</span>
											</Col>
											<Col xs={11} md={6}>
												<FormCompItem>
													{getFieldDecorator('repeatOnGenericMonth',
														repeatOnChecked
															? {
																rules: [{
																	required: true, message: 'Veuillez renseigner le mois de la récurrence'
																}],
															}
															: {})(
														<Select
															placeholder={i18n.t`Mois`} size="large"
															style={{width: '100%'}} filterOption={false}
															disabled={!repeatOnChecked}>
															{
																months.map((name, idx) => {
																	return <Option key={name} value={idx + 1}>{name}</Option>;
																})
															}
														</Select>
													)}
												</FormCompItem>
											</Col>
										</Row>
									</RadioGroup>
								)}
							</FormCompItem>
						</Col>
					</Row>
				);
			default:
				return null;
		}
	}
}
export default withI18n()(RecurrenceFormField);