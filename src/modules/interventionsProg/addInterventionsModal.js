import React from 'react';
import InterventionsForm from './InterventionForm';
import ActionModalForm from '../../components/ActionModalForm/index';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../modules/utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class addInterventionsModal extends ActionModalForm {
	constructor(props) {
		super(props, InterventionsForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Programmer une intervention</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Programmer</Trans></EditableTransWrapper>);
	}

	formatValuesForRequest = (values) => {
		let formattedValues;

		formattedValues = {...values};

		if (formattedValues.radioEndAfter === 0)
			delete formattedValues.endAfter;

		delete formattedValues.radioEndAfter;

		if (formattedValues.radioRepeatOnMonth === 0) {
			delete formattedValues.radioRepeatOnMonth;
			delete formattedValues.repeatOnGenericFrequency;
			delete formattedValues.repeatOnGenericDayOfWeek;
		}
		if (formattedValues.radioRepeatOnMonth === 1) {
			delete formattedValues.radioRepeatOnMonth;
			delete formattedValues.repeatOnSpecificDay;
		}
		if (formattedValues.radioRepeatOnYear === 0) {
			delete formattedValues.radioRepeatOnYear;
			delete formattedValues.repeatOnGenericFrequency;
			delete formattedValues.repeatOnGenericDayOfWeek;
			delete formattedValues.repeatOnGenericMonth;
		}
		if (formattedValues.radioRepeatOnYear === 1) {
			delete formattedValues.radioRepeatOnYear;
			delete formattedValues.repeatOnSpecificMonth;
			delete formattedValues.repeatOnSpecificDay;
		}

		return formattedValues;
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n} = this.props;
		this.form.validateFields((err, values) => {
			if (err) {
				return;
			}

			// reset api form errors
			let fieldValues = {};
			Object.keys(values).forEach(key => {
				fieldValues[key] = {
					value: values[key]
				};
			});

			this.form.setFields(fieldValues);
			this.setState({confirmLoading: true});

			apiClient.fetch('/services_interventions', {
				method: 'POST',
				body: jsonStringifyPreserveUndefined(this.formatValuesForRequest(values))
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`L'intervention a bien été programmée.`,
						className: 'qhs-notification success'
					});
				},
				(error) => {
					error.response.json().then(
						(body) => {
							if (body.violations && body.violations.length) {
								let fields = {};
								for(let i = 0; i < body.violations.length; i++) {
									const fieldError = body.violations[i];
									if (!fields[fieldError.propertyPath]) {
										fields[fieldError.propertyPath] = {
											value: values[fieldError.propertyPath],
											errors: []
										};
									}
									fields[fieldError.propertyPath].errors.push(new Error(fieldError.message));
								}
								this.form.setFields(fields);
							}
							this.setState({confirmLoading: false});
							notification['error']({
								message: i18n.t`L'intervention n'a pas été programmée.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(addInterventionsModal);