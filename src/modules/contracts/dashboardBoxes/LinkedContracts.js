import React from 'react';
import Icon from 'antd/lib/icon';
import Spin from 'antd/lib/spin';
import {Link} from 'react-router-dom';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import Actions from '../../../components/actions/Actions';
import ContractStatus from '../../../apiConstants/ContractStatus';
import './LinkedContracts.scss';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class LinkedContracts extends React.Component {

	state = {
		ready: true,
		contracts: []
	}

	getActions = (currentContract) => {
		const {contract, i18n} = this.props;
		return [{
			id: 'remove',
			unfolded: true,
			title: <EditableTransWrapper><Trans>Supprimer le lien avec ce contrat</Trans></EditableTransWrapper>,
			icon: <Icon type="delete"/>,
			method: () => {
				Modal.confirm({
					title: i18n.t`Voulez vous supprimer le lien avec ce contrat?`,
					okText: i18n.t`Supprimer`,
					className: 'delete qhs-confirm-modal',
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					iconType: 'exclamation-circle',
					width: 450,
					onOk: () => {
						const {contracts} = this.state;
						apiClient.fetch(contract['@id'], {
							method: 'PUT',
							body: JSON.stringify({
								linkedContracts: contracts
									.filter(contract => contract['@id'] !== currentContract['@id'])
									.map(contract => contract['@id'])
							})
						}).then(
							() => {
								this.fetchContracts();
								notification['success']({
									message: i18n.t`Le lien avec ce contrat a été bien supprimé.`,
									className: 'qhs-notification success'
								});
							},
							() => {
								notification['error']({
									message: i18n.t`Le lien avec ce contrat n'a pas été supprimé.`,
									className: 'qhs-notification error'
								});
							}
						);
					}
				});
			},
			requiredRights: [{uri: contract['@id'], action: 'PUT'}]
		}];
	}

	async fetchContracts() {
		this.setState({ready: false});
		let contracts;
		const {contract} = this.props;
		const response = await apiClient.fetch('/contracts', {
			params: {
				linkedTo: contract.id,
				pagination: false
			}
		});
		if (response && response.status === 200) {
			contracts = response.json['hydra:member'];
			this.setState({
				ready: true,
				contracts,
			});
		}
	}

	getLinkByNature = (contract) => {
		if (contract.nature === 1) {
			return <Link to={'/contracts/list/additional_clauses/' + contract.id}>
				<EditableTransWrapper><Trans>Avenant</Trans></EditableTransWrapper>
				{' '}
				{contract.number}
			</Link>;
		}
		if (contract.nature === 2) {
			return <Link to={'/contracts/list/' + contract.id}>
				<EditableTransWrapper><Trans>Contrat</Trans></EditableTransWrapper>
				{' '}
				{contract.number}
			</Link>;
		}
		if (contract.nature === 3) {
			return <Link to={'/contracts/list/quotations/' + contract.id}>
				<EditableTransWrapper><Trans>Devis</Trans></EditableTransWrapper>
				{' '}
				{contract.number}
			</Link>;
		}
		return contract.number;
	}

	componentDidMount () {
		this.fetchContracts();
	}

	render() {
		const {contracts, ready} = this.state;
		return <Spin spinning={!ready}>
			<div className="linked-contracts">
				{
					contracts && contracts.length ?
						contracts.map((contract, idx) => {
							const contractStatus = ContractStatus.find((status) => status.value === contract.status);
							return <div className="contract" key={idx}>
								<div className="icon">
									<Icon type="file-text" />
								</div>
								<div className="body">
									{this.getLinkByNature(contract)}
									<div>
										<EditableTransWrapper><Trans id={contractStatus.label}/></EditableTransWrapper>
									</div>
								</div>
								<div className="linked-contract-actions">
									<Actions actions={this.getActions(contract)}/>
								</div>
							</div>;
						})
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Aucun avenant'}</Trans></EditableTransWrapper>
						</div>
				}
			</div>
		</Spin>;
	}
}

export default withI18n()(LinkedContracts);