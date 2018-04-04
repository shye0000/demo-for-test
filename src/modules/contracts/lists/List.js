import React from 'react';
import ListComponent from '../../../components/list/List';
import Select from 'antd/lib/select';
import Icon from 'antd/lib/icon';
import DatePicker from 'antd/lib/date-picker';
import Spin from 'antd/lib/spin';
import apiClient from '../../../apiClient';
import {Link} from 'react-router-dom';
import './List.scss';
import moment from 'moment/moment';
import {Headers} from 'node-fetch';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ContractNatures from '../../../apiConstants/ContractNatures';
import ContractStatus from '../../../apiConstants/ContractStatus';
import {addUserTokenToRequestOptions} from 'wbc-components/lib/utils/JWTAuthentication/userSessionStorage';
import downloadFileFromReadableStream from '../../utils/downloadFileFromReadableStream';

class List extends React.Component {

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

	exportContracts = () => {
		const allListFilters = this.list.getCurrentFiltersAndSorters();
		apiClient.fetch('/contracts', addUserTokenToRequestOptions({
			headers: new Headers({'Accept': 'text/csv'}),
			params: {
				...allListFilters,
				pagination: false
			}
		})).then(
			() => {},
			({response}) => {
				if (response && response.ok) {
					downloadFileFromReadableStream(response, 'contracts.csv');
				}
			}
		);

	}

