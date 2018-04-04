import { i18nMark } from 'lingui-react';

const ContractTypes= [
	{
		label: i18nMark('100'),
		constant: 'Contrat/Devis de Multi Prestations - Dégraissage - Permutation des filtres',
		value: 100
	}, {
		label: i18nMark('200'),
		constant: 'Contrat/Devis de Nettoyage de reseau VMC - Soufflage',
		value: 200
	}, {
		label: i18nMark('300'),
		constant: 'Contrat/Devis de pompage de bac à graisse - Fosse de releveage(EU/EV/EP) et hydrocarbure - Fosse à peinture - Fosse exhaure - Fosse septique - Maintenance biologique du bac à graisse - Curage(EG/EU/EV/EP)',
		value: 300
	}, {
		label: i18nMark('400'),
		constant: 'Contrat/Devis de Dératisation - Désinsectisation',
		value: 400
	}, {
		label: i18nMark('500'),
		constant: 'Devis Fourniture de filtres - Trappes de visite - Passage caméra',
		value: 500
	}, {
		label: i18nMark('600'),
		constant: 'Devis Travaux (Création bac à graisse / Remplacement de pompe ou bac à graisse)',
		value: 700
	}, {
		label: i18nMark('800'),
		constant: 'Contrat/Devis ramonage',
		value: 800
	}, {
		label: i18nMark('900'),
		constant: 'Devis de régularisation intervention en urgence',
		value: 900
	}
];

export default ContractTypes;