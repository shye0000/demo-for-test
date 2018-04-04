import React from 'react';
import AddContactPointContactForm from '../forms/AddContactPointContactForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddContactPointContactModal extends ActionModalForm {
	constructor(props) {
		super(props, AddContactPointContactForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Ajouter un salarié</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n, dataPoint} = this.props;


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

			// get old value of dataPointContacts
			let defaultValues = dataPoint.dataPointContacts.map((dataPointContact) => {
				return {'@id': dataPointContact['@id']};
			});
			// get newly selected dataPointValues
			let dataPointContacts = values.dataPointContacts.map((contact) => {
				return {contact: contact};
			});
			// merge old and new values
			dataPointContacts = [...dataPointContacts, ...defaultValues];
			
			apiClient.fetch(dataPoint['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
					dataPointContacts
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`Le salarié a bien été créé.`,
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
									const propertyPath = fieldError.propertyPath.split('[')[0];
									if (!fields[propertyPath]) {
										fields[propertyPath] = {
											value: values[propertyPath],
											errors: []
										};
									}
									fields[propertyPath].errors.push(new Error(fieldError.message));
								}
								this.form.setFields(fields);
							}
							this.setState({confirmLoading: false});
							notification['error']({
								message: i18n.t`Le salarié n'a pas été créé.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(AddContactPointContactModal);