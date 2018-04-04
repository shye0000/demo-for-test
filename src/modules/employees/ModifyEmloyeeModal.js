import React from 'react';
import ModifyEmployeeForm from './ModifyEmployeeForm';
import ActionModalForm from '../../components/ActionModalForm';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyEmloyeeModal extends ActionModalForm {
	constructor(props) {
		super(props, ModifyEmployeeForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Modifier les informations du salarié</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>);
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
			apiClient.fetch(this.props.employee['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
					nationality: values.nationality ? values.nationality.key : null,
					mutual: values.mutual ? true : false
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`Le salarié a été bien modifié.`,
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
								message: i18n.t`Le salarié n'a pas été modifié.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(ModifyEmloyeeModal);