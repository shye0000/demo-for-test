import React from 'react';
import UnavailabilityForm from './UnavailabilityForm';
import ActionModalForm from '../../components/ActionModalForm';
import notification from 'antd/lib/notification';
import apiClient from '../../apiClient';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddUnavailabilityModal extends ActionModalForm {
	constructor(props) {
		super(props, UnavailabilityForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Ajouter une indisponibilité</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {vehicle, i18n} = this.props;
		this.form.validateFields((err, fieldsValue) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			apiClient.fetch('/vehicle_unavailabilities', {
				method: 'POST',
				body: jsonStringifyPreserveUndefined({
					...fieldsValue,
					vehicle: vehicle['@id']
				})
			}).then(
				(response) => {
					this.setState({confirmLoading: false});
					this.props.onCloseCallback(true, response.json);
					notification['success']({
						message: i18n.t`L'indisponibilité a été bien ajoutée.`,
						className: 'qhs-notification success'
					});
				},
				() => {
					this.setState({confirmLoading: false});
					notification['error']({
						message: i18n.t`L'indisponibilité n'a pas été ajoutée.`,
						className: 'qhs-notification error'
					});
				}
			);
		});
	}
}

export default withI18n()(AddUnavailabilityModal);