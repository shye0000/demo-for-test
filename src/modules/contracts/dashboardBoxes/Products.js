import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Collapse from 'antd/lib/collapse';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import Actions from '../../../components/actions/Actions';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import './Benefits.scss';
import notification from 'antd/lib/notification';
import ProductFormModal from '../modals/ProductFormModal';
import Modal from 'antd/lib/modal';

class Products extends React.Component {

	state = {
		ready: true,
		productsHierarchy: null
	}

	subDivisionIcons = {
		site:   <IconSvg type={import('../../../../icons/environment-o.svg')}/>,
		zone:   <IconSvg type={import('../../../../icons/zone.svg')}/>
	}

	getProductActions = (product) => {
		const {contract, i18n, productsChangedCallback} = this.props;
		const editAction = {
			id: 'edit',
			title: <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>,
			icon: <Icon type="edit"/>,
			disabled: contract.status !== 1,
			modal: <ProductFormModal
				wrapClassName="product-form-modal"
				width={750} maskClosable={false}
				contract={contract} product={product}/>,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					productsChangedCallback();
				}
			},
			requiredRights: [{uri: product['@id'], action: 'PUT'}]
		};
		const deleteAction = {
			id: 'delete',
			disabled: contract.status !== 1,
			type: 'danger',
			title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
			icon: <Icon type="delete"/>,
			method: () => {
				Modal.confirm({
					title: i18n.t`Voulez-vous supprimer ce produit?`,
					okText: i18n.t`Supprimer`,
					className: 'delete qhs-confirm-modal',
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					iconType: 'exclamation-circle',
					maskClosable: true,
					onOk: () => {
						apiClient.fetch(product['@id'], {method: 'DELETE'}).then(
							null,
							(response) => {
								if (response.response.ok) {
									productsChangedCallback();
									notification['success']({
										message: i18n.t`Le produit a été bien supprimée.`,
										className: 'qhs-notification success'
									});
								} else {
									notification['error']({
										message: i18n.t`le produit n'a pas été supprimée.`,
										className: 'qhs-notification error'
									});
								}
							}
						);
					}
				});
			},
			requiredRights: [{uri: product['@id'], action: 'DELETE'}]
		};
		return [editAction, deleteAction];
	}

	addToSubDivisionHierarchy = (subDivision, hierarchy, product) => {
		if (subDivision.parent) {
			hierarchy = this.addToSubDivisionHierarchy(subDivision.parent, hierarchy, null);
		}
		if (!hierarchy.children[subDivision['@id']]) {
			hierarchy.children[subDivision['@id']] = {
				...subDivision,
				products: [],
				children: {}
			};
		}
		if (product) {
			hierarchy.children[subDivision['@id']].products.push(product);
		}

		return hierarchy.children[subDivision['@id']];
	}

	formatProducts = (rawProducts) => {
		let hierarchy = {children: {}};
		for(let i = 0; i < rawProducts.length; i++) {
			const subDivision = rawProducts[i].subDivision;
			this.addToSubDivisionHierarchy(subDivision, hierarchy, rawProducts[i]);
		}
		return hierarchy;
	}

	getProductInfo = (product) => {
		const {service, priceTaxExcl, quantity, productType} = product;
		let info = [{
			label: <EditableTransWrapper><Trans>Type de produit</Trans></EditableTransWrapper>,
			value: productType
		}, {
			label: <EditableTransWrapper><Trans>Service</Trans></EditableTransWrapper>,
			value: service ? service.label : null
		}, {
			label: <EditableTransWrapper><Trans>Prix unitaire HT</Trans></EditableTransWrapper>,
			value: priceTaxExcl ?
				priceTaxExcl.toLocaleString('fr-FR', {
					style: 'currency',
					currency: 'EUR'
				}) : null
		}, {
			label: <EditableTransWrapper><Trans>Quantité</Trans></EditableTransWrapper>,
			value: quantity || quantity === 0 ? quantity: null
		}];
		return info;
	}

	getProductTitle = (product) => {
		const {title, productType} = product;
		return title || productType;
	}

	getProductsComponents = (hierarchy, level) => {
		const Panel = Collapse.Panel;
		return <Collapse bordered={false}>
			{
				hierarchy.children ?
					Object.keys(hierarchy.children).map(key => {
						return <Panel
							showArrow={false}
							key={key} header={
								<div
									className="sub-division-name"
									style={{paddingLeft: (level - 1) * 25 + 'px' }}>
									<Icon className="collapse-icon" type="down" />
									<div className="sub-division-icon">
										{hierarchy.children[key].parent ? this.subDivisionIcons.zone : this.subDivisionIcons.site}
									</div>
									{hierarchy.children[key].name}
								</div>
							}
						>
							{this.getProductsComponents(hierarchy.children[key], level + 1)}
						</Panel>;
					}) : null
			}
			{
				hierarchy.products ?
					hierarchy.products.map(product => {
						const {description, publicComment} = product;
						return <Panel
							showArrow={false}
							key={product['@id']} header={
								<div
									className="benefit-title-header"
									style={{paddingLeft: (level - 1) * 25 + 'px' }}
								>
									<Icon className="collapse-icon" type="down" />
									<div className="benefit-title-wrapper">
										<div className="title">
											{this.getProductTitle(product)}
										</div>
										<div className="title-more">
											<div onClick={ev => ev.stopPropagation()}>
												<Actions actions={this.getProductActions(product)} />
											</div>
										</div>
									</div>
								</div>
							}
						>
							<div className="benefit-body" style={{paddingLeft: (level - 1) * 25 + 58 + 15 + 12 + 'px' }}>
								<Row type="flex" gutter={30}>
									{
										description || publicComment ?
											<Col className="description-wrapper" md={24} lg={12}>
												<div className="description"><div dangerouslySetInnerHTML={{__html: description}} /></div>
												<div className="public-comment"><div dangerouslySetInnerHTML={{__html: product.publicComment}} /></div>
											</Col> : null
									}
									<Col className="info-wrapper" md={24} lg={12}>
										{this.getProductInfo(product).map((info, idx) => {
											return <Row key={idx} className="info" type="flex" gutter={20}>
												<Col sm={24} md={12}>
													{info.label}
												</Col>
												<Col className="value" sm={24} md={12}>
													{info.value || info.value === 0 ? info.value : 'N/A'}
												</Col>
											</Row>;
										})}
									</Col>
								</Row>
							</div>
						</Panel>;
					}) : null
			}
		</Collapse>;
	}

	async fetchHierarchyData() {
		this.setState({ready: false});
		const {contract} = this.props;
		const response = await apiClient.fetch('/products', {
			params: {
				contract: contract['@id'],
				pagination: false
			}
		});
		if (response && response.status === 200) {
			const products = response.json['hydra:member'];
			this.setState({
				ready: true,
				productsHierarchy: products && products.length ? this.formatProducts(products) : null,
			});
		}

	}

	componentDidMount () {
		this.fetchHierarchyData();
	}

	render() {
		const {productsHierarchy, ready} = this.state;
		return <Spin spinning={!ready}>
			<div className="benefits">
				{
					productsHierarchy ?
						this.getProductsComponents(productsHierarchy, 1)
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Vous n\'avez pas encore ajouté de produit'}</Trans></EditableTransWrapper>
						</div>
				}
			</div>
		</Spin>;
	}
}

export default withI18n()(Products);