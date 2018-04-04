import React from 'react';
import Icon from 'antd/lib/icon';
import ListComponent from '../../components/list/List';
import {Link} from 'react-router-dom';
import moment from 'moment';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import Radio from 'antd/lib/radio';
import DatePicker from 'antd/lib/date-picker';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import debounce from 'lodash.debounce';
import Action from '../../components/actions/Action';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class List extends React.Component {

	state = {
		ready: false,
		vehicles: [],
		services: [],
		technicians: [],
		organisations: [],
		organisationSearchFetching: false,
		sites: [],
		sitesSearchFetching: false,
		contracts: [],
		contractsSearchFetching: false
	}

	async fetchFiltersOptions() {
		this.setState({ready: false});
		const techniciansResponse = await apiClient.fetch('/employees', {params:{pagination:false, employeeType: 1}});
		const vehiclesResponse    = await apiClient.fetch('/vehicles',  {params: {pagination: false}});
		const servicesResponse = await apiClient.fetch('/services', {
			params: {
				pagination:false,
				operational: true
			}
		});
		this.setState({
			ready: true,
			technicians: techniciansResponse.json['hydra:member'],
			vehicles: vehiclesResponse.json['hydra:member'],
			services: servicesResponse.json['hydra:member']
		});
	}

	async searchOrganisations(searchOrganisationValue) {
		if (searchOrganisationValue) {
			this.setState({ countries: [], organisationSearchFetching: true });
			const searchOrganisationsResponse  = await apiClient.fetch(
				'/divisions',
				{
					params: {
						search: searchOrganisationValue,
						limitateByType: false,
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

	async searchContracts(searchContractValue) {
		if (searchContractValue) {
			this.setState({ contracts: [], contractsSearchFetching: true });
			const searchContractsResponse  = await apiClient.fetch(
				'/contracts',
				{
					params: {
						search: searchContractValue,
						pagination: false,
						nature: [2,3]
					}
				}
			);
			if (searchContractsResponse.status === 200) {
				this.setState({
					contractsSearchFetching: false,
					contracts: searchContractsResponse.json['hydra:member']
				});
			}
		} else {
			this.setState({ contracts: [] });
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

	async componentDidMount() {
		this.fetchFiltersOptions();
		this.searchContracts     = debounce(this.searchContracts, 500);
		this.searchSites         = debounce(this.searchSites, 500);
		this.searchOrganisations = debounce(this.searchOrganisations, 500);
	}

	render() {
		const Option = Select.Option;
		const RadioButton = Radio.Button;
		const RadioGroup = Radio.Group;
		const {
			organisationSearchFetching, organisations,
			sitesSearchFetching, sites, technicians,
			vehicles, contracts, contractsSearchFetching,
			services, ready
		} = this.state;
		const {i18n} = this.props;

		const configurations = {
			resourceEndPoint: '/services_interventions',
			title: <EditableTransWrapper><Trans>Interventions</Trans></EditableTransWrapper>,
			actions: [],
			quickFilters: [
				{
					name: 'benefits.benefitType.service',
					component: <RadioGroup>
						{
							services.map((service) => {
								return <RadioButton
									value={service['@id']}
									key={service['@id']}>
									{service.label}
								</RadioButton>;
							})
						}
					</RadioGroup>
				}
			],
			filters: [
				{
					title: <EditableTransWrapper><Trans>{'Date d\'intervention'}</Trans></EditableTransWrapper>,
					name: 'startDate',
					getValidValueForFilter: (valueFromUrl) => {
						return [moment(valueFromUrl.after), moment(valueFromUrl.before)];
					},
					formatValueForRequest: (value) => {
						return {
							'startDate[after]' : value[0],
							'startDate[before]': value[1]
						};
					},
					component: <DatePicker.RangePicker format='L' />
				},
				{
					title: <EditableTransWrapper><Trans>Contrats</Trans></EditableTransWrapper>,
					name: 'contract',
					getValidValueForFilter: (valueFromUrl) => {
						const contracts = valueFromUrl.split(',');
						const promises = contracts.map((test) => {
							return new Promise((resolve, reject) => {
								apiClient.fetch(test).then(
									(body) => {
										const contract = body.json;
										resolve({
											key: contract['@id'],
											label: contract.number
										});
									},
									(response) => {reject(response);}
								);
							});
						});
						return Promise.all(promises);
					},
					formatValueForUrl: (values) => {
						return {'contract': values.map((v) => v.key)};
					},
					formatValueForRequest: (values) => {
						return {'benefits.contract': values.map((v) => v.key)};
					},
					component: <Select
						combobox={false} showSearch={true} mode="multiple"
						notFoundContent={contractsSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} size="large" filterOption={false} labelInValue
						onSearch={(value) => this.searchContracts(value)}>
						{
							contracts? contracts.map((contract, idx) => {
								return <Option key={idx} value={contract['@id']} >
									{contract.number}
								</Option>;
							}) : null
						}
					</Select>
				},
				{
					title: <EditableTransWrapper><Trans>Véhicules</Trans></EditableTransWrapper>,
					name: 'vehicle',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
					},
					component: <Select
						showSearch={true} mode="multiple"
						size="large" placeholder={i18n.t`Véhicules`}
						filterOption={(input, option) => {
							return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
						}}>
						{
							vehicles.map((vehicle, idx) => {
								return <Option key={idx} value={vehicle['@id']}>
									{vehicle.name}
								</Option>;
							})
						}
					</Select>
				},
				{
					title: <EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper>,
					name: 'benefits.contract.division',
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
							'benefits.contract.division': values.map((v) => v.key)
						};
					},
					component: <Select
						showSearch={true} mode="multiple" size="large"
						notFoundContent={organisationSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} filterOption={false} labelInValue
						onSearch={(value) => this.searchOrganisations(value)} >
						{
							organisations? organisations.map((organisation, idx) => {
								return <Option key={idx} value={organisation['@id']}>{organisation.fullName}</Option>;
							}) : null
						}
					</Select>
				},
				{
					title: <EditableTransWrapper><Trans>Sites</Trans></EditableTransWrapper>,
					name: 'benefits.subDivision',
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
						return {'benefits.subDivision': values.map((v) => v.key)};
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
				},
				{
					title: <EditableTransWrapper><Trans>Techniciens</Trans></EditableTransWrapper>,
					name: 'employees',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
					},
					component: <Select
						showSearch={true} mode="multiple"
						size="large" placeholder={i18n.t`Techniciens`}
						filterOption={(input, option) => {
							return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
						}}>
						{
							technicians.map((technician, idx) => {
								return <Option key={idx} value={technician['@id']}>
									{technician.firstName + ' ' +technician.lastName}
								</Option>;
							})
						}
					</Select>
				}
			],
			columns: [{
				title: <EditableTransWrapper><Trans>Intervention</Trans></EditableTransWrapper>,
				key: 'intervention',
				render: (text, record) => {
					return (moment(record.startDate).format('L') + ' de ' + moment(record.startDate).format('LT') + ' a ' + moment(record.endDate).format('LT'));
				},
				width: 170,
				sorter: true,
			}, {
				title: <EditableTransWrapper><Trans>Contract</Trans></EditableTransWrapper>,
				key: 'contract',
				render: (text, record) => {

					return record.benefits.map((benefit, idx) => {
						return <Link key={idx} className="intervention-link" to={'/contracts/list/'+benefit.contract.id}>{benefit.contract.number}</Link>;
					});
				},
				width: 100,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Organisation</Trans></EditableTransWrapper>,
				key: 'division',
				render: (text, record) => {
					return record.benefits.map((benefit, idx) => {
						let divisionFullName = '';
						if (benefit.contract.division) {
							if (benefit.contract.division.parent)
								divisionFullName = benefit.contract.division.parent.name + ' > ' + benefit.contract.division.name;
							else
								divisionFullName = benefit.contract.division.name;
						}
						if(idx != record.benefits.length-1)
							divisionFullName += ', ';
						return <Link key={idx} className="intervention-link" to={'/divisions/split/'+benefit.contract.division.id}>{divisionFullName}</Link>;
					});
				},
				width: 160,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Site</Trans></EditableTransWrapper>,
				key: 'site',
				render: (text, record) => {
					return record.benefits.map((benefit, idx) => {
						let subDivisionName= '';
						if(benefit.subDivision.name){
							subDivisionName = benefit.subDivision.name;

							if(idx != record.benefits.length-1)
								subDivisionName += ', ';
						}
						return  <Link key={idx} className="intervention-link" to={'/divisions/split/'+benefit.contract.division.id+'/'+benefit.subDivision.id}>{subDivisionName}</Link>;
					});
				},
				width: 150,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Prestations</Trans></EditableTransWrapper>,
				key: 'benefit',
				render: (text, record) => {
					return record.benefits.map((benefit, idx) => {
						return <span key={idx}>{benefit.benefitType.publicTitle}</span>;
					});
				},
				width: 150,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Vehicule</Trans></EditableTransWrapper>,
				key: 'vehicle',
				render: (text, record) => {
					return <Link className="intervention-link" to={record.vehicle['@id']}>{record.vehicle.name}</Link>;
				},
				width: 100,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Techniciens</Trans></EditableTransWrapper>,
				key: 'technicians',
				render: (text, record) => {
					return record.employees.map((employee, idx) => {
						return <Link key={idx} className="intervention-link" to={employee['@id']}>{employee.firstName + ' ' + employee.lastName}</Link>;
					});
				},
				width: 150,
				sorter: true
			}, {
				key: 'joinedFile',
				render: (text, record) => {
					//todo upload fiche d'intervention
					let action = {
						id: record.id,
						title: <EditableTransWrapper><Trans>{'Télécharger une fiche d\'intervention'}</Trans></EditableTransWrapper>,
						icon : <Icon type="paper-clip"/>,
						unfolded: true,
						disabled: true
						// modal: <AddInterventionModal width={750} contract={record.contract}/>,
						// requiredRights: [{uri: '/services_interventions', action: 'POST'}]
					};
					return (
						<Action
							renderAsButton={true}
							size="small"
							action={action}>
							{action.icon}
						</Action>
					);
				},
				width: 15,
			}]
		};
		return ready ? <div className="list-wrapper">
			<ListComponent configurations={configurations}/>
		</div> : <Spin className="centered-spin" size="large" />;

	}
}

export default withI18n()(List);
