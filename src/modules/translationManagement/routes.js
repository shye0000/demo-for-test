import asyncRoute from 'wbc-components/lib/utils/CodeSplitting/asyncRoute/asyncRoute';

const Translations = asyncRoute(
	() => import(
		/* webpackChunkName: "translationManagement" */
		'./Translations')
);

export const routes = [{
	path: '/translation_management',
	component: Translations
}];