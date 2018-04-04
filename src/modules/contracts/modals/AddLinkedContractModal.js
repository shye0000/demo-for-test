import React from 'react';
import AddLinkedContractForm from '../forms/AddLinkedContractForm';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddLinkedContractModal extends ActionModalForm {
	constructor(props) {
		super(props, AddLinkedContractForm, <div className="modal-title">
			<EditableTransWrapper><Trans>{'Lier à un autre contrat'}</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Lier</Trans></EditableTransWrapper>);
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
			if (values.linkedContracts) {
				values.linkedContracts.push(values.newLinkedContract);
			}
			apiClient.fetch(this.props.contract['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					linkedContracts: values.linkedContracts
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`Le contrat selectionné a été bien lié.`,
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
								message: i18n.t`Le contrat selectionné n'a pas été lié.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(AddLinkedContractModal);