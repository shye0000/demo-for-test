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
			resourceEndPoint: '/benefit_types',
			title: 'Liste des types de prestation',
			actions: [
				{
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter un type de prestation</Trans></EditableTransWrapper>,
					link: '/benefit_types/add'
				}
			],
			filters: [],
			columns: [{
				title: <EditableTransWrapper><Trans>Titre public</Trans></EditableTransWrapper>,
				key: 'publicTitle',
				width: 150,
				render: (text, record) => {
					return <Link className="benefit-type-link" to={'/benefit_types/' + record.id}>{record.publicTitle}</Link>;
				},
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Titre interne</Trans></EditableTransWrapper>,
				key: 'internalTitle',
				width: 150,
				render: (text, record) => {
					return record.internalTitle;
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
				key: 'service.label',
				width: 150,
				render: (text, record) => {
					return record.service.label;
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
