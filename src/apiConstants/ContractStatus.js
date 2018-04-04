import { i18nMark } from 'lingui-react';

const ContractStatus = [
	{
		label: i18nMark('En cours de création'),// can modify all
		constant: 'CREATION_IN_PROGRESS',
		value: 1,
		color: 'grey'
	}, {
		label: i18nMark('En validation'),// no modify
		constant: 'VALIDATION_IN_PROGRESS',
		value: 2,
		color: 'grey'
	}, {
		label: i18nMark('Refusé'),//no modify
		constant: 'REFUSED',
		value: 3,
		color: 'red'
	}, {
		label: i18nMark('Validé'),// can modify only : auto-liquitation, mode dc4, bon de commande
		constant: 'VALIDATED',
		value: 4,
		color: 'grey'
	}, {
		label: i18nMark('Envoyé au client'),//no modify
		constant: 'SENT_TO_CLIENT',
		value: 5,
		color: 'grey'
	}, {
		label: i18nMark('Activé'),// can modify only : auto-liquitation, mode dc4, bon de co
		constant: 'ACTIVATED',
		value: 6,
		color: 'green'
	}, {
		label: i18nMark('Suspendu'),//no modify
		constant: 'SUSPENDED',
		value: 7,
		color: 'red'
	}, {
		label: i18nMark('Clos'),//no modify
		constant: 'CLOSED',
		value: 8,
		color: 'grey'
	}
];

export default ContractStatus;
