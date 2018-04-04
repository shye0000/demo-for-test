import { i18nMark } from 'lingui-react';

const ContractStatus = [
	{
		label: i18nMark('Annulé'),
		constant: 'CANCELED',
		value: 1,
	}, {
		label: i18nMark('Refus interne'),
		constant: 'INTERNAL_REJECTION',
		value: 2
	}, {
		label: i18nMark('Refus client'),
		constant: 'CLIENT_REJECTION',
		value: 3
	}, {
		label: i18nMark('Offre expirée'),
		constant: 'OFFER_EXPIRED',
		value: 4
	}
];

export default ContractStatus;
