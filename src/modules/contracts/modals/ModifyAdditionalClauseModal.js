import React from 'react';
import Form from '../forms/Form';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import notification from 'antd/lib/notification';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyAdditionalClauseModal extends ActionModalForm {
	constructor(props) {
		super(props, Form, <div className="modal-title">
			<EditableTransWrapper><Trans>{'Modifier l\'avenant'}</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n} = this.props;
		this.form.validateFields((err, values) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			apiClient.fetch(this.props.contract['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`L'avenant a été bien modifié.`,
						className: 'qhs-notification success'
					});
				},
				(error) => {
					error.response.json().then(
						() => {
							this.setState({confirmLoading: false});
							notification['error']({
								message: i18n.t`L'avenant n'a pas été modifié.`,
								className: 'qhs-notification error'
							});
						}
					);
				}
			);
		});
	}
}

export default withI18n()(ModifyAdditionalClauseModal);