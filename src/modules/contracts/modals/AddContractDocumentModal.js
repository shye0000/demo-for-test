import React from 'react';
import ContractDocumentForm from '../forms/ContractDocumentForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import notification from 'antd/lib/notification';
import {Trans, withI18n} from 'lingui-react';
import apiClient from '../../../apiClient';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import jsonStringifyPreserveUndefined from '../../../modules/utils/jsonStringifyPreserveUndefined';

class AddContractDocumentModal extends ActionModalForm {
	constructor(props) {
		super(props, ContractDocumentForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {contract, i18n} = this.props;
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
			apiClient.fetch('/contract_documents', {
				method: 'POST',
				body: jsonStringifyPreserveUndefined({
					...values,
					continuedValidity: values.continuedValidity ? true : false,
					contract: contract['@id']
				})
			}).then(
				(response) => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true, response.json));
					notification['success']({
						message: i18n.t`La pièce jointe a bien été ajoutée.`,
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
								message: i18n.t`La pièce jointe n'a pas été ajoutée.`,
								className: 'qhs-notification error'
							});						}
					);
				}
			);
		});
	}
}

export default withI18n()(AddContractDocumentModal);