	render() {
		const Option = Select.Option;
		const { organisations, organisationSearchFetching, sites, sitesSearchFetching } = this.state;
		const {i18n} = this.props;
		const configurations = {
			resourceEndPoint: '/contracts',
			defaultFilters: {quotationNeedsAdjustment: false},
			title: <EditableTransWrapper><Trans>Contrats et devis</Trans></EditableTransWrapper>,
			actions: [
				{
					id: 'addContract',
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Créer un contrat</Trans></EditableTransWrapper>,
					link: '/contracts/add/2',
					requiredRights: [{uri: '/contracts', action: 'POST'}]
				}, {
					id: 'addQuotation',
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Créer un devis</Trans></EditableTransWrapper>,
					link: '/contracts/add/3',
					requiredRights: [{uri: '/contracts', action: 'POST'}]
				}, {
					id: 'exportContracts',
					icon: <Icon type="upload"/>,
					title: <EditableTransWrapper><Trans>Exporter les contrats</Trans></EditableTransWrapper>,
					requiredRights: [{uri: '/contracts', action: 'GET'}],
					method: () => this.exportContracts()
				}
			],
			filters: [
				{
					title: <EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper>,
					name: 'division',
					getValidValueForFilter: (valueFromUrl) => {
						const divisions = valueFromUrl.split(',');
						const promises = divisions.map((division) => {
							return new Promise((resolve, reject) => {
								apiClient.fetch(division).then(
									(body) => {
										const division = body.json;
										resolve({
											key: division['@id'],
											label: division.parent ?
												`${division.parent.name} > ${division.name}`
												:
												division.name
										});
									},
									(response) => {reject(response);}
								);
							});
						});
						return Promise.all(promises);
					},
					formatValueForRequest: (values) => {
						return {
							division: values.map((v) => v.key)
						};
					},
					component: <Select
						combobox={false} showSearch={true} mode="multiple"
						notFoundContent={organisationSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} size="large" filterOption={false} labelInValue
						onSearch={(value) => this.searchOrganisations(value)}>
						{
							organisations? organisations.map((organisation, idx) => {
								return <Option key={idx} value={organisation['@id']} title={organisation.fullName}>
									{organisation.fullName}
								</Option>;
							}) : null
						}
					</Select>
				},
				{
					title: <EditableTransWrapper><Trans>Sites</Trans></EditableTransWrapper>,
					name: 'subDivisions',
					getValidValueForFilter: (valueFromUrl) => {
						const subDivisions = valueFromUrl.split(',');
						const promises = subDivisions.map((subDivision) => {
							return new Promise((resolve, reject) => {
								apiClient.fetch(subDivision).then(
									(body) => {
										const subDivision = body.json;
										resolve({
											key: subDivision['@id'],
											label: subDivision.parent ?
												`${subDivision.parent.name} > ${subDivision.name}`
												:
												subDivision.name
										});
									},
									(response) => {reject(response);}
								);
							});
						});
						return Promise.all(promises);
					},
					formatValueForRequest: (values) => {
						return {
							subDivisions: values.map((v) => v.key)
						};
					},
					component: <Select
						combobox={false} showSearch={true} mode="multiple"
						notFoundContent={sitesSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} size="large" filterOption={false} labelInValue
						onSearch={(value) => this.searchSites(value)}>
						{
							sites? sites.map((site, idx) => {
								return <Option key={idx} value={site['@id']} title={site.fullName}>
									{site.fullName}
								</Option>;
							}) : null
						}
					</Select>
				}, {
					title: <EditableTransWrapper><Trans>Nature du contrat</Trans></EditableTransWrapper>,
					name: 'nature',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
					},
					component: <Select allowClear={true} mode="multiple" size="large" placeholder={i18n.t`Nature du contrat`}>
						{
							ContractNatures.map((type, idx) => {
								return <Option key={idx} value={type.value.toString()}>{type.label}</Option>;
							})
						}
					</Select>
				}, {
					title: <EditableTransWrapper><Trans>Statut</Trans></EditableTransWrapper>,
					name: 'status',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
					},
					component: <Select allowClear={true} mode="multiple" size="large" placeholder={i18n.t`Statut`}>
						{
							ContractStatus.map((type, idx) => {
								return <Option key={idx} value={type.value.toString()}>{type.label}</Option>;
							})
						}
					</Select>
				}, {
					title: <EditableTransWrapper><Trans>En tacite reconduction</Trans></EditableTransWrapper>,
					name: 'tacitRenewal',
					component: <Select allowClear={true} size="large" placeholder={i18n.t`En tacite reconduction`}>
						<Option value="0">
							<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>
						</Option>
						<Option value="1">
							<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
						</Option>
					</Select>
				}, {
					title: <EditableTransWrapper><Trans>Création</Trans></EditableTransWrapper>,
					name: 'createdAt',
					getValidValueForFilter: (valueFromUrl) => {
						return [moment(valueFromUrl.after), moment(valueFromUrl.before)];
					},
					formatValueForRequest: (value) => {
						return {
							'createdAt[after]': value[0],
							'createdAt[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				}, {
					title: <EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>,
					name: 'startDate',
					getValidValueForFilter: (valueFromUrl) => {
						return [moment(valueFromUrl.after), moment(valueFromUrl.before)];
					},
					formatValueForRequest: (value) => {
						return {
							'startDate[after]': value[0],
							'startDate[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				}, {
					title: <EditableTransWrapper><Trans>Fin</Trans></EditableTransWrapper>,
					name: 'endDate',
					getValidValueForFilter: (valueFromUrl) => {
						return [moment(valueFromUrl.after), moment(valueFromUrl.before)];
					},
					formatValueForRequest: (value) => {
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
					if (record.nature === 1) { // avenant
						return <Link style={{fontWeight: 600}} to={'/contracts/list/additional_clauses/' + record.id}>{record.number}</Link>;
					}
					if (record.nature === 2) { // contrat
						return <Link style={{fontWeight: 600}} to={'/contracts/list/' + record.id}>{record.number}</Link>;
					}
					if (record.nature === 3) { // devis
						return <Link style={{fontWeight: 600}} to={'/contracts/list/quotations/' + record.id}>{record.number}</Link>;
					}
					return record.number;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Nature</Trans></EditableTransWrapper>,
				key: 'nature',
				width: 150,
				render: (text, record) => {
					for (let nature of ContractNatures) {
						if (nature.value === record.nature) {
							return <EditableTransWrapper><Trans id={nature.label} /></EditableTransWrapper>;
						}
					}
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Organisation</Trans></EditableTransWrapper>,
				key: 'division.name',
				width: 400,
				render: (text, record) => {
					let divisionFullName = '';

					if (record.division) {
						if (record.division.parent)
							divisionFullName = record.division.parent.name + ' > ' + record.division.name;
						else
							divisionFullName = record.division.name;
					}

					return divisionFullName;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Sites</Trans></EditableTransWrapper>,
				key: 'subDivisions',
				width: 400,
				render: (text, record) => {
					if (record.subDivisions) {
						return record.subDivisions.map((subDivision, idx) => {
							return <div key={idx}>
								{subDivision.name}
								{
									idx < record.subDivisions.length - 1 ? ',' : null
								}
							</div>;
						});

					}
					return null;
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
			}, {
				title: <EditableTransWrapper><Trans>Montant</Trans></EditableTransWrapper>,
				key: 'totalPrice',
				width: 200,
				render: (text, record) => {
					return (record.totalPrice || 0).toLocaleString('fr-FR', {
						style: 'currency',
						currency: 'EUR'
					});
				},
				sorter: true,
			}, {
				title: <EditableTransWrapper><Trans>Statut</Trans></EditableTransWrapper>,
				key: 'status',
				width: 300,
				render: (text, record) => {
					for (let status of ContractStatus) {
						if (status.value === record.status) {
							return <EditableTransWrapper><Trans id={status.label} /></EditableTransWrapper>;
						}
					}
				},
				sorter: true,
			}]
		};
		return <div className="list-wrapper">
			<ListComponent wrappedComponentRef={list => this.list = list} configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
