import React from 'react';
import {TranslationManagement, loadCustomJSON} from 'wbc-components/lib/Translations';
import './Translations.scss';

class Translations extends React.Component {

	state = {
		loading: false,
		translationMessages: null
	}

	async loadTranslationMessages() {
		this.setState({
			loading: true
		});
		let translationMessages = {};
		for (let lang of Object.keys(AppConfig.AppLanguages)) {
			const defaultMessages = await import(
				/* webpackChunkName: "transJson" */
				`../../../locale/${lang}/messages.json`);
			const customMessages = await loadCustomJSON(lang);
			const formattedDefaultMessages = {};
			for (let [key, value] of Object.entries(defaultMessages)) {
				formattedDefaultMessages[key] = value.translation;
			}

			translationMessages[lang] = {
				...formattedDefaultMessages,
				...customMessages
			};
		}

		this.setState({
			loading: false,
			translationMessages: translationMessages
		});
	}

	componentDidMount() {
		this.loadTranslationMessages();
	}

	render() {
		const {loading, translationMessages} = this.state;
		return <div className="qhs-translations">
			<TranslationManagement loading={loading} translationMessages={translationMessages}/>
		</div>;
	}
}

export default Translations;
