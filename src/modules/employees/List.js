import React from 'react';
import {Link} from 'react-router-dom';
import Icon from 'antd/lib/icon';
import ListComponent from '../../components/list/List';
import Select from 'antd/lib/select';
import DownloadUnavailabilityModal from './DownloadUnavailabilityModal';
import moment from 'moment';
import ContractTypes from '../../apiConstants/ContractEmployeeTypes';
import apiClient from '../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import showFormattedNumbers from '../utils/showFormattedNumbers';
import './List.scss';

class List extends React.Component {

	state = {
		services: []
	}

	componentDidMount = () => {
		apiClient.fetch('/services',  {
			params: {
				pagination: false,
			}
		}).then((response) => {
			this.setState({
				services: response.json['hydra:member']
			});
		});
	}

	render() {
		const Option = Select.Option;
		const {services} = this.state;
		const {i18n} = this.props;
		const configurations = {
			resourceEndPoint: '/employees',
			title: <EditableTransWrapper><Trans>Salariés</Trans></EditableTransWrapper>,
			actions: [
				{
					id: 'addEmployee',
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter un salarié</Trans></EditableTransWrapper>,
					link: '/employees/add'
				}, {
					id: 'downloadUnavailability',
					icon: <Icon type="upload"/>,
					title: <EditableTransWrapper><Trans>Etat des indisponibilités</Trans></EditableTransWrapper>,
					modal: <DownloadUnavailabilityModal />
				}
			],
			filters: [
				{
					title: <EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>,
					name: 'services',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
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
				}, {
					title: <EditableTransWrapper><Trans>Type de contrat</Trans></EditableTransWrapper>,
					name: 'contractType',
					getValidValueForFilter: (valueFromUrl) => {
						return valueFromUrl.split(',');
					},
					component: <Select
						allowClear={true} size="large"  mode="multiple"
						placeholder={i18n.t`Type de contrat`}>
						{
							ContractTypes.map((type, idx) => {
								return <Option key={idx} value={type.value.toString()}>{type.label}</Option>;
							})
						}
					</Select>
				}, {
					title: <EditableTransWrapper><Trans>En activité</Trans></EditableTransWrapper>,
					name: 'isOut',
					component: <Select
						allowClear={true} size="large"
						placeholder={i18n.t`En activité`}>
						<Option value="0">
							<EditableTransWrapper><Trans>En activité</Trans></EditableTransWrapper>
						</Option>
						<Option value="1">
							<EditableTransWrapper><Trans>Plus en activité</Trans></EditableTransWrapper>
						</Option>
					</Select>
				}
			],
			columns: [{
				key: 'photo',
				width: 40,
				render: (text, record) => {
					return record.photo ? <div className="employee-photo" style={{
						backgroundImage: `url(${AppConfig.apiEntryPoint + record.photo.content_uri})`
					}}/> : null;
				}
			}, {
				title: <EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>,
				key: 'fullName',
				render: (text, record) => {
					return <Link className="employee-link" to={'/employees/' + record.id}>{`${record.firstName} ${record.lastName}`}</Link>;
				},
				width: 400,
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Services</Trans></EditableTransWrapper>,
				key: 'services.label',
				width: 300,
				render: (text, record) => {
					let services = '';
					for (let i = 0; i < record.services.length; i++){
						services += record.services[i].label;
						if(i != record.services.length-1)
							services += ', ';
					}
					return services;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Date de naissance</Trans></EditableTransWrapper>,
				key: 'birthday',
				width: 300,
				render: (text, record) => {
					if(record.birthday)
						return moment(record.birthday).format('L');
					else
						return '';
				},
				sorter: true,
			}, {
				title: <EditableTransWrapper><Trans>Téléphone</Trans></EditableTransWrapper>,
				key: 'phone',
				width: 300,
				render: (text, record) => {
					if(record.phone)
						return showFormattedNumbers(record.phone);
					else
						return '';
				},
				sorter: true,
			},{
				title: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
				dataIndex: 'email',
				key: 'email',
				width: 600,
				sorter: true,
			}]

		};
		return <div className="employees-list list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
