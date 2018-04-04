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
			resourceEndPoint: '/skills',
			title: 'Liste des compétences',
			actions: [
				{
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter une compétence</Trans></EditableTransWrapper>,
					link: '/skills/add'
				}
			],
			filters: [],
			columns: [{
				title: <EditableTransWrapper><Trans>Label</Trans></EditableTransWrapper>,
				key: 'label',
				width: 150,
				render: (text, record) => {
					return <Link className="skill-link" to={'/skills/' + record.id}>{record.label}</Link>;
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
