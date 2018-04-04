import React from 'react';
import Icon from 'antd/lib/icon';
import notification from 'antd/lib/notification';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Form from './Form';
import FormComp from 'antd/lib/form';
import apiClient from '../../../apiClient';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddContract extends React.Component {

	state = {
		submitting: false
	}

	formatValues = (values, nature) => {
		values.division = values.division.key;
		values.clientAddress.country  = values.clientAddress.country ? values.clientAddress.country.key : undefined;
		let formattedValues = {
			...values,
			nature: parseInt(nature),
			tacitRenewal : values.tacitRenewal === 'true' ? true : false,
			linkedToPurchaseOrders : values.linkedToPurchaseOrders === 'true' ? true : false,
			autoLiquidation : values.autoLiquidation === 'true' ? true : false,
		};
		if (nature === '2') {
			formattedValues.dc4Mode = values.dc4Mode === 'true' ? true : false;
		} else {
			delete formattedValues.dc4Mode;
		}
		return formattedValues;
	}

	getRequestConfig = (nature) => {
		let dashboardUrl, okMessage, errorMessage;
		const {i18n} = this.props;
		if (nature === '2') {
			dashboardUrl = '/contracts/list/';
			okMessage = i18n.t`Le contrat a bien été créé.`;
			errorMessage = i18n.t`Le contrat n'a pas été créé.`;
		} else if (nature === '3') {
			dashboardUrl = '/contracts/list/quotations/';
			okMessage = i18n.t`Le devis a bien été créé.`;
			errorMessage = i18n.t`Le devis n'a pas été créé.`;
		} else {
			return;
		}
		return {dashboardUrl, okMessage, errorMessage};
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, history, match} = this.props;
		// todo "Ask Florian in which case the contract is passed from the props?"
		// todo "weird because this is the route component for creation only"
		form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let nature, requestConfig, formattedValues;
				if (match.params.nature) {
					nature = match.params.nature;
				} else {
					return;
				}

				formattedValues = this.formatValues(values, nature);

				requestConfig = this.getRequestConfig(nature);
				if (!requestConfig) {
					return;
				}
				const {dashboardUrl, okMessage, errorMessage} = requestConfig;

				this.setState({submitting: true});

				apiClient.fetch('/contracts', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined(formattedValues)
				}).then(
					(response) => {
						this.setState({submitting: false});
						history.push(dashboardUrl + response.json.id);
						notification['success']({
							message: okMessage,
							className: 'qhs-notification success'
						});
					},
					(error) => {
						error.response.json().then(
							() => {
								this.setState({submitting: false});
								notification['error']({
									message: errorMessage,
									className: 'qhs-notification error'
								});
							}
						);
					}
				);
			}
		});
	}

	goBack = () => {
		const hasPreviewsPage = window.hasPreviousLocation;
		const {history} = this.props;
		if (hasPreviewsPage) {
			return history.goBack();
		}
		history.push('/contracts');
	}

	render() {
		const {submitting} = this.state;
		const {match, history} = this.props;
		const nature = match.params.nature;
		let formTitle;
		if (nature === '2') { // contract
			formTitle = <Trans>Créer un contrat</Trans>;
		} else if (nature === '3') { // quotation
			formTitle = <Trans>Créer un devis</Trans>;
		} else {
			return history.push('/not_found');
		}
		return(
			<div className="form">
				<div className="form-content">
					<Card title={
						<div className="form-title">
							<Icon type="plus-circle-o" />
							{' '}
							<EditableTransWrapper>{formTitle}</EditableTransWrapper>
						</div>
					}>
						<Form form={this.props.form}/>
						<div className="form-buttons">
							<Button size="large" type="primary" loading={submitting} onClick={this.handleSubmit}>
								<EditableTransWrapper><Trans>Ajouter</Trans></EditableTransWrapper>
							</Button>
							<Button size="large" onClick={this.goBack}>
								<EditableTransWrapper><Trans>Annuler</Trans></EditableTransWrapper>
							</Button>
						</div>
					</Card>
				</div>
			</div>
		);
	}
}


export default FormComp.create()(withI18n()(AddContract));