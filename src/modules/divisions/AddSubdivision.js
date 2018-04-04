import React from 'react';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import SubdivisionForm from './forms/SubdivisionForm';
import FormComp from 'antd/lib/form';
import apiClient from '../../apiClient';
import jsonStringifyPreserveUndefined from '../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddSubdivision extends React.Component {

	state = {
		submitting: false
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				const {i18n} = this.props;
				// reset api form errors
				let fieldValues = {};
				Object.keys(values).forEach(key => {
					fieldValues[key] = {
						value: values[key]
					};
				});
				this.props.form.setFields(fieldValues);
				this.setState({submitting: true});
				apiClient.fetch('/divisions', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined({
						...values,
						country: values['country'] ? values['country']['key'] : null
					})
				}).then(
					(response) => {
						this.setState({submitting: false});
						this.props.history.push('/divisions/' + response.json.id);
						notification['success']({
							message: i18n.t`L'organisation a bien été créée.`,
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
									this.props.form.setFields(fields);
								}
								this.setState({submitting: false});
								notification['error']({
									message: i18n.t`L'organisation n'a pas été créée.`,
									className: 'qhs-notification error'
								});
							}
						);

					}
				);
			}
		});
	}

	render() {
		const {submitting} = this.state;
		return(
			<div className="form">
				<div className="form-content">
					<Card title={
						<div className="form-title"><Icon type="plus-circle-o" /> {'Ajouter une organisation'}</div>
					}>
						<SubdivisionForm form={this.props.form}/>
						<div className="form-buttons">
							<Button size="large" type="primary" loading={submitting} onClick={this.handleSubmit}>
								<EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>
							</Button>
							<Button size="large" onClick={() => this.props.history.push('/divisions')}>
								<EditableTransWrapper><Trans>Annuler</Trans></EditableTransWrapper>
							</Button>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}


export default FormComp.create()(withI18n()(AddSubdivision));