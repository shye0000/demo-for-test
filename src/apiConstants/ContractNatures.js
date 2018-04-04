import { i18nMark } from 'lingui-react';

const ContractNatures = [
	{
		label: i18nMark('Avenant'),
		constant: 'AMENDMENT',
		value: 1
	}, {
		label: i18nMark('Contrat'),
		constant: 'CONTRACT',
		value: 2
	}, {
		label: i18nMark('Devis'),
		constant: 'QUOTATION',
		value: 3
	}
];

export default ContractNatures;
