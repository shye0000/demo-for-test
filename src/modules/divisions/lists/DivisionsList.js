import React from 'react';
import {Link} from 'react-router-dom';
import ListComponent from '../../../components/list/List';
import Icon from 'antd/lib/icon';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import showFormattedNumbers from '../../utils/showFormattedNumbers';
import './DivisionsList.scss';

class DivisionsList extends React.Component {

	render() {
		const configurations = {
			resourceEndPoint: '/divisions',
			title: <EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper>,
			actions: [
				{
					id: 'addOrganisation',
					icon: <Icon type="plus-circle-o"/>,
					title: <EditableTransWrapper><Trans>Ajouter une organisation</Trans></EditableTransWrapper>,
					link: '/divisions/add'
				}
			],
			filters: [],
			columns: [{
				title: <EditableTransWrapper><Trans>Nom</Trans></EditableTransWrapper>,
				key: 'name',
				width: 170,
				render: (text, record) => {
					return <div className="organisation-link">
						{record.parent ? `${record.parent.name} > ` : null}
						<Link to={'/divisions/split/' + record.id}>
							{record.name}
						</Link>
					</div>;
				},
				sorter: true,
				defaultSortOrder: 'ascend'
			}, {
				title: <EditableTransWrapper><Trans>Type de division</Trans></EditableTransWrapper>,
				width: 160,
				render: (text, record) => {
					if(record.parent === null){
						return 'Organisation';
					}else {
						return 'Sous-organisation';
					}
				}
			}, {
				title: <EditableTransWrapper><Trans>N° Siret</Trans></EditableTransWrapper>,
				key: 'siretNumber',
				width: 150,
				render: (text, record) => {
					return record.siretNumber;
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
				title: <EditableTransWrapper><Trans>Fax</Trans></EditableTransWrapper>,
				key: 'fax',
				width: 170,
				render: (text, record) => {
					return showFormattedNumbers(record.fax);
				},
				sorter: true
			}, {
				title: <EditableTransWrapper><Trans>E-mail</Trans></EditableTransWrapper>,
				key: 'email',
				width: 170,
				render: (text, record) => {
					return record.email;
				},
				sorter: true
			}]
		};
		return <div className="organisation-list list-wrapper">
			<ListComponent configurations={configurations}/>
		</div>;
	}
}

export default DivisionsList;
