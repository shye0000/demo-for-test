import React from 'react';
import UnavailabilityForm from './UnavailabilityForm';
import ActionModalForm from '../../components/ActionModalForm';
import notification from 'antd/lib/notification';
import apiClient from '../../apiClient';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyUnavailabilityModal extends ActionModalForm {
	constructor(props) {
		super(props, UnavailabilityForm, <div className="modal-title">
			<EditableTransWrapper><Trans>{'Modifier l \'indisponibilité'}</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n} = this.props;
		this.form.validateFields((err, fieldsValue) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			apiClient.fetch(this.props.unavailability['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...fieldsValue,
					vehicle: this.props.unavailability.vehicle
				})
			}).then(
				(response) => {
					this.setState({confirmLoading: false});
					this.props.onCloseCallback(true, response.json);
					notification['success']({
						message: i18n.t`L'indisponibilité a été bien modifiée.`,
						className: 'qhs-notification success'
					});
				},
				() => {
					this.setState({confirmLoading: false});
					notification['error']({
						message: i18n.t`L'indisponibilité n'a pas été modifiée.`,
						className: 'qhs-notification error'
					});
				}
			);
		});
	}
}

export default withI18n()(ModifyUnavailabilityModal);