import React from 'react';
import SetStatusSendToClientForm from '../forms/SetStatusSendToClientForm';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class SetStatusSendToClientModal extends ActionModalForm {
	constructor(props) {
		let modalTitle;
		switch (props.contract.nature) {
			case 1:
				modalTitle = <Trans>{'Envoyer l\'avenant au contact Achat'}</Trans>;
				break;
			case 2:
				modalTitle = <Trans>Envoyer le contrat au contact Achat</Trans>;
				break;
			case 3:
				modalTitle = <Trans>Envoyer le devis au contact Achat</Trans>;
				break;
		}
		super(
			props, SetStatusSendToClientForm,
			<div className="modal-title">
				<EditableTransWrapper>{modalTitle}</EditableTransWrapper>
			</div>,
			<EditableTransWrapper><Trans>Envoyer</Trans></EditableTransWrapper>
		);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {contract, i18n} = this.props;

		let successMessage, failMessage;
		switch (contract.nature) {
			case 1:
				successMessage = i18n.t`L'avenant a été bien envoyé au client.`;
				failMessage = i18n.t`L'avenant n'a pas été envoyé au client.`;
				break;
			case 2:
				successMessage = i18n.t`Le contrat a été bien envoyé au client.`;
				failMessage = i18n.t`Le contrat n'a pas été envoyé au client.`;
				break;
			case 3:
				successMessage = i18n.t`Le devis a été bien envoyé au client.`;
				failMessage = i18n.t`Le devis n'a pas été envoyé au client.`;
				break;
		}

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

			apiClient.fetch('/contract_status_histories', {
				method: 'POST',
				body: jsonStringifyPreserveUndefined({
					comment: values.comment,
					status: 5,
					contract: contract['@id']
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: successMessage,
						className: 'qhs-notification success'
					});
				},
				(error) => {
					error.response.json().then(
						(body) => {
							if (body.violations && body.violations.length) {
								let fields = {};
								for (let i = 0; i < body.violations.length; i++) {
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
							} else {
								this.form.setFields({
									errorFakeField: {
										value: null,
										errors: [new Error(body['hydra:description'])]
									}
								});
							}

							this.setState({confirmLoading: false});
							notification['error']({
								message: failMessage,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(SetStatusSendToClientModal);