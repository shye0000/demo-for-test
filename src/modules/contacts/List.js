import React from 'react';
import ListComponent from '../../components/list/List';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import apiClient from '../../apiClient';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import {Link} from 'react-router-dom';
import './List.scss';
import showFormattedNumbers from '../utils/showFormattedNumbers';

class List extends React.Component {

	constructor(props) {
		super(props);
		this.searchOrganisations = debounce(this.searchOrganisations, 500);
	}

	state = {
		organisations: [],
		organisationSearchFetching: false,
	}

	async searchOrganisations(searchOrganisationValue) {
		if (searchOrganisationValue) {
			this.setState({ countries: [], organisationSearchFetching: true });
			const searchOrganisationsResponse  = await apiClient.fetch(
				'/divisions',
				{
					params: {
						search: searchOrganisationValue,
						limitateByType: true,
						'order[name]': 'ASC'
					}
				}
			);
			if (searchOrganisationsResponse.status === 200) {
				this.setState({
					organisationSearchFetching: false,
					organisations: searchOrganisationsResponse.json['hydra:member']
				});
			}
		} else {
			this.setState({ organisations: [] });
		}
	}

	render() {
		const Option = Select.Option;
		const { organisations, organisationSearchFetching } = this.state;
		const { i18n } = this.props;
		const configurations = {
			resourceEndPoint: '/contacts',
			title: <EditableTransWrapper><Trans>Salariés tiers</Trans></EditableTransWrapper>,
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
					component: <Select showSearch={true} mode="multiple"
						notFoundContent={organisationSearchFetching ? <Spin size="small" /> : null}
						placeholder={i18n.t`Rechercher`} size="large" filterOption={false} labelInValue
						onSearch={(value) => this.searchOrganisations(value)} >
						{
							organisations? organisations.map((organisation, idx) => {
								return <Option key={idx} value={organisation['@id']}>{organisation.name}</Option>;
							}) : null
						}
					</Select>
				}
			],
			columns: [{
				title: <EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>,
				key: 'fullName',
				width: 150,
				render: (text, record) => {
					return <Link className="contact-link" to={'/contacts/' + record.id}>{`${record.firstName} ${record.lastName}`}</Link>;
				},
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Organisation</Trans></EditableTransWrapper>,
				key: 'division.name',
				width: 150,
				render: (text, record) => {
					if (record.division && record.division.name) {
						return record.division.name;
					}
					return '';
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>,
				key: 'phone',
				width: 170,
				render: (text, record) => {
					return showFormattedNumbers(record.phone);
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Poste</Trans></EditableTransWrapper>,
				key: 'function',
				width: 150,
				render: (text, record) => {
					return `${record.function}`;
				},
				sorter: true
			}]
		};
		return <div className="contacts-list list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
