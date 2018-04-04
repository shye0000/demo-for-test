import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import '@progress/kendo-ui/js/kendo.scheduler';
import { Scheduler as KendoScheduler } from '@progress/kendo-scheduler-react-wrapper';
import {withI18n} from 'lingui-react';
import Icon from 'antd/lib/icon';
import Actions from '../../components/actions/Actions';
import EditModal from './modals/EditModal';
import './Scheduler.scss';
import apiClient from '../../apiClient';

const mapStateToProps = (state) => {
	return {
		language: state.trans.language
	};
};

class Scheduler extends React.Component {

	state = {
		ready: false,
		events: null
	}

	views = [
		'day',
		{ type: 'week', selected: true },
		'month',
		'agenda'
	]

	async componentDidMount () {
		await this.loadLanguage(this.props.language);
		await this.fetchEvents();
	}

	shouldComponentUpdate(newProps, newState) {
		if (!this.state.ready && newState.ready) {
			return true;
		}
		return false;
	}

	async loadLanguage (language) {

		await import(
			/* webpackMode: "lazy" */
			'@progress/kendo-theme-bootstrap/dist/all.css'
		);

		await import(
			/* webpackMode: "lazy", webpackChunkName: "kendoMessages-[index]" */
			`@progress/kendo-ui/js/messages/kendo.messages.${language.split('_').join('-')}.js`).catch(() => {

		});

		await import(
			/* webpackMode: "lazy", webpackChunkName: "kendoCulture-[index]" */
			`@progress/kendo-ui/js/cultures/kendo.culture.${language.split('_').join('-')}.js`).catch(() => {
		});

		kendo.culture(language.split('_').join('-'));
	}

	renderEventActions = (eventElement, getPopupContainer) => {
		if (eventElement.length) {
			const actionsContainer = eventElement[0].getElementsByClassName('k-event-actions')[1];
			ReactDOM.unmountComponentAtNode(actionsContainer);
			ReactDOM.render(<Actions
				size="small"
				getPopupContainer={getPopupContainer}
				actions={[
					{
						id: 'edit',
						title: 'Modifier',
						icon: <Icon type="edit" />,
						modal: <EditModal />
					},
					{
						id: 'delete',
						title: 'Supprimer',
						icon: <Icon type="delete" />,
						type: 'danger',
					}
				]}/>, actionsContainer);
		}

	}

	onDataBound = (e) => {
		const scheduler = e.sender;
		const view = scheduler.view();
		const schedulerHeader = view.element.find('.k-scheduler-header');
		const schedulerContent = view.element.find('.k-scheduler-content');
		const events = scheduler.dataSource.view();
		for (let idx = 0, length = events.length; idx < length; idx++) {
			let event = events[idx];
			let getPopupContainer = undefined;
			//get event element
			let eventElement = schedulerContent.find('[data-uid=' + event.uid + ']');
			if (eventElement.length) {
				getPopupContainer = () => document.getElementsByClassName('k-scheduler-content')[0];
			} else {
				eventElement = schedulerHeader.find('[data-uid=' + event.uid + ']');
			}
			this.renderEventActions(eventElement, getPopupContainer);
		}
	}

	onChange = (e) => {
		console.log('event :: change');
		console.log(e);
	}

	async fetchEvents () {
		const eventsData = await apiClient.fetch('/services_interventions', {
			method: 'GET',
			params: {pagination: false}
		});
		const events = eventsData.json ? eventsData.json['hydra:member']
			.filter((eventData) => eventData.startDate && eventData.endDate)
			.map((eventData) => {
				const {id, startDate, endDate} = eventData;
				let start = new Date(startDate);
				let end = new Date(endDate);
				return {
					id, start, end,
					title: 'test',
				};
			}) : [];
		this.setState({
			events,
			ready: true
		});
	}

	render() {
		const {events, ready} = this.state;
		return (
			<div className="scheduler-wrapper">
				{
					ready ?
						<KendoScheduler
							height={'100%'}
							change={(ev) => this.onChange(ev)}
							dataBound={(ev) => this.onDataBound(ev)}
							dataSource={events}
							views={this.views} /> : null
				}
			</div>
		);
	}
}

export default connect(mapStateToProps)(withI18n()(Scheduler));