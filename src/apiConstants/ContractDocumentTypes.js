import { i18nMark } from 'lingui-react';

const ContractDocumentTypes = [
	{
		label: i18nMark('Bon de commande'),
		constant: 'PURCHASE_ORDER',
		value: 1
	}, {
		label: i18nMark('Document DC4'),
		constant: 'DC4_DOCUMENT',
		value: 2
	}, {
		label: i18nMark('Description de devis'),
		constant: 'QUOTATION_DESCRIPTION',
		value: 3
	}, {
		label: i18nMark('Autre'),
		constant: 'OTHER',
		value: 4
	}
];

export default ContractDocumentTypes;
