import React from 'react';
import ListComponent from '../../../components/list/List';
import DatePicker from 'antd/lib/date-picker';
import apiClient from '../../../apiClient';
import {Link} from 'react-router-dom';
import './List.scss';
import moment from 'moment/moment';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class EmergenciesList extends React.Component {

	constructor(props) {
		super(props);
		this.searchOrganisations = debounce(this.searchOrganisations, 500);
		this.searchSites = debounce(this.searchSites, 500);
	}

	state = {
		organisations: [],
		organisationSearchFetching: false,
		sites: [],
		sitesSearchFetching: false
	}

	async searchOrganisations(searchOrganisationValue) {
		if (searchOrganisationValue) {
			this.setState({ organisations: [], organisationSearchFetching: true });
			const searchOrganisationsResponse  = await apiClient.fetch(
				'/divisions',
				{
					params: {
						search: searchOrganisationValue,
						pagination: false,
						'order[name]': 'ASC'
					}
				}
			);
			if (searchOrganisationsResponse.status === 200) {
				this.setState({
					organisationSearchFetching: false,
					organisations: searchOrganisationsResponse.json['hydra:member'].map(
						(organisation) => {
							const fullName = organisation.parent ?
								`${organisation.parent.name} > ${organisation.name}`
								:
								organisation.name;
							return {
								...organisation,
								fullName
							};
						}
					).sort((a, b) => {
						if(a.fullName < b.fullName) return -1;
						if(a.fullName > b.fullName) return 1;
						return 0;
					})
				});
			}
		} else {
			this.setState({ organisations: [] });
		}
	}

	async searchSites(searchSitesValue) {
		if (searchSitesValue) {
			this.setState({ sites: [], sitesSearchFetching: true });
			const searchResponse  = await apiClient.fetch(
				'/sub_divisions',
				{
					params: {
						search: searchSitesValue,
						pagination: false,
						'order[name]': 'ASC'
					}
				}
			);
			if (searchResponse.status === 200) {
				this.setState({
					sitesSearchFetching: false,
					sites: searchResponse.json['hydra:member'].map(
						(site) => {
							const fullName = site.parent ?
								`${site.parent.name} > ${site.name}`
								:
								site.name;
							return {
								...site,
								fullName
							};
						}
					).sort((a, b) => {
						if(a.fullName < b.fullName) return -1;
						if(a.fullName > b.fullName) return 1;
						return 0;
					})
				});
			}
		} else {
			this.setState({ sites: [] });
		}
	}

	render() {
		const configurations = {
			resourceEndPoint: '/contracts',
			defaultFilters: {nature: 3, quotationNeedsAdjustment: true},
			title: <EditableTransWrapper><Trans>Urgences à régulariser</Trans></EditableTransWrapper>,
			filters : [
				{
					title: <EditableTransWrapper><Trans>Création</Trans></EditableTransWrapper>,
					name: 'createdAt',
					getValidValueForFilter: (value) => {
						return [moment(value.after), moment(value.before)];
					},
					formatValue: (value) => {
						return {
							'createdAt[after]': value[0],
							'createdAt[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				}, {
					title: <EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>,
					name: 'startDate',
					getValidValueForFilter: (value) => {
						return [moment(value.after), moment(value.before)];
					},
					formatValue: (value) => {
						return {
							'startDate[after]': value[0],
							'startDate[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				}, {
					title: <EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>,
					name: 'endDate',
					getValidValueForFilter: (value) => {
						return [moment(value.after), moment(value.before)];
					},
					formatValue: (value) => {
						return {
							'endDate[after]': value[0],
							'endDate[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				}
			],
			columns: [{
				title: <EditableTransWrapper><Trans>N°</Trans></EditableTransWrapper>,
				key: 'number',
				width: 300,
				render: (text, record) => {
					return <Link style={{fontWeight: 600}} to={'/contracts/emergencies/' + record.id}>{record.number}</Link>;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Création</Trans></EditableTransWrapper>,
				key: 'createdAt',
				width: 200,
				render: (text, record) => {
					if (record.createdAt)
						return moment(record.createdAt).format('L');
					else
						return '';
				},
				sorter: true,
				defaultSortOrder: 'descend'
			}, {
				title: <EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>,
				key: 'startDate',
				width: 200,
				render: (text, record) => {
					if (record.startDate)
						return moment(record.startDate).format('L');
					else
						return '';
				},
				sorter: true,
			}, {
				title: <EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>,
				key: 'endDate',
				width: 200,
				render: (text, record) => {
					if (record.endDate)
						return moment(record.endDate).format('L');
					else
						return '';
				},
				sorter: true,
			}]
		};
		return <div className="list-wrapper">
			<ListComponent wrappedComponentRef={list => this.list = list} configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(EmergenciesList);
