import { i18nMark } from 'lingui-react';

const DataPointTypes = [
	{
		label: i18nMark('Facturation'),
		constant: 'BILLING',
		value: 1
	}, {
		label: i18nMark('Achat'),
		constant: 'BUYING',
		value: 2
	}, {
		label: i18nMark('Responsable site'),
		constant: 'SITE_MANAGER',
		value: 3
	}, {
		label: i18nMark('Pré-intervention'),
		constant: 'PRE_INTERVENTION',
		value: 4
	}
];

export default DataPointTypes;