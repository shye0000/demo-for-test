import React from 'react';
import ListComponent from '../../../components/list/List';
import {Link} from 'react-router-dom';
import './List.scss';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Icon from 'antd/lib/icon';

class List extends React.Component {

	componentDidMount = () => {
	}

	render() {
		const configurations = {
			resourceEndPoint: '/vat_rates',
			title: 'Liste des taux de TVA',
			actions: [
				{
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter un taux de TVA</Trans></EditableTransWrapper>,
					link: '/vat_rates/add'
				}
			],
			filters: [],
			columns: [{
				title: <EditableTransWrapper><Trans>Valeur</Trans></EditableTransWrapper>,
				key: 'value',
				width: 150,
				render: (text, record) => {
					return <Link className="vat-rate-link" to={'/vat_rates/' + record.id}>{record.value}</Link>;
				},
				sorter: true,
				defaultSortOrder: 'ascend'
			}]
		};

		return <div className="list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default withI18n()(List);
