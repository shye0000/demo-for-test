import React from 'react';
import ContactPointInfoForm from '../forms/ContactPointInfoForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyContactPointInfoModal extends ActionModalForm {
	constructor(props) {
		super(props, ContactPointInfoForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Remplir les informations complémentaires</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Remplir</Trans></EditableTransWrapper>);
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

			const countryValue = values.country ? {country: values.country.key} : null;

			apiClient.fetch(this.props.dataPoint['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
					...countryValue
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`Les informations complémentaires ont bien été remplies.`,
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
								message: i18n.t`Les informations complémentaires n'ont pas bien été remplies.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(ModifyContactPointInfoModal);