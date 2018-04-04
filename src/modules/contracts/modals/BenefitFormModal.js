import React from 'react';
import BenefitForm from '../forms/BenefitForm';
import ActionModalForm from '../../../components/ActionModalForm';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import notification from 'antd/lib/notification';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class BenefitFormModal extends ActionModalForm {
	constructor(props) {
		const modalTitle = <div className="modal-title">
			{
				props.benefit ?
					<EditableTransWrapper><Trans>{'Modifier la prestation'}</Trans></EditableTransWrapper>
					:
					<EditableTransWrapper><Trans>{'Ajouter une prestation'}</Trans></EditableTransWrapper>
			}
		</div>;
		super(props, BenefitForm, modalTitle, null, null);
	}

	formatValues = (values) => {
		const {contract} = this.props;
		values.contract = contract['@id'];
		values.subDivision = values.zone || values.site;
		values.benefitTimeConstraints = [];
		const {startDays, endDays, startHours, endHours, constraintsIds} = values;
		if (startDays && startDays.length) {
			values.benefitTimeConstraints = startDays.map((startDay, idx) => {
				let value = {};
				if (constraintsIds[idx]) {
					value['@id'] = constraintsIds[idx];
				}
				return {
					...value,
					startDay,
					startHour: startHours[idx],
					endDay: endDays[idx],
					endHour: endHours[idx]
				};
			}).filter((x) => x !== null);
		}
		delete values.zone;
		delete values.site;
		delete values.constraintsIds;
		delete values.startDays;
		delete values.endDays;
		delete values.startHours;
		delete values.endHours;
		return values;
	}

	handleSubmit = (values) => {
		const {i18n, benefit, newBenefitForAdditionalClause, contract} = this.props;
		values = this.formatValues(values);
		let promise, okMessage, errorMessage;
		if (benefit && !benefit.modification) {
			// modification benefit
			promise = apiClient.fetch(benefit['@id'], {
				method: 'PUT',
				body: JSON.stringify({
					...values
				})
			});
			okMessage = i18n.t`La prestation a été bien modifiée.`;
			errorMessage = i18n.t`La prestation n'a pas été modifiée.`;
		} else if (benefit && benefit.modification)  {
			// modification amendmentModification
			let {title, description, numberOperations, priceTaxExcl, quantity} = values;
			numberOperations = (numberOperations || 0) - benefit.numberOperations;
			priceTaxExcl = (priceTaxExcl || 0) - benefit.priceTaxExcl;
			quantity = (quantity || 0) - benefit.quantity;
			numberOperations = numberOperations || null;
			priceTaxExcl = priceTaxExcl || null;
			quantity = quantity || null;
			if (title === benefit.title) {
				title = null;
			}
			if (description === benefit.description) {
				description = null;
			}
			promise = apiClient.fetch(benefit.modification['@id'], {
				method: 'PUT',
				body: JSON.stringify({title, description, numberOperations, priceTaxExcl, quantity})
			});
			okMessage = i18n.t`La prestation de l'avenant a été bien modifiée.`;
			errorMessage = i18n.t`La prestation de l'avenant n'a pas été modifiée.`;
		} else if (!newBenefitForAdditionalClause) {
			//creation benefit
			promise = apiClient.fetch('/benefits', {
				method: 'POST',
				body: JSON.stringify({
					...values
				})
			});
			okMessage = i18n.t`La prestation a été bien ajoutée.`;
			errorMessage = i18n.t`La prestation n'a pas été ajoutée.`;
		} else if (newBenefitForAdditionalClause) {
			// creation amendmentModification new benefit
			promise = apiClient.fetch('/amendment_modifications', {
				method: 'POST',
				body: JSON.stringify({
					benefit: {
						...values
					},
					isNewBenefit: true,
					amendment: contract['@id']
				})
			});
			okMessage = i18n.t`La prestation a été bien ajoutée à l'avenant.`;
			errorMessage = i18n.t`La prestation n'a pas été ajoutée à l'avenant.`;
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

export default withI18n()(BenefitFormModal);