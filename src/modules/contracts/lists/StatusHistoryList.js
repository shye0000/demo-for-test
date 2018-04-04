import React from 'react';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import Table from 'antd/lib/table';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ContractStatus from '../../../apiConstants/ContractStatus';
import ContractRefusedReasons from '../../../apiConstants/ContractRefusedReasons';
import moment from 'moment';
import './StatusHistoryList.scss';

class StatusHistoryList extends React.Component {

	state = {
		ready: false,
		status: []
	}

	getContractStatus = (record) => {
		if (record) {
			const contractStatus = ContractStatus.find((status) => status.value === record.status);
			return contractStatus?
				<div className="status-wrapper">
					<span className="status">
						<div className="status-point" style={{background: contractStatus.color}}/>
						<div className="status-label">
							<EditableTransWrapper><Trans id={contractStatus.label}/></EditableTransWrapper>
						</div>
					</span>
					{
						contractStatus.value === 3 ?
							<div className="reason">
								(<EditableTransWrapper><Trans id={
									ContractRefusedReasons.find((reason) => reason.value === record.rejectionReason).label
								}/></EditableTransWrapper>)
							</div> : null
					}
				</div>
				:
				<div className="status-wrapper">
					<span className="status">
						<div className="status-label">
							<EditableTransWrapper><Trans/>Statut inconnu</EditableTransWrapper>
						</div>
					</span>
				</div>;
		}

		return null;
	}

	columns = [{
		title: <EditableTransWrapper><Trans>Statut</Trans></EditableTransWrapper>,
		key: 'status',
		width: 200,
		render: record => {
			return this.getContractStatus(record);
		}
	}, {
		title: <EditableTransWrapper><Trans>Date</Trans></EditableTransWrapper>,
		key: 'date',
		width: 150,
		render: record => {
			return moment(record.createdAt).format('LLL');
		}
	}, {
		title: <EditableTransWrapper><Trans>Commentaire</Trans></EditableTransWrapper>,
		key: 'comment',
		render: record => {
			return <div dangerouslySetInnerHTML={{__html: record.comment}} />;
		}
	}];

	async fetchStatusHistory () {
		const {contract} = this.props;
		this.setState({ready: false});
		const response = await apiClient.fetch('/contract_status_histories', {
			params: {
				pagination: false,
				contract: contract['@id']
			}
		}).catch(() => this.setState({ready: true}));
		if (response && response.status === 200) {
			this.setState({
				ready: true,
				status: response.json['hydra:member'].map(record => {
					return {
						...record,
						key: record.id
					};
				})
			});
		}
	}

	componentDidMount () {
		this.fetchStatusHistory();
	}

	render () {
		const {ready, status} = this.state;
		const {columns} = this;
		return <Table
			bordered={true} size="small"
			className="status-history-list"
			pagination={false} loading={!ready}
			dataSource={status} columns={columns}
		/>;
	}
}


export default withI18n()(StatusHistoryList);