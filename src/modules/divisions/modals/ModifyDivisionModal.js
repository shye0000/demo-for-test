import React from 'react';
import Form from '../forms/Form';
import ActionModalForm from '../../../components/ActionModalForm/index';
import apiClient from '../../../apiClient';
import {Trans, withI18n, i18nMark} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import {UPDATE_HIERARCHY} from '../redux/actions';
import actions from '../redux/actions';
import {connect} from 'react-redux';

const mapDispatchToProps = (dispatch) => {
	return {
		updateHierarchy: () => {
			dispatch(actions[UPDATE_HIERARCHY]());
		}
	};
};

class ModifyDivisionModal extends ActionModalForm {
	constructor(props) {
		const title = !props.division.parent ?
			i18nMark('Modifier les informations de l\'organisation')
			:
			i18nMark('Modifier les informations de la sous-organisation');
		super(props, Form,
			<div className="modal-title">
				<EditableTransWrapper><Trans id={title} /></EditableTransWrapper>
			</div>, <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n, division} = this.props;
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
			apiClient.fetch(this.props.division['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
					parent: division.parent ? division.parent['@id'] : null,
					country: values.country ? values.country.key : null
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));
					notification['success']({
						message: i18n.t`L'organisation a bien été modifiée.`,
						className: 'qhs-notification success'
					});
					this.props.updateHierarchy();
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
								message: i18n.t`L'organisation n'a pas été modifiée.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default connect(null, mapDispatchToProps)(withI18n()(ModifyDivisionModal));