import React from 'react';
import Form from './Form';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import notification from 'antd/lib/notification';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import {toggleEditTranslationInline} from 'wbc-components/lib/Translations/redux/actions';
import {logout} from 'wbc-components/lib/utils/JWTAuthentication/redux/actions';
import {connect} from 'react-redux';

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => {
			dispatch(toggleEditTranslationInline(false));
			dispatch(logout());
		}
	};
};

const mapStateToProps = (state) => {
	return {
		authData: state.user.data
	};
};

class ModifyUserModal extends ActionModalForm {
	constructor(props) {
		super(props, Form, <div className="modal-title">
			<EditableTransWrapper><Trans>{'Modifier les accès du salarié'}</Trans></EditableTransWrapper>
		</div>);
	}

	checkIsSelf = () => {
		const {user} = this.props;

		return user.email === this.props.authData.username;
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n, logout, user} = this.props;
		const userEmail = user.email;
		const self = this.checkIsSelf();

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

			if (!values.plainPassword) {
				delete values.plainPassword;
				delete values.confirmPlainPassword;
			}

			apiClient.fetch(this.props.user['@id'], {
				method: 'PUT',
				body: jsonStringifyPreserveUndefined({
					...values,
					enabled: values.enabled ? true : false
				})
			}).then(
				() => {
					this.setState({confirmLoading: false}, () => this.props.onCloseCallback(true));

					if ((values.plainPassword || userEmail != values.email) && self) {
						logout();
						notification['success']({
							message: i18n.t`Votre mot de passe ou votre email ont été modifiés. Veuillez vous reconnecter.`,
							className: 'qhs-notification success'
						});
					} else {
						notification['success']({
							message: i18n.t`L'utilisateur a bien été modifié.`,
							className: 'qhs-notification success'
						});
					}
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
								message: i18n.t`L'utilisateur n'a pas été modifié.`,
								className: 'qhs-notification error'
							});
						}
					);

				}
			);
		});
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(ModifyUserModal));
