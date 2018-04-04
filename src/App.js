import React from 'react';
import {Switch} from 'react-router-dom';
import {Provider, connect} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import RouteDispatcher from 'react-router-dispatcher';
import { unpackCatalog } from 'lingui-i18n';
import { I18nProvider } from 'lingui-react';
import LocaleProvider from 'antd/lib/locale-provider/index';
import notification from 'antd/lib/notification';
import {loadCustomJSON} from 'wbc-components/lib/Translations';
import moment from 'moment';
import './App.scss';
import './ant-theme.less';

const mapStateToProps = (state) => {
	return {
		language: state.trans.language,
		modifiedTranslationMessages: state.trans.modifiedTranslationMessages
	};
};

class App extends React.Component {

	state = {
		language: this.props.language,
		catalogs: {},
		antI18n: {}
	}

	loadLanguage = (language) => {

		// get locale file name for momentjs
		const momentlocale = language.split('_')[0];

		Promise.all([
			// load project translations
			import(
				/* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
				`../locale/${language}/messages.js`),
			// load wbc components translations
			import(
				/* webpackMode: "lazy", webpackChunkName: "i18n-wbc-[index]" */
				`wbc-components/locale/${language}/messages.js`),
			// load custom translations for project
			loadCustomJSON(language),
			// load ant design translations
			import(
				/* webpackMode: "lazy", webpackChunkName: "antI18n-[index]" */
				`antd/lib/locale-provider/${language}.js`),
			// load moment locale
			import(
				/* webpackMode: "lazy", webpackChunkName: "momentLocale-[index]" */
				`moment/locale/${momentlocale}.js`).catch(() => {
			})
		]).then(([projectCatalogs, wbcComponentsCatalogs, customMessages, antI18n]) => {
			// set moment locale globally
			moment.locale(language);

			// merge project translations with wbc components translations and custom translations
			const catalogs = {
				...catalogs,
				messages: {
					...unpackCatalog(projectCatalogs).messages,
					...unpackCatalog(wbcComponentsCatalogs).messages,
					...customMessages
				}
			};

			this.setState(state => ({
				catalogs: {
					...state.catalogs,
					[language]: catalogs
				},
				antI18n
			}));
		});
	}


	componentDidMount () {
		this.loadLanguage(this.state.language);
		notification.config({
			duration: 1.5,
			top: 80
		});
	}

	shouldComponentUpdate (nextProps, { language, catalogs }) {
		if (language !== this.state.language && !catalogs[language]) {
			this.loadLanguage(language);
			return false;
		}
		return true;
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.language !== nextProps.language) {
			window.location.reload();
		} else if (nextProps.modifiedTranslationMessages
			&& this.state.catalogs[this.state.language].massages !== nextProps.modifiedTranslationMessages[this.state.language]) {
			let currentLanguageCatalog = {
				...this.state.catalogs[this.state.language]
			};
			currentLanguageCatalog = {
				...currentLanguageCatalog,
				messages: {
					...currentLanguageCatalog.messages,
					...nextProps.modifiedTranslationMessages[this.state.language]
				}
			};
			this.setState(state => ({
				catalogs: {
					...state.catalogs,
					[this.state.language]: currentLanguageCatalog
				}
			}));
		}
	}

	render() {
		// Does the environment support HTML 5 history
		const supportsHistory = typeof window !== 'undefined' && 'pushState' in window.history;

		const { language, catalogs, languageData, antI18n } = this.state;

		if (!catalogs[language]) return null;



		return (
			<div className="app">
				<LocaleProvider locale={antI18n}>
					<I18nProvider language={language} catalogs={catalogs} languageData={languageData}>
						<Provider store={this.props.store}>
							<ConnectedRouter history={this.props.history} forceRefresh={!supportsHistory}>
								<Switch>
									<RouteDispatcher routes={this.props.routes}/>
								</Switch>
							</ConnectedRouter>
						</Provider>
					</I18nProvider>
				</LocaleProvider>
			</div>
		);
	}

}

export default connect(mapStateToProps)(App);


