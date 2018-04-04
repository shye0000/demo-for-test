import React from 'react';
import ContactPointForm from '../forms/ContactPointForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddContactPointModal extends ActionModalForm {
	constructor(props) {
		super(props, ContactPointForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Ajouter un point de contact</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		let divisionValue;
		const {i18n, entity, param, division} = this.props;
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
			if (division) {
				divisionValue = {division: division['@id']};
			}
			apiClient.fetch('/data_points', {
				method: 'POST',
				body: jsonStringifyPreserveUndefined({
					...values,
					...divisionValue,
					[param]: entity['@id']
				})
			}).then(
				(data) => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true, data.json));
					notification['success']({
						message: i18n.t`Le point de contact a bien été créé.`,
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
								message: i18n.t`Le point de contact n'a pas été créé.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(AddContactPointModal);