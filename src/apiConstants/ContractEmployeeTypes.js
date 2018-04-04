import { i18nMark } from 'lingui-react';

const ContractTypes= [
	{
		label: i18nMark('CDD'),
		constant: 'CDD',
		value: 1
	}, {
		label: i18nMark('CDI'),
		constant: 'CDI',
		value: 2
	}, {
		label: i18nMark('Interim'),
		constant: 'INTERIM',
		value: 3
	}
];

export default ContractTypes;