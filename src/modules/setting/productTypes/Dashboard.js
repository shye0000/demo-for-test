import React from 'react';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import ModifyProductTypeModal from './ModifyProductTypeModal';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class Dashboard extends React.Component {

	state = {
		ready: false,
		productType: null,
		service: null
	}

	getConfig = () => {
		const {ready, productType, service} = this.state;
		const {i18n} = this.props;

		if (ready && productType) {
			return {
				head: {
					title: productType.name,
					contents: [
						[{
							label: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
							value: service.label
						}], []

					],
					actions: [{
						id: 'modify',
						icon: <Icon type="edit"/>,
						title: <EditableTransWrapper><Trans>Modifier les informations</Trans></EditableTransWrapper>,
						modal: <ModifyProductTypeModal width={750} productType={productType}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.fetchProductTypeData();
							}
						},
						requiredRights: [{uri: productType['@id'], action: 'PUT'}]
					}, {
						id: 'delete',
						title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
						icon: <Icon type="delete"/>,
						method: () => {
							Modal.confirm({
								title: i18n.t`Voulez-vous supprimer ce type de produit?`,
								okText: i18n.t`Supprimer`,
								okType: 'danger',
								cancelText: i18n.t`Annuler`,
								maskClosable: true,
								className: 'qhs-confirm-modal delete',
								iconType: 'exclamation-circle',
								onOk: () => {
									apiClient.fetch(productType['@id'], {method: 'DELETE'}).then(
										null,
										(response) => {
											if (response.response.ok) {
												this.props.history.push('/product_types');
												notification['success']({
													message: i18n.t`Le type de produit a bien été supprimé`,
													className: 'qhs-notification success'
												});
											} else {
												notification['error']({
													message: i18n.t`Le type de produit n'a pas été supprimé`,
													className: 'qhs-notification error'
												});
											}
										}
									);
								}
							});
						},
						requiredRights: [{uri: productType['@id'], action: 'DELETE'}]
					}]
				},
				body: {}
			};
		}

		return null;
	}

	async fetchProductTypeData() {
		let productType, service;
		this.setState({ready: false});
		const {productTypeId} = this.props.match.params;
		const productTypeResponse = await apiClient.fetch('/product_types/' + productTypeId).catch(() => this.setState({ready: true}));

		if (productTypeResponse && productTypeResponse.status === 200) {
			productType = productTypeResponse.json;
			const serviceResponse = await apiClient.fetch(productType.service['@id']).catch(() => this.setState({ready: true}));
			service = serviceResponse.json;

			this.setState({
				ready: true,
				productType,
				service
			});
		}
	}

	componentDidMount() {
		this.fetchProductTypeData();
	}

	render() {
		const {ready, productType} = this.state;
		return (
			ready ?
				(
					productType ?
						<DashboardComp className="product-type-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le type de produit n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(Dashboard);
