import React from 'react';
import Icon from 'antd/lib/icon';
import Spin from 'antd/lib/spin';
import {Link} from 'react-router-dom';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import ContractStatus from '../../../apiConstants/ContractStatus';
import './AdditionalClauses.scss';

class AdditionalClauses extends React.Component {

	state = {
		ready: true,
		additionalClauses: []
	}

	async fetchContracts() {
		this.setState({ready: false});
		let additionalClauses;
		const {contract} = this.props;
		const response = await apiClient.fetch('/contracts', {
			params: {
				parent: contract.id,
				pagination: false
			}
		});
		if (response && response.status === 200) {
			additionalClauses = response.json['hydra:member'];
			this.setState({
				ready: true,
				additionalClauses,
			});
		}
	}

	componentDidMount () {
		this.fetchContracts();
	}

	render() {
		const {additionalClauses, ready} = this.state;
		return <Spin spinning={!ready}>
			<div className="additional-clauses">
				{
					additionalClauses && additionalClauses.length ?
						additionalClauses.map((additionalClause, idx) => {
							const contractStatus = ContractStatus.find((status) => status.value === additionalClause.status);
							return <div className="contract" key={idx}>
								<div className="icon">
									<Icon type="copy" />
								</div>
								<div className="body">
									<Link to={'/contracts/list/additional_clauses/' + additionalClause.id}>{additionalClause.number}</Link>
									<div>
										<EditableTransWrapper><Trans id={contractStatus.label}/></EditableTransWrapper>
									</div>
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

export default withI18n()(AdditionalClauses);