import React from 'react';
import Table from 'antd/lib/table';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import getBenefitInfoWithModification from '../utils/getBenefitInfoWithModification';
import getFormattedPriceDiff from '../utils/getFormattedPriceDiff';
import './Modifications.scss';

class Modifications extends React.Component {

	state = {
		ready: true,
		modifications: null
	}

	getFullSubDivisions = (subDivision) => {
		let fullName;
		if (subDivision.parent)
			fullName = subDivision.parent.name + ' > ' + subDivision.name;
		else
			fullName = subDivision.name;
		return fullName;
	}

	columns = [{
		title: <EditableTransWrapper><Trans>Titre de la prestation</Trans></EditableTransWrapper>,
		key: 'title',
		width: 150,
		fixed: 'left',
		render: record => {
			const {benefit} = record;
			const {title} = getBenefitInfoWithModification(benefit, record);
			return title || benefit.benefitType.internalTitle || benefit.benefitType.publicTitle;
		}
	}, {
		title: <EditableTransWrapper><Trans>Nouvelle prestation ?</Trans></EditableTransWrapper>,
		key: 'new',
		width: 150,
		render: record => {
			return record.isNewBenefit ?
				<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
				:
				<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>;
		}
	}, {
		title: <EditableTransWrapper><Trans>Occurences</Trans></EditableTransWrapper>,
		key: 'numberOperations',
		width: 150,
		render: record => {
			const {numberOperations} = record;
			if (!numberOperations) {
				return null;
			}
			return numberOperations >= 0 ? '+' + numberOperations : numberOperations;
		}
	}, {
		title: <EditableTransWrapper><Trans>Quantité</Trans></EditableTransWrapper>,
		key: 'quantity',
		width: 150,
		render: record => {
			const {quantity} = record;
			if (!quantity) {
				return null;
			}
			return quantity >= 0 ? '+' + quantity : quantity;
		}
	}, {
		title: <EditableTransWrapper><Trans>Prix UHT</Trans></EditableTransWrapper>,
		key: 'price',
		width: 150,
		render: record => {
			const {priceTaxExcl} = record;
			if (!priceTaxExcl) {
				return null;
			}
			return getFormattedPriceDiff(priceTaxExcl);
		}
	}, {
		title: <EditableTransWrapper><Trans>Nouveau titre</Trans></EditableTransWrapper>,
		key: 'newTitle',
		render: record => {
			return record.title;
		}
	}, {
		title: <EditableTransWrapper><Trans>Nouveau descriptif</Trans></EditableTransWrapper>,
		key: 'newDescription',
		render: record => {
			return <div dangerouslySetInnerHTML={{__html: record.description}} />;
		}
	}, {
		title: <EditableTransWrapper><Trans>Site</Trans></EditableTransWrapper>,
		key: 'Site',
		width: 150,
		fixed: 'right',
		render: record => {
			return this.getFullSubDivisions(record.benefit.subDivision);
		}
	}];

	async fetchModifications() {
		this.setState({ready: false});
		const {additionalClause} = this.props;
		const response = await apiClient.fetch('/amendment_modifications', {
			params: {
				amendment: additionalClause['@id'],
				pagination: false
			}
		});
		if (response && response.status === 200) {
			const modifications = response.json['hydra:member'].map(record => {
				return {
					...record,
					key: record.id
				};
			});
			this.setState({ready: true, modifications});
		}
	}

	componentDidMount () {
		this.fetchModifications();
	}

	render() {
		const {modifications, ready} = this.state;
		const {columns} = this;
		return <div className="modifications">
			<Table
				bordered={true} size="small"
				className="status-history-list"
				pagination={false} loading={!ready}
				dataSource={modifications} columns={columns}
				scroll={{ x: 1500 }}
			/>
		</div>;
	}
}

export default withI18n()(Modifications);