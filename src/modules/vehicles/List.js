import React from 'react';
import Icon from 'antd/lib/icon';
import ListComponent from '../../components/list/List';
import {Link} from 'react-router-dom';
import Select from 'antd/lib/select';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './List.scss';

class List extends React.Component {

	state = {
		services: [],
		vehicleTypes: []
	}

	async fetchFiltersOptions() {
		const servicesResponse = await apiClient.fetch('/services',  {
			params: {
				pagination: false,
			}
		});
		const vehicleTypesResponse = await apiClient.fetch('/vehicle_types',  {
			params: {
				pagination: false,
			}
		});
		this.setState({
			services: servicesResponse.json['hydra:member'],
			vehicleTypes: vehicleTypesResponse.json['hydra:member']
		});
	}

	componentDidMount = () => {
		this.fetchFiltersOptions();
	}

	render() {
		const Option = Select.Option;
		const {services, vehicleTypes} = this.state;
		const {i18n} = this.props;

		const configurations = {
			resourceEndPoint: '/vehicles',
			title: <EditableTransWrapper><Trans>Véhicules</Trans></EditableTransWrapper>,
			actions: [
				{
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter un véhicule</Trans></EditableTransWrapper>,
					link: '/vehicles/add'
				}
			],
			filters: [
				{
					title: <EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>,
					name: 'service',
					getValidValueForFilter: (valueFromUrl) => {
						const services = valueFromUrl.split(',');
						return Promise.resolve(services);
					},
					component: <Select
						size="large" mode="multiple" placeholder={i18n.t`Rechercher`}
						filterOption={(input, option) => {
							return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
						}}>
						{
							services.map((service) => {
								return <Option key={service.id} value={service.id.toString()}>
									{service.label}
								</Option>;
							})
						}
					</Select>
				},
				{
					title: <EditableTransWrapper><Trans>Type</Trans></EditableTransWrapper>,
					name: 'vehicleType',
					getValidValueForFilter: (valueFromUrl) => {
						const types = valueFromUrl.split(',');
						return Promise.resolve(types);
					},
					component: <Select
						showSearch={true} allowClear={true} mode="multiple"
						size="large" placeholder={i18n.t`Type`}
						filterOption={(input, option) => {
							return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
						}}>
						{
							vehicleTypes.map((vehicleType) => {
								return <Option key={vehicleType.id} value={vehicleType.id.toString()}>
									{vehicleType.label}
								</Option>;
							})
						}
					</Select>
				}

			],
			columns: [{
				title: <EditableTransWrapper><Trans>N° de plaque</Trans></EditableTransWrapper>,
				key: 'plate',
				render: (text, record) => {
					return <Link className="vehicle-link" to={'/vehicles/' + record.id}>{record.plate}</Link>;
				},
				width: 150,
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Type</Trans></EditableTransWrapper>,
				key: 'vehicleType.label',
				render: (text, record) => {
					return record.vehicleType.label;
				},
				width: 150,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Nom court</Trans></EditableTransWrapper>,
				key: 'name',
				render: (text, record) => {
					return record.name;
				},
				width: 160,
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
				key: 'service.label',
				render: (text, record) => {
					return record.service.label;
				},
				width: 150,
				sorter: true
			}]
		};
		return <div className="list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;

	}
}

export default withI18n()(List);
