import React from 'react';
import ListComponent from '../../../components/list/List';
import {Link} from 'react-router-dom';
import './List.scss';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import moment from 'moment/moment';
import Icon from 'antd/lib/icon';

class List extends React.Component {

	componentDidMount = () => {
	}

	render() {
		const configurations = {
			resourceEndPoint: '/users',
			defaultFilters:{
				noSuperAdmin: true
			},
			title: 'Liste des utilisateurs',
			actions: [
				{
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>{'Gérer les accès d\'un salarié'}</Trans></EditableTransWrapper>,
					link: '/users/add'
				}
			],
			filters: [],
			columns: [{
				title: <EditableTransWrapper><Trans>Prénom</Trans></EditableTransWrapper>,
				key: 'employee.firstName',
				width: 150,
				render: (text, record) => {
					return <Link className="user-link" to={'/users/' + record.id}>{record.employee.firstName}</Link>;
				},
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>,
				key: 'employee.lastName',
				width: 150,
				render: (text, record) => {
					return <Link className="user-link" to={'/users/' + record.id}>{record.employee.lastName}</Link>;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Email</Trans></EditableTransWrapper>,
				key: 'email',
				width: 150,
				render: (text, record) => {
					return record.email;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Création</Trans></EditableTransWrapper>,
				key: 'createdAt',
				width: 150,
				render: (text, record) => {
					return moment(record.createdAt).format('L');
				},
				sorter: true
			}]
		};

		return <div className="list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
