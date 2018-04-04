import { i18nMark } from 'lingui-react';

const EmployeeUnavailabilityTypes = [
	{
		label: i18nMark('Congé payé'),
		constant: 'PAID_LEAVE',
		value: 1
	}, {
		label: i18nMark('Congé exceptionnel'),
		constant: 'EXCEPTIONAL_LEAVE',
		value: 2
	}, {
		label: i18nMark('Congé sans solde'),
		constant: 'NON_PAID_LEAVE',
		value: 3
	}, {
		label: i18nMark('Congé paternité'),
		constant: 'PATERNITY_LEAVE',
		value: 4
	}, {
		label: i18nMark('Congé maternité'),
		constant: 'MATERNITY_LEAVE',
		value: 5
	}, {
		label: i18nMark('Congé parental'),
		constant: 'PARENTING_LEAVE',
		value: 6
	}, {
		label: i18nMark('Arrêt maladie'),
		constant: 'MEDICAL_LEAVE',
		value: 7
	}, {
		label: i18nMark('Absence injustifiée'),
		constant: 'UNJUSTIFIED_LEAVE',
		value: 8
	}
];

export default EmployeeUnavailabilityTypes;