import React from 'react';
import SubDivisionForm from '../forms/SubdivisionForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import apiClient from '../../../apiClient';
import {Trans, withI18n, i18nMark} from 'lingui-react';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import { withRouter } from 'react-router';
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

class AddSubDivisionModal extends ActionModalForm {
	constructor(props) {
		const title = props.parentSubDivision ?
			i18nMark('Ajouter une zone')
			:
			i18nMark('Ajouter un site');
		super(props, SubDivisionForm,
			<div className="modal-title">
				<EditableTransWrapper><Trans id={title} /></EditableTransWrapper>
			</div>, <EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		const {i18n, parentDivision, history, parentSubDivision} = this.props;
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
			if(!values.country)
				values.country = {key: null};

			this.form.setFields(fieldValues);
			this.setState({confirmLoading: true});

			const divisionsValue = parentDivision && !parentSubDivision ? {divisions: [parentDivision['@id']]} : null;
			let response, redirectionLink;
			if (values.site) {
				const siteSelected = values.site;
				const linkedSitesValue = values.linkedSites.map(linkedSite =>{
					return linkedSite;
				});
				response = apiClient.fetch(parentDivision['@id'], {
					method: 'PUT',
					body: jsonStringifyPreserveUndefined({
						subDivisions: [
							...linkedSitesValue,
							'/sub_divisions/' + siteSelected.key
						]
					})
				});
				redirectionLink = '/divisions/split/' + parentDivision.id + '/' + siteSelected.key;
			} else {
				response = apiClient.fetch('/sub_divisions', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined({
						...values,
						...divisionsValue,
						parent: parentSubDivision ? parentSubDivision['@id'] : null,
						country: values.country.key
					})
				});
			}
			response.then(
				(response) => {
					redirectionLink = redirectionLink || '/divisions/split/' + parentDivision.id + '/' + response.json.id;
					this.setState({confirmLoading: false});
					notification['success']({
						message: i18n.t`L'organisation a bien été modifiée.`,
						className: 'qhs-notification success'
					});
					history.push(redirectionLink);
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

export default connect(null, mapDispatchToProps)(withI18n()(withRouter(AddSubDivisionModal)));