import React from 'react';
import DocumentForm from './DocumentForm';
import ActionModalForm from '../ActionModalForm/index';
import notification from 'antd/lib/notification';
import {Trans, withI18n} from 'lingui-react';
import apiClient from '../../apiClient';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import jsonStringifyPreserveUndefined from '../../modules/utils/jsonStringifyPreserveUndefined';

class AddDocumentModal extends ActionModalForm {
	constructor(props) {
		super(props, DocumentForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {entity, i18n, param, uri} = this.props;
		this.form.validateFields((err, fieldsValue) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			apiClient.fetch(uri, {
				method: 'POST',
				body: jsonStringifyPreserveUndefined({
					...fieldsValue,
					[param]: entity['@id']
				})
			}).then(
				(response) => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true, response.json));
					notification['success']({
						message: i18n.t`La pièce jointe a bien été ajoutée.`,
						className: 'qhs-notification success'
					});
				},
				() => {
					this.setState({confirmLoading: false});
					notification['error']({
						message: i18n.t`La pièce jointe n'a pas été ajoutée.`,
						className: 'qhs-notification error'
					});
				}
			);
		});
	}
}

export default withI18n()(AddDocumentModal);