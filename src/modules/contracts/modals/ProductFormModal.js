import React from 'react';
import ProductFrom from '../forms/ProductFrom';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ProductFormModal extends ActionModalForm {
	constructor(props) {
		const modalTitle = <div className="modal-title">
			{
				props.benefit ?
					<EditableTransWrapper><Trans>{'Modifier le produit'}</Trans></EditableTransWrapper>
					:
					<EditableTransWrapper><Trans>{'Ajouter un produit'}</Trans></EditableTransWrapper>
			}
		</div>;
		super(props, ProductFrom, modalTitle, null, null);
	}

	formatValues = (values) => {
		const {contract} = this.props;
		values.contract = contract['@id'];
		values.subDivision = values.zone || values.site;
		delete values.zone;
		delete values.site;
		delete values.productTypeFake;
		return values;
	}

	handleSubmit = (values) => {
		const {i18n, product} = this.props;
		values = this.formatValues(values);
		let promise, okMessage, errorMessage;
		if (product) {
			// modification benefit
			promise = apiClient.fetch(product['@id'], {
				method: 'PUT',
				body: JSON.stringify({
					...values
				})
			});
			okMessage = i18n.t`Le produit a été bien modifiée.`;
			errorMessage = i18n.t`Le produit n'a pas été modifiée.`;
		} else {
			//creation benefit
			promise = apiClient.fetch('/products', {
				method: 'POST',
				body: JSON.stringify({
					...values
				})
			});
			okMessage = i18n.t`Le produit a été bien ajoutée.`;
			errorMessage = i18n.t`Le produit n'a pas été ajoutée.`;
		}
		if (promise) {
			promise.then(
				() => {
					this.props.onCloseCallback(true);
					notification['success']({
						message: okMessage,
						className: 'qhs-notification success'
					});
				},
				() => {
					notification['error']({
						message: errorMessage,
						className: 'qhs-notification error'
					});
				}
			);
		}
		return promise;
	}
}

export default withI18n()(ProductFormModal);