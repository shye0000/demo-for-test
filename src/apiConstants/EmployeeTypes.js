import { i18nMark } from 'lingui-react';

const EmloyeeTypes = [
	{
		label: i18nMark('Technicien'),
		constant: 'TECHNICIAN',
		value: 1
	}, {
		label: i18nMark('Commercial'),
		constant: 'COMMERCIAL',
		value: 2
	}, {
		label: i18nMark('Chef'),
		constant: 'CHIEF',
		value: 3
	}
];

export default EmloyeeTypes;