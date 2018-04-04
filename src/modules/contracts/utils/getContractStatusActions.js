import React from 'react';
import Icon from 'antd/lib/icon';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import SetStatusModal from '../modals/SetStatusModal';
import SetStatusSendToClientModal from '../modals/SetStatusSendToClientModal';
import {Trans} from 'lingui-react';
import {checkUserHasRole} from '../../utils/userRightsManagement';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import apiClient from '../../../apiClient';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';


let i18n;

const setToCreationAction = (contract, statusChangedCallback) => {

	let successMessage, failMessage;
	switch (contract.nature) {
		case 1:
			successMessage = <Trans>{'L\'avenant a été bien renvoyé en phase de création.'}</Trans>;
			failMessage = <Trans>{'L\'avenant n\'a pas été renvoyé en phase de création.'}</Trans>;
			break;
		case 2:
			successMessage = <Trans>Le contrat a été bien renvoyé en phase de création.</Trans>;
			failMessage = <Trans>{'Le contrat n\'a pas été renvoyé en phase de création.'}</Trans>;
			break;
		case 3:
			successMessage = <Trans>Le devis a été bien renvoyé en phase de création.</Trans>;
			failMessage = <Trans>{'Le devis n\'a pas été renvoyé en phase de création.'}</Trans>;
			break;
	}

	return {
		id: 'sendToCreation',
		icon: <Icon type="edit" />,
		title: <EditableTransWrapper><Trans>Renvoyer en phase de création</Trans></EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 1,
			modalTitle: <EditableTransWrapper><Trans>Renvoyer en phase de création</Trans></EditableTransWrapper>,
			successMessage,
			failMessage
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToValidationAction = (contract, statusChangedCallback) => {

	let title, modalTitle, modalOkText, successMessage, failMessage;
	modalOkText = <Trans>Soumettre</Trans>;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Soumettre l\'avenant à la validation'}</Trans>;
			modalTitle = <Trans>{'Soumettre l\'avenant à la validation'}</Trans>;
			successMessage = <Trans>{'L\'avenant a été bien soumis à la validation.'}</Trans>;
			failMessage = <Trans>{'L\'avenant n\'a pas été soumis à la validation.'}</Trans>;
			break;
		case 2:
			title = <Trans>Soumettre le contrat à la validation</Trans>;
			modalTitle = <Trans>Soumettre le contrat à la validation</Trans>;
			successMessage = <Trans>Le contrat a été bien soumis à la validation.</Trans>;
			failMessage = <Trans>{'Le contrat n\'a pas été soumis à la validation.'}</Trans>;
			break;
		case 3:
			title = <Trans>Soumettre le devis à la validation</Trans>;
			modalTitle = <Trans>Soumettre le devis à la validation</Trans>;
			successMessage = <Trans>Le devis a été bien soumis à la validation.</Trans>;
			failMessage = <Trans>{'Le devis n\'a pas été soumis à la validation.'}</Trans>;
			break;
	}

	return {
		id: 'sendToValidation',
		icon: <Icon type="check-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 2,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage,
			failMessage
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToRefusedAction = (contract, statusChangedCallback) => {

	let title, modalTitle, modalOkText, successMessage, failMessage;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Annuler l\'avenant'}</Trans>;
			modalTitle = <Trans>{'Annuler l\'avenant'}</Trans>;
			modalOkText = <Trans>{'Annuler l\'avenant'}</Trans>;
			successMessage = <Trans>{'L\'avenant a été bien annulé.'}</Trans>;
			failMessage = <Trans>{'L\'avenant n\'a pas été annulé.'}</Trans>;
			break;
		case 2:
			title = <Trans>Annuler le contrat</Trans>;
			modalTitle = <Trans>Annuler le contrat</Trans>;
			modalOkText = <Trans>Annuler le contrat</Trans>;
			successMessage = <Trans>Le contrat a été bien annulé.</Trans>;
			failMessage = <Trans>{'Le contrat n\'a pas été annulé.'}</Trans>;
			break;
		case 3:
			title = <Trans>Annuler le devis</Trans>;
			modalTitle = <Trans>Annuler le devis</Trans>;
			modalOkText = <Trans>Annuler le devis</Trans>;
			successMessage = <Trans>Le devis a été bien annulé.</Trans>;
			failMessage = <Trans>{'Le devis n\'a pas été annulé.'}</Trans>;
			break;
	}

	return {
		id: 'cancelContract',
		type: 'danger',
		icon: <Icon type="close-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 3,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage,
			failMessage
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToValidatedAction = (contract, statusChangedCallback) => {

	let title, modalTitle, modalOkText, successMessage, failMessage;
	modalOkText = <Trans>Valider</Trans>;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Valider l\'avenant'}</Trans>;
			modalTitle = <Trans>{'Valider l\'avenant'}</Trans>;
			successMessage = <Trans>{'L\'avenant a été bien validé.'}</Trans>;
			failMessage = <Trans>{'L\'avenant n\'a pas été validé.'}</Trans>;
			break;
		case 2:
			title = <Trans>Valider le contrat</Trans>;
			modalTitle = <Trans>Valider le contrat</Trans>;
			successMessage = <Trans>Le contrat a été bien validé.</Trans>;
			failMessage = <Trans>{'Le contrat n\'a pas été validé.'}</Trans>;
			break;
		case 3:
			title = <Trans>Valider le devis</Trans>;
			modalTitle = <Trans>Valider le devis</Trans>;
			successMessage = <Trans>Le devis a été bien validé.</Trans>;
			failMessage = <Trans>{'Le devis n\'a pas été validé.'}</Trans>;
			break;
	}

	return {
		id: 'sendToValidated',
		icon: <Icon type="check-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 4,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage,
			failMessage
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToSendToClientAction = (contract, statusChangedCallback) => {

	let title;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Envoyer l\'avenant au contact Achat'}</Trans>;
			break;
		case 2:
			title = <Trans>Envoyer le contrat au contact Achat</Trans>;
			break;
		case 3:
			title = <Trans>Envoyer le devis au contact Achat</Trans>;
			break;
	}

	return {
		id: 'sendToClient',
		icon: <Icon type="mail" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusSendToClientModal refreshPageWhenCancel={true} width={750} contract={contract}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToActivatedAction = (contract, statusChangedCallback) => {
	let title, modalTitle, modalOkText, successMessage, failMessage;

	if (contract.status === 7) {
		modalOkText = <Trans>Réactiver</Trans>;
		switch (contract.nature) {
			case 1:
				title = <Trans>{'Réactiver l\'avenant'}</Trans>;
				modalTitle = <Trans>{'Réactiver l\'avenant'}</Trans>;
				successMessage = <Trans>{'L\'avenant a été bien réactivé.'}</Trans>;
				failMessage = <Trans>{'L\'avenant n\'a pas été réactivé.'}</Trans>;
				break;
			case 2:
				title = <Trans>Réactiver le contrat</Trans>;
				modalTitle = <Trans>Réactiver le contrat</Trans>;
				successMessage = <Trans>Le contrat a été bien réactivé.</Trans>;
				failMessage = <Trans>{'Le contrat n\'a pas été réactivé.'}</Trans>;
				break;
			case 3:
				title = <Trans>Réactiver le devis</Trans>;
				modalTitle = <Trans>Réactiver le devis</Trans>;
				successMessage = <Trans>Le devis a été bien réactivé.</Trans>;
				failMessage = <Trans>{'Le devis n\'a pas été réactivé.'}</Trans>;
				break;
		}
	} else {
		modalOkText = <Trans>Activer</Trans>;
		switch (contract.nature) {
			case 1:
				title = <Trans>{'Activer l\'avenant'}</Trans>;
				modalTitle = <Trans>{'Activer l\'avenant'}</Trans>;
				successMessage = <Trans>{'L\'avenant a été bien activé.'}</Trans>;
				failMessage = <Trans>{'L\'avenant n\'a pas été activé.'}</Trans>;
				break;
			case 2:
				title = <Trans>Activer le contrat</Trans>;
				modalTitle = <Trans>Activer le contrat</Trans>;
				successMessage = <Trans>Le contrat a été bien activé.</Trans>;
				failMessage = <Trans>{'Le contrat n\'a pas été activé.'}</Trans>;
				break;
			case 3:
				title = <Trans>Activer le devis</Trans>;
				modalTitle = <Trans>Activer le devis</Trans>;
				successMessage = <Trans>Le devis a été bien activé.</Trans>;
				failMessage = <Trans>{'Le devis n\'a pas été activé.'}</Trans>;
				break;
		}
	}

	return {
		id: 'setToActivated',
		icon: <Icon type="check-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 6,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage,
			failMessage
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToSuspendedAction = (contract, statusChangedCallback) => {

	let title, modalTitle, modalOkText, successMessage, failMessage, actionDescription;
	modalOkText = <Trans>Suspendre</Trans>;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Suspendre l\'avenant'}</Trans>;
			modalTitle = <Trans>{'Suspendre l\'avenant'}</Trans>;
			successMessage = <Trans>{'L\'avenant a été suspendu.'}</Trans>;
			failMessage = <Trans>{'L\'avenant n\'a pas été suspendu.'}</Trans>;
			actionDescription = <Trans>{'Les interventions programmées pour cet avenant seront suspendues jusqu\'à réactivation.'}</Trans>;
			break;
		case 2:
			title = <Trans>Suspendre le contrat</Trans>;
			modalTitle = <Trans>Suspendre le contrat</Trans>;
			successMessage = <Trans>Le contrat a été suspendu.</Trans>;
			failMessage = <Trans>{'Le contrat n\'a pas été suspendu.'}</Trans>;
			actionDescription = <Trans>{'Les interventions programmées pour ce contrat seront suspendues jusqu\'à réactivation.'}</Trans>;
			break;
		case 3:
			title = <Trans>Suspendre le devis</Trans>;
			modalTitle = <Trans>Suspendre le devis</Trans>;
			successMessage = <Trans>Le devis a été suspendu.</Trans>;
			failMessage = <Trans>{'Le devis n\'a pas été suspendu.'}</Trans>;
			actionDescription = <Trans>{'Les interventions programmées pour ce devis seront suspendues jusqu\'à réactivation.'}</Trans>;
			break;
	}

	return {
		id: 'setToSuspended',
		type: 'danger',
		icon: <Icon type="close-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 7,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage: successMessage,
			failMessage: failMessage,
			actionDescription: <EditableTransWrapper>{actionDescription}</EditableTransWrapper>
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const setToClosedAction = (contract, statusChangedCallback) => {

	let title, modalTitle, modalOkText, successMessage, failMessage, actionDescription;

	if (contract.closedAt) {
		title = <Trans>Annuler la clôture</Trans>;
		modalOkText = i18n.t`Annuler la clôture`;
		switch (contract.nature) {
			case 1:
				modalTitle = i18n.t`Voulez-vous annuler la clôture de l'avenant?`;
				successMessage = i18n.t`La clôture de l'avenant a été annulée`;
				failMessage = i18n.t`La clôture de l'avenant n'a pas été annulée`;
				break;
			case 2:
				modalTitle = i18n.t`Voulez-vous annuler la clôture du contrat?`;
				successMessage = i18n.t`La clôture du contrat a été annulée`;
				failMessage = i18n.t`La clôture du contrat n'a pas été annulée`;
				break;
			case 3:
				modalTitle = i18n.t`Voulez-vous annuler la clôture du devis?`;
				successMessage = i18n.t`La clôture du devis a été annulée`;
				failMessage = i18n.t`La clôture du devis n'a pas été annulée`;
				break;
		}
		return {
			id: 'removeClosedAt',
			type: 'danger',
			icon: <Icon type="close-circle-o" />,
			title: <EditableTransWrapper>{title}</EditableTransWrapper>,
			method: () => {
				Modal.confirm({
					title: modalTitle,
					className: 'qhs-confirm-modal delete',
					iconType: 'exclamation-circle',
					okText: modalOkText,
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					maskClosable: true,
					onOk: () => {
						apiClient.fetch(contract['@id'], {
							method: 'PUT',
							body: jsonStringifyPreserveUndefined({
								closedAt: null
							})
						}).then(
							(response) => {
								if (response.status == 200) {
									notification['success']({
										message: successMessage,
										className: 'qhs-notification success'
									});
								}

								statusChangedCallback();
							},
							(response) => {
								if (!response.response.ok) {
									notification['error']({
										message: failMessage,
										className: 'qhs-notification error'
									});
								}
							}
						);
					}
				});
			},
			requiredRights: [{uri: '/contracts', action: 'PUT'}]
		};
	}

	modalOkText = <Trans>Clore</Trans>;
	actionDescription = <Trans>Le jour de la clôture, toute intervention restante sera annulée.</Trans>;
	switch (contract.nature) {
		case 1:
			title = <Trans>{'Clore l\'avenant'}</Trans>;
			modalTitle = <Trans>{'Clore l\'avenant'}</Trans>;
			successMessage = <Trans>{'La clôture de l\'avenant a bien été programmée.'}</Trans>;
			failMessage = <Trans>{'La clôture de l\'avenant n\'a pas été programmée.'}</Trans>;
			break;
		case 2:
			title = <Trans>Clore le contrat</Trans>;
			modalTitle = <Trans>Clore le contrat</Trans>;
			successMessage = <Trans>La clôture du contrat a bien été programmée.</Trans>;
			failMessage = <Trans>{'La clôture du contrat n\'a pas été programmée.'}</Trans>;
			break;
		case 3:
			title = <Trans>Clore le devis</Trans>;
			modalTitle = <Trans>Clore le devis</Trans>;
			successMessage = <Trans>La clôture du devis a bien été programmée.</Trans>;
			failMessage = <Trans>{'La clôture du devis n\'a pas été programmée.'}</Trans>;
			break;
	}
	return {
		id: 'setToClosed',
		type: 'danger',
		icon: <Icon type="close-circle-o" />,
		title: <EditableTransWrapper>{title}</EditableTransWrapper>,
		modal: <SetStatusModal width={750} contract={contract} config={{
			targetStatus: 8,
			modalTitle: <EditableTransWrapper>{modalTitle}</EditableTransWrapper>,
			modalOKText: <EditableTransWrapper>{modalOkText}</EditableTransWrapper>,
			successMessage: successMessage,
			failMessage: failMessage,
			actionDescription: <EditableTransWrapper>{actionDescription}</EditableTransWrapper>
		}}/>,
		modalCloseCallback: (refresh) => {
			if (refresh) {
				statusChangedCallback();
			}
		},
		requiredRights: [{uri: '/contract_status_histories', action: 'POST'}]
	};
};

const getStatusActionsForSalesManager = (contract, statusChangedCallback) => {
	switch (contract.status) {
		case 1: // CREATION_IN_PROGRESS
			return [
				setToValidationAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 2: // VALIDATION_IN_PROGRESS
			return [
				setToCreationAction(contract, statusChangedCallback),
				setToValidatedAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 3: // REFUSED
			return [
				setToCreationAction(contract, statusChangedCallback),
				setToValidatedAction(contract, statusChangedCallback)
			];
		case 4: // VALIDATED
			return [
				setToCreationAction(contract, statusChangedCallback),
				setToSendToClientAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 5: // SENT_TO_CLIENT
			return [
				setToCreationAction(contract, statusChangedCallback),
				setToActivatedAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 6: // ACTIVATED
			return [
				setToSuspendedAction(contract, statusChangedCallback),
				setToClosedAction(contract, statusChangedCallback)
			];
		case 7: // SUSPENDED
			return [
				setToActivatedAction(contract, statusChangedCallback),
				setToClosedAction(contract, statusChangedCallback)
			];
		case 8: // CLOSED
			return [];
	}
};

const getStatusActionsForAdministrationManager = (contract, statusChangedCallback) => {
	switch (contract.status) {
		case 1: // CREATION_IN_PROGRESS
			return [
				setToValidationAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 4: // VALIDATED
			return [
				setToSendToClientAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 5: // SENT_TO_CLIENT
			return [
				setToActivatedAction(contract, statusChangedCallback),
				setToRefusedAction(contract, statusChangedCallback)
			];
		case 6: // ACTIVATED
			return [
				setToClosedAction(contract, statusChangedCallback)
			];
		case 2: // VALIDATION_IN_PROGRESS
		case 3: // REFUSED
		case 7: // SUSPENDED
		case 8: // CLOSED
			return [];
	}
};

const getContractStatusActions = (i18nFormComponent, contract, statusChangedCallback) => {
	let actions = [];
	i18n = i18nFormComponent;
	if (checkUserHasRole('ROLE_SALES_MANAGER')) {
		actions = getStatusActionsForSalesManager(contract, statusChangedCallback);
	} else if (checkUserHasRole('ROLE_ADMINISTRATION_MANAGER')) {
		actions = getStatusActionsForAdministrationManager(contract, statusChangedCallback);
	}
	return actions;
};

export default getContractStatusActions;