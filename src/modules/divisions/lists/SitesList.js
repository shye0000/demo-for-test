import React from 'react';
import {Link} from 'react-router-dom';
import ListComponent from '../../../components/list/List';
import {Trans, withI18n} from 'lingui-react';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import debounce from 'lodash.debounce';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './DivisionsList.scss';
import apiClient from '../../../apiClient';

class SitesList extends React.Component {

	state= {
		organisations: [],
		organisationSearchFetching: false
	}

	async searchOrganisations(searchOrganisationValue) {
		if (searchOrganisationValue) {
			this.setState({ countries: [], organisationSearchFetching: true });
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

	componentDidMount() {
		this.searchOrganisations();
		this.searchOrganisations = debounce(this.searchOrganisations, 500);
	}

	render() {
		const {organisationSearchFetching, organisations} = this.state;
		const {i18n} = this.props;

		const Option = Select.Option;
		const configurations = {
			resourceEndPoint: '/sub_divisions',
			defaultFilters: {hasParent: false},
			title: <EditableTransWrapper><Trans>Sites</Trans></EditableTransWrapper>,
			filters: [{
				title: <EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper>,
				name: 'divisions',
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
						divisions: values.map((v) => v.key)
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
								{organisation.fullName}</Option>;
						}) : null
					}
				</Select>
			}],
			columns: [{
				title: <EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>,
				key: 'name',
				width: 200,
				render: (text, record) => {
					if (record.divisions.length > 1) {
						return <div>
							<div>{record.name}</div>
							{' '}
							{
								record.divisions.map((division, idx) => {
									return <Link key={idx} to={'/divisions/split/' + division.id + '/' + record.id}>
										<EditableTransWrapper><Trans>chez</Trans></EditableTransWrapper>
										{' '}
										{
											division.parent ?
												`${division.parent.name}`
												:
												division.name
										}
										{
											idx < record.divisions.length -1 ?
												', ' : null
										}
									</Link>;
								})
							}
						</div>;
					}
					const division = record.divisions[0];
					return <Link to={'/divisions/split/' + division.id + '/' + record.id}>
						{record.name}
					</Link>;

				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Lié à</Trans></EditableTransWrapper>,
				key: 'divisions.id',
				width: 200,
				render: (text, record) => {
					return record.divisions.map((division, idx) => {
						return <div key={idx}>
							<Link to={'/divisions/split/' + division.id}>
								{
									division.parent ?
										`${division.parent.name} > ${division.name}`
										:
										division.name
								}
								{
									idx < record.divisions.length -1 ?
										', ' : null
								}
							</Link>
						</div>;
					});
				}
			}]
		};
		return <div className="organisation-list list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(SitesList);
