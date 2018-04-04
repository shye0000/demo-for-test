import React from 'react';
import SelectBuyingDataPointForm from '../forms/SelectBuyingDataPointForm';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class SelectBuyingDataPointModal extends ActionModalForm {
	constructor(props) {
		super(props, SelectBuyingDataPointForm, <div className="modal-title">
			<EditableTransWrapper><Trans>{'Sélectionner un point de contact achat'}</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Sélectionner</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n, contract} = this.props;
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
			apiClient.fetch(contract['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					buyingDataPoint: values.buyingDataPoint,
				})
			}).then(
				(data) => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true, data));
					notification['success']({
						message: i18n.t`Le point de contact achat a été bien sélectionné.`,
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
								message: i18n.t`Le point de contact achat n'a pas été sélectionné.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default withI18n()(SelectBuyingDataPointModal);