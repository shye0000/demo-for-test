import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import ListComponent from '../../components/list/List';
import {Link} from 'react-router-dom';
import Select from 'antd/lib/select';
import moment from 'moment';
import apiClient from '../../apiClient';
import Radio from 'antd/lib/radio';
import Action from '../../components/actions/Action';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import AddInterventionModal from './addInterventionsModal';
import debounce from 'lodash.debounce';
import './List.scss';

class List extends React.Component {

	state = {
		loading: false,
		visible: false,
		contracts: null,
		services: [],
		contractsSearchFetching: null,
		modalId: null
	}

	async fetchFiltersOptions() {
		this.setState({ready: false});
		const techniciansResponse = await apiClient.fetch('/employees', {params:{pagination:false, employeeType: 1}});
		const servicesResponse = await apiClient.fetch('/services', {
			params: {
				pagination:false,
				operational: true
			}
		});

		this.setState({
			ready: true,
			technicians: techniciansResponse.json['hydra:member'],
			services: servicesResponse.json['hydra:member']
		});
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

	async componentDidMount() {
		this.fetchFiltersOptions();
		this.searchContracts = debounce(this.searchContracts, 500);
	}

	render() {
		const { contracts, contractsSearchFetching, services } = this.state;
		const { i18n } = this.props;
		const RadioButton = Radio.Button;
		const RadioGroup = Radio.Group;
		const Option = Select.Option;
		const configurations = {
			resourceEndPoint: '/benefits',
			title: <EditableTransWrapper><Trans>Interventions à programmer</Trans></EditableTransWrapper>,
			actions: [],
			quickFilters: [
				{
					name: 'benefitType',
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
						return {'contract': values.map((v) => v.key)};
					},
					component: <Select
						combobox={false} showSearch={true} mode="multiple"
						notFoundContent={contractsSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} size="large" filterOption={false} labelInValue
						onSearch={(value) => this.searchContracts(value)}>
						{
							contracts ? contracts.map((contract, idx) => {
								return <Option key={idx} value={contract['@id']} >
									{contract.number}
								</Option>;
							}) : null
						}
					</Select>
				},
			],
			columns: [{
				title: <EditableTransWrapper><Trans>Contrat / devis</Trans></EditableTransWrapper>,
				key: 'intervention',
				render: (text, record) => {
					return <Link className="intervention-link" to={'/contracts/list/'+record.contract.id}>{record.contract.number}</Link>;
				},
				width: 120,
				sorter: true,
			}, {
				title: <EditableTransWrapper><Trans>Organisation</Trans></EditableTransWrapper>,
				key: 'contract',
				render: (text, record) => {
					let divisionFullName = '';
					if (record.contract.division) {
						if (record.contract.division.parent)
							divisionFullName = record.contract.division.parent.name + ' > ' + record.contract.division.name;
						else
							divisionFullName = record.contract.division.name;
					}
					return <Link to={'divisions/split/'+record.contract.division.id}>{divisionFullName}</Link>;
				},
				width: 160,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Sites</Trans></EditableTransWrapper>,
				key: 'division',
				render: (text, record) => {
					let subDivisionFullName = '';
					if (record.subDivision) {
						if (record.subDivision.parent)
							subDivisionFullName = record.subDivision.parent.name + ' > ' + record.subDivision.name;
						else
							subDivisionFullName = record.subDivision.name;
					}
					return <Link to={`/divisions/split/${record.contract.division.id}/${record.subDivision.id}`}>{subDivisionFullName}</Link>;
				},
				width: 215,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Prestations</Trans></EditableTransWrapper>,
				key: 'site',
				render: (text, record) => {
					return record.benefitType.publicTitle;
				},
				width: 170,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Activation</Trans></EditableTransWrapper>,
				key: 'benefit',
				render: (text, record) => {
					return (record.contract.activatedAt ? moment(record.contract.activatedAt).format('L') : '');
				},
				width: 85,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Début</Trans></EditableTransWrapper>,
				key: 'vehicle',
				render: (text, record) => {
					return (record.contract.startDate ? moment(record.contract.startDate).format('L') : '');
				},
				width: 80,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Opérations</Trans></EditableTransWrapper>,
				key: 'technicians',
				render: (text, record) => {
					return record.totalToPlanOperations.services;
				},
				width: 100,
				sorter: true
			}, {
				key: 'addIntervention',
				render: (text, record) => {
					let action = {
						id: record.id,
						title: <EditableTransWrapper><Trans>Programmer une intervention</Trans></EditableTransWrapper>,
						icon : <Icon type="calendar"/>,
						unfolded: true,
						modal: <AddInterventionModal width={750} contract={record.contract}/>,
						requiredRights: [{uri: '/services_interventions', action: 'POST'}]
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
				width: 10,
			}]
		};
		return <div className="list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
