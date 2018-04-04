import SetStatusForm from '../forms/SetStatusForm';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import moment from 'moment';

class SetStatusModal extends ActionModalForm {
	constructor(props) {
		super(props, SetStatusForm, props.config.modalTitle, props.config.modalOKText);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {contract, config} = this.props;
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

			let updateContractStatusHistory = true;
			if (config.targetStatus === 8) {
				let updateContract = true;
				let now = moment();

				if (moment(values.closedAt.format('YYYY-MM-DD')).isSame(now.format('YYYY-MM-DD'))) {
					updateContract = false;
				} else if (moment(values.closedAt.format('YYYY-MM-DD')).isAfter(now.format('YYYY-MM-DD'))) {
					updateContractStatusHistory = false;
				}

				if (updateContract === true) {
					apiClient.fetch(contract['@id'], {
						method: 'PUT',
						body: jsonStringifyPreserveUndefined({
							closedAt: values.closedAt
						})
					}).then(
						() => {
							if (updateContractStatusHistory === false) {
								this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
								notification['success']({
									message: config.successMessage,
									className: 'qhs-notification success'
								});
							}
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
										message: config.failMessage,
										className: 'qhs-notification error'
									});
								}
							);

						}
					);
				}
			}

			if (updateContractStatusHistory === true) {
				apiClient.fetch('/contract_status_histories', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined({
						comment: values.comment,
						rejectionReason: values.rejectionReason,
						status: config.targetStatus,
						contract: contract['@id']
					})
				}).then(
					() => {
						this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
						notification['success']({
							message: config.successMessage,
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
									message: config.failMessage,
									className: 'qhs-notification error'
								});
							}
						);

					}
				);
			}
		});
	}
}

export default SetStatusModal;