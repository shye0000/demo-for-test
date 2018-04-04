import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyInvoicesDueDateDaysModal from './ModifyInvoicesDueDateDaysModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class Dashboard extends React.Component {

	state = {
		ready: false,
		invoicesDueDateDays: null
	}

	getConfig = () => {
		const {ready, invoicesDueDateDays} = this.state;

		if (ready && invoicesDueDateDays) {
			return {
				head: {
					title: 'Echéance des factures : ' + invoicesDueDateDays.value + ' jours',
					contents: [[]],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyInvoicesDueDateDaysModal width={750} invoicesDueDateDays={invoicesDueDateDays}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchInvoicesDueDateDaysData();
							}
						},
						requiredRights: [{uri: invoicesDueDateDays['@id'], action: 'PUT'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchInvoicesDueDateDaysData() {
		this.setState({ready: false});
		const invoicesDueDateDaysResponse = await apiClient.fetch('/invoices_due_date_days').catch(() => this.setState({ready: true}));

		if (invoicesDueDateDaysResponse && invoicesDueDateDaysResponse.status === 200) {
			this.setState({
				ready: true,
				invoicesDueDateDays: invoicesDueDateDaysResponse.json['hydra:member'][0]
			});
		}
	}

	componentDidMount() {
		this.fetchInvoicesDueDateDaysData();
	}

	render() {
		const {ready, invoicesDueDateDays} = this.state;
		return (
			ready ?
				(
					invoicesDueDateDays ?
						<DashboardComp className="invoices-due-date-days-type-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Il n\'y a pas d\'échéance par défaut pour les factures'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
