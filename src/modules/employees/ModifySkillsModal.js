import React from 'react';
import ModifySkillsForm from './ModifySkillsForm';
import ActionModalForm from '../../components/ActionModalForm';
import {Trans} from 'lingui-react';
import apiClient from '../../apiClient';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';

export default class ModifySkillsModal extends ActionModalForm {
	constructor(props) {
		super(props, ModifySkillsForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Modifier les compétences</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		this.form.validateFields((err, fieldsValue) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			apiClient.fetch(this.props.employee['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined(fieldsValue)
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
				}
			);
		});
	}
}