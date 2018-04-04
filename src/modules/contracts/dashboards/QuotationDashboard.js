import React from 'react';
import moment from 'moment';
import {Link} from 'react-router-dom';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import DashboardBox from '../../../components/dashboard/DashboardBox';
import {Trans, withI18n} from 'lingui-react';
import Tag from '../../../components/tag/Tag';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ContractStatus from '../../../apiConstants/ContractStatus';
import Benefits from '../dashboardBoxes/Benefits';
import Products from '../dashboardBoxes/Products';
import BuyingDataPoint from '../dashboardBoxes/BuyingDataPoint';
import LinkedContracts from '../dashboardBoxes/LinkedContracts';
import ModifyCommercialDiscountModal from '../modals/ModifyCommercialDiscountModal';
import ModifyBillingInfoModal from '../modals/ModifyBillingInfoModal';
import ModifyContractModal from '../modals/ModifyContractModal';
import AddLinkedContractModal from '../modals/AddLinkedContractModal';
import SelectBuyingDataPointModal from '../modals/SelectBuyingDataPointModal';
import BenefitFormModal from '../modals/BenefitFormModal';
import ProductFormModal from '../modals/ProductFormModal';
import StatusHistoryModal from '../modals/StatusHistoryModal';
import getContractStatusActions from '../utils/getContractStatusActions';
import classNames from 'classnames';
import './ContractDashboard.scss';
import Documents from '../dashboardBoxes/Documents';
import AddContractDocumentModal from '../modals/AddContractDocumentModal';
import getFullAddress from '../../utils/getFullAddress';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import Modal from 'antd/lib/modal';
import './QuotationDashboard.scss';

class ContractDashboard extends React.Component {

	state = {
		ready: false,
		quotation: null
	}

	getFullOrganizations = () => {
		const {quotation} = this.state;
		let fullOrganizations = <span className="no-division-label">
			<EditableTransWrapper>
				<Trans>Organisation non renseignée</Trans>
			</EditableTransWrapper>
		</span>;
		if (quotation && quotation.division) {
			if (quotation.division.parent)
				fullOrganizations = quotation.division.parent.name + ' > ' + quotation.division.name;
			else
				fullOrganizations = quotation.division.name;
			fullOrganizations = <Link className="division-link" to={'/divisions/split/' + quotation.division.id}>
				{fullOrganizations}
			</Link>;
		}
		return fullOrganizations;
	}

	removeBuyingDataPoint = () => {
		const {i18n} = this.props;
		Modal.confirm({
			title: i18n.t`Voulez vous désélectionner le point de contact achat?`,
			className: 'qhs-confirm-modal delete',
			iconType: 'exclamation-circle',
			okText: i18n.t`Désélectionner`,
			okType: 'danger',
			cancelText: i18n.t`Annuler`,
			width: 500,
			onOk: () => {
				const {contract} = this.state;
				apiClient.fetch(contract['@id'], {
					method: 'PUT',
					body: jsonStringifyPreserveUndefined({
						buyingDataPoint: null
					})
				}).then(
					() => {
						this.updateDashboard();
						notification['success']({
							message: i18n.t`Le point de contact achat a été bien désélectionné.`,
							className: 'qhs-notification success'
						});
					},
					() => {
						notification['error']({
							message: i18n.t`Le point de contact achat n'a pas été désélectionné.`,
							className: 'qhs-notification error'
						});
					}
				);
			}
		});
	}

	markAsResolved = () => {
		const {i18n} = this.props;
		Modal.confirm({
			title: i18n.t`Voulez vous marquer le devis comme régularisé?`,
			className: 'qhs-confirm-modal',
			iconType: 'question-circle',
			okText: i18n.t`Marquer`,
			cancelText: i18n.t`Annuler`,
			width: 500,
			onOk: () => {
				const {quotation} = this.state;
				apiClient.fetch(quotation['@id'], {
					method: 'PUT',
					body: jsonStringifyPreserveUndefined({
						quotationNeedsAdjustment: false
					})
				}).then(
					() => {
						this.updateDashboard();
						notification['success']({
							message: i18n.t`Le devis a été bien marqué comme régularisé.`,
							className: 'qhs-notification success'
						});
					},
					() => {
						notification['error']({
							message: i18n.t`Le devis n'a pas été marqué comme régularisé.`,
							className: 'qhs-notification error'
						});
					}
				);
			}
		});
	}

	getBillingAddress = () => {
		const {quotation} = this.state;
		const {billingAddress} = quotation;
		if (billingAddress) {
			return getFullAddress(billingAddress);
		}
		return <div className="empty-tag">
			<EditableTransWrapper>
				<Trans>{'L\'adresse spécifique non renseignée : l\'adresse du point de contact facturation sera utilisée'}</Trans>
			</EditableTransWrapper>
		</div>;
	}

	getDashboardHeadTitle = () => {
		const {quotation} = this.state;
		if (quotation) {
			return <div>
				{quotation.quotationNeedsAdjustment ?
					<EditableTransWrapper><Trans>Devis en urgence</Trans></EditableTransWrapper> :
					<EditableTransWrapper><Trans>Devis</Trans></EditableTransWrapper>}
				{' ' + quotation.number}
			</div>;
		}
		return null;
	}

	getContractStatus = () => {
		const {quotation} = this.state;
		const quotationStatus = ContractStatus.find((status) => status.value === quotation.status);
		if (quotation) {
			return <div className="contract-status-wrapper">
				<span className="contract-status">
					<div className="status-point" style={{background: quotationStatus.color}}/>
					<div className="status-label">
						{' '}
						<EditableTransWrapper><Trans id={quotationStatus.label}/></EditableTransWrapper>
					</div>
				</span>
				<div className="info-plus">
					<EditableTransWrapper><Trans>Créé par</Trans></EditableTransWrapper>
					{` ${quotation.createdBy.employee.firstName} ${quotation.createdBy.employee.lastName} `}
					<EditableTransWrapper><Trans>le</Trans></EditableTransWrapper>
					{' ' + moment(quotation.createdAt).format('L')}
				</div>
			</div>;
		}
		return null;
	}

	isQuotationAfterValidated = () => {
		const {quotation} = this.state;
		return quotation.status === 6  //ACTIVATED
			|| quotation.status === 7  //SUSPENDED
			|| quotation.status === 8; //CLOSED
	}

	getConfig = () => {
		const {ready, quotation} = this.state;
		const {i18n} = this.props;

		const {totalPlannedOperations} = quotation;

		const notPlannedOpContractual =
			totalPlannedOperations.contractual.totalRequiredOperations
			- totalPlannedOperations.contractual.plannedOperations;
		const notPlannedOpServices =
			totalPlannedOperations.services.totalRequiredOperations
			- totalPlannedOperations.services.plannedOperations;

		const plannedOpContractual = totalPlannedOperations.contractual.plannedOperations;
		const plannedOpServices = totalPlannedOperations.services.plannedOperations;

		const totalOpContractual = totalPlannedOperations.contractual.totalRequiredOperations;
		const totalOpServices = totalPlannedOperations.services.totalRequiredOperations;

		if (ready && quotation) {
			return {
				head: {
					title: this.getDashboardHeadTitle(),
					subTitle: this.getFullOrganizations(),
					photoComponent: <Icon type="file-text" />,
					contents: [{
						component: <div>
							{
								quotation.quotationNeedsAdjustment ? <div className="foot-alert">
									<IconSvg type={import('../../../../icons/exclamation-circle-o.svg')}/>
									<span className="comment">
										<EditableTransWrapper><Trans>À régulariser</Trans></EditableTransWrapper>
									</span>
								</div> : null
							}
							{this.getContractStatus()}
							<div className="tags">
								<Tag label={
									<EditableTransWrapper><Trans>Sur bon de commande</Trans></EditableTransWrapper>
								} checked={quotation.linkedToPurchaseOrders} />
								<Tag label={
									<EditableTransWrapper><Trans>Reconduction tacite</Trans></EditableTransWrapper>
								} checked={quotation.tacitRenewal} />
								<Tag label={
									<EditableTransWrapper><Trans>Auto-liquidation</Trans></EditableTransWrapper>
								} checked={quotation.autoLiquidation} />
							</div>
						</div>
					}, [
						{
							label: <EditableTransWrapper><Trans>Dates</Trans></EditableTransWrapper>,
							value: (quotation.startDate && quotation.endDate)?
								<div>
									<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
									{' ' + moment(quotation.startDate).format('L') + ' '}
									<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
									{' ' + moment(quotation.endDate).format('L')}
								</div>
								: null
						}, {
							label: <EditableTransWrapper><Trans>Durée</Trans></EditableTransWrapper>,
							value: quotation.duration ?
								<div>
									{quotation.duration + ' '}
									<EditableTransWrapper><Trans>mois</Trans></EditableTransWrapper>
								</div> : null
						}, {
							label: <EditableTransWrapper><Trans>Date de clôture</Trans></EditableTransWrapper>,
							value: quotation.closedAt ? <div>{moment(quotation.closedAt).format('L')}</div> : null
						}, {
							label: <EditableTransWrapper><Trans>Note de bas de tableau</Trans></EditableTransWrapper>,
							value: quotation.note
						}
					], [
						{
							label: <EditableTransWrapper><Trans>En charge</Trans></EditableTransWrapper>,
							value: quotation.commercial ?
								<Link to={'/employee/' + quotation.commercial.id}>
									{`${quotation.commercial.firstName} ${quotation.commercial.lastName}`}
								</Link> : null
						}, {
							label: <EditableTransWrapper><Trans>Validé par</Trans></EditableTransWrapper>,
							value: (
								quotation.validatedBy ?
									<Link to={'/employee/' + quotation.validatedBy.employee.id}>
										{`${quotation.validatedBy.employee.firstName} ${quotation.validatedBy.employee.lastName}`}
									</Link> : null
							)
						}, {
							label: <EditableTransWrapper><Trans>Montant total</Trans></EditableTransWrapper>,
							value: quotation.totalPrice ? quotation.totalPrice.toLocaleString('fr-FR', {
								style: 'currency',
								currency: 'EUR'
							}) : null
						}
					]],
					foot: <div>
						{
							quotation.comment ? <div className="foot-comment">
								<IconSvg type={import('../../../../icons/message.svg')}/>
								<span className="comment">{quotation.comment}</span>
							</div> : null
						}
						{
							quotation.status == 7 && quotation.statusComment ? <div className="foot-alert">
								<IconSvg type={import('../../../../icons/exclamation-circle-o.svg')}/>
								<span className="comment">{quotation.statusComment}</span>
							</div> : null
						}
					</div>,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit" />,
						title: <EditableTransWrapper><Trans>Modifier les informations du devis</Trans></EditableTransWrapper>,
						modal: <ModifyContractModal width={750} contract={quotation}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.updateDashboard();
							}
						},
						requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
					}, {
						id: 'resolve',
						icon: <Icon type="check-circle-o" />,
						disabled: !quotation.quotationNeedsAdjustment,
						title: <EditableTransWrapper><Trans>Marquer comme régularisé</Trans></EditableTransWrapper>,
						method: this.markAsResolved,
						requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
					}, {
						id: 'seeStatusHistory',
						icon: <Icon type="eye-o" />,
						title: <EditableTransWrapper><Trans>{'Voir l\'historique des statuts'}</Trans></EditableTransWrapper>,
						modal: <StatusHistoryModal width={750} contract={quotation}/>,
						requiredRights: [{uri: '/contract_status_histories', action: 'GET'}]
					}, ...getContractStatusActions(i18n, quotation, this.updateDashboard)]
				},
				body: {
					fixedLayout: true,
					fixedLayoutBody: <Row gutter={20}>
						<Col sm={24} md={24} lg={16}>
							<DashboardBox config={{
								id: 'benefits',
								big: true,
								title: <EditableTransWrapper><Trans>Prestations</Trans></EditableTransWrapper>,
								icon: <Icon type="tool" />,
								actions: [{
									id: 'addBenefit',
									title: <EditableTransWrapper><Trans>Ajouter une prestation</Trans></EditableTransWrapper>,
									icon: <Icon type="plus" />,
									unfolded: true,
									disabled: quotation.status !== 1,
									modal: <BenefitFormModal
										maskClosable={false}
										wrapClassName="benefit-form-modal"
										width={750} contract={quotation}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: '/benefits', action: 'POST'}]
								}],
								content: <Benefits benefitsChangedCallback={this.updateDashboard} contract={quotation} />,
								requiredRights: [{uri: '/benefits', action: 'GET'}]
							}} />
							<DashboardBox config={{
								id: 'products',
								big: true,
								title: <EditableTransWrapper><Trans>Produits</Trans></EditableTransWrapper>,
								icon: <Icon type="barcode" />,
								actions: [{
									id: 'addProduct',
									title: <EditableTransWrapper><Trans>Ajouter un produit</Trans></EditableTransWrapper>,
									icon: <Icon type="plus" />,
									unfolded: true,
									disabled: quotation.status !== 1,
									modal: <ProductFormModal
										maskClosable={false}
										wrapClassName="product-form-modal"
										width={750} contract={quotation}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: '/products', action: 'POST'}]
								}],
								content: <Products productsChangedCallback={this.updateDashboard} contract={quotation} />,
								requiredRights: [{uri: '/products', action: 'GET'}]
							}} />
							<Row gutter={20}>
								<Col sm={24} md={24} lg={12}>
									{
										this.isQuotationAfterValidated() ?
											<DashboardBox config={{
												id: 'calendarContractualInfo',
												title: <EditableTransWrapper><Trans>Calendrier contractuel</Trans></EditableTransWrapper>,
												icon: <Icon type="calendar" />,
												actions: [{
													id: 'calendar',
													disabled: true, // todo
													icon: <Icon type="calendar"/>,
													title: <EditableTransWrapper><Trans>Accéder au calendrier contractuel</Trans></EditableTransWrapper>,
													// todo requiredRights: [{uri: '', action: 'GET'}]
												}, {
													id: 'downloadPlanningContractual',
													disabled: true, // todo
													icon: <Icon type="download" />,
													title: <EditableTransWrapper><Trans>Télécharger le planning contractuel</Trans></EditableTransWrapper>,
													// todo requiredRights: [{uri: '', action: 'GET'}]
												}],
												content: <div className="calendar-info-box">
													<div className="info-block">
														<span className="big-size">{plannedOpContractual}</span>
														{'/'}
														<span>{totalOpContractual}</span>
														<div className="description">
															<EditableTransWrapper><Trans>Opérations programmées</Trans></EditableTransWrapper>
														</div>
													</div>
													<div className="info-block not-planned">
														<span className={classNames({
															'big-size-red': (notPlannedOpContractual != 0)
														},{
															'big-size': (notPlannedOpContractual == 0)
														} )}>{notPlannedOpContractual}</span>
														{'/'}
														<span>{totalOpContractual}</span>
														<div className="description">
															<EditableTransWrapper><Trans>Opérations en attente de programmation</Trans></EditableTransWrapper>
														</div>
													</div>
												</div>
											}} />
											: null
									}
									<DashboardBox config={{
										id: 'linkedContracts',
										title: <EditableTransWrapper><Trans>Contrats liés</Trans></EditableTransWrapper>,
										icon: <Icon type="file-text" />,
										actions: [{
											id: 'addLinkedContract',
											title: <EditableTransWrapper><Trans>{'Lier à un autre contrat'}</Trans></EditableTransWrapper>,
											icon: <Icon type="plus" />,
											unfolded: true,
											modal: <AddLinkedContractModal contract={quotation}/>,
											modalCloseCallback: (refresh) => {
												if (refresh) {
													this.updateDashboard();
												}
											},
											requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
										}],
										content: <LinkedContracts contract={quotation} />,
										requiredRights: [{uri: '/contracts', action: 'GET'}]
									}}/>
								</Col>
								<Col sm={24} md={24} lg={12}>
									{
										this.isQuotationAfterValidated() ?
											<DashboardBox config={{
												id: 'calendarServicesInfo',
												title: <EditableTransWrapper><Trans>Calendrier des services</Trans></EditableTransWrapper>,
												icon: <Icon type="calendar" />,
												actions: [{
													id: 'calendar',
													disabled: true, // todo
													icon: <Icon type="calendar"/>,
													title: <EditableTransWrapper><Trans>Accéder au calendrier des services</Trans></EditableTransWrapper>,
													// todo requiredRights: [{uri: '', action: 'GET'}]
												}, {
													id: 'interventionsList',
													disabled: true, // todo
													icon: <Icon type="bars" />,
													title: <EditableTransWrapper><Trans>Liste des interventions</Trans></EditableTransWrapper>,
													// todo requiredRights: [{uri: '', action: 'GET'}]
												}],
												content: <div className="calendar-info-box">
													<div className="info-block">
														<span className="big-size">{plannedOpServices}</span>
														{'/'}
														<span>{totalOpServices}</span>
														<div className="description">
															<EditableTransWrapper><Trans>Opérations programmées</Trans></EditableTransWrapper>
														</div>
													</div>
													<div className="info-block not-planned">
														<span className={classNames({
															'big-size-red': (notPlannedOpServices != 0)
														},{
															'big-size': (notPlannedOpServices == 0)
														} )}>{notPlannedOpServices}</span>
														{'/'}
														<span>{totalOpServices}</span>
														<div className="description">
															<EditableTransWrapper><Trans>Opérations en attente de programmation</Trans></EditableTransWrapper>
														</div>
													</div>
												</div>
											}} />
											: null
									}
									<DashboardBox config={{
										id: 'documents',
										title: <EditableTransWrapper><Trans>Pièces jointes</Trans></EditableTransWrapper>,
										icon: <Icon type="paper-clip"/>,
										actions: [{
											id: 'addDocuments',
											title: <EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>,
											icon: <Icon type="plus"/>,
											unfolded: true,
											modal: <AddContractDocumentModal contract={quotation} uri="/contract_documents" param="contract"/>,
											modalCloseCallback: (refresh) => {
												if (refresh) {
													this.updateDashboard();
												}
											},
											requiredRights: [
												{uri: '/files/upload', action: 'POST'},
												{uri: '/contract_documents', action: 'POST'}
											]
										}],
										content: <Documents entity={quotation} uri="/contract_documents" param="contract"/>,
										requiredRights: [{uri: '/contract_documents', action: 'GET'}]
									}} />
								</Col>
							</Row>
						</Col>
						<Col sm={24} md={24} lg={8}>
							<DashboardBox config={{
								id: 'commercialDiscount',
								title: <EditableTransWrapper><Trans>Remise commerciale</Trans></EditableTransWrapper>,
								icon: <IconSvg type={import('../../../../icons/percentage.svg')}/>,
								actions: [{
									id: 'modifyCommercialDiscount',
									title: <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>,
									icon: <Icon type="edit" />,
									unfolded: true,
									disabled: quotation.status !== 1,
									modal: <ModifyCommercialDiscountModal contract={quotation}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
								}],
								content: <div className="comercial-discount-box">
									<div className="percentage-wrapper">
										<span className="percentage">{(Math.round(quotation.commercialDiscount * 100 / quotation.totalPriceWithoutDiscount * 100) / 100) || 0}</span>
										{'%'}
									</div>
									<div className="details">
										<EditableTransWrapper><Trans>du montant du contrat</Trans></EditableTransWrapper>
										{', '}
										<EditableTransWrapper><Trans>soit</Trans></EditableTransWrapper>
										{' ' + (quotation.commercialDiscount || 0).toLocaleString(
											'fr-FR', {
												style: 'currency',
												currency: 'EUR'
											}
										)}
									</div>
								</div>
							}} />
							<DashboardBox config={{
								id: 'billing',
								title: <EditableTransWrapper><Trans>Facturation</Trans></EditableTransWrapper>,
								icon: <IconSvg type={import('../../../../icons/euro-no-circle.svg')}/>,
								actions: [{
									id: 'modifyBillingAddress',
									title: <EditableTransWrapper><Trans>Modifier les informations de facturation</Trans></EditableTransWrapper>,
									icon: <Icon type="edit" />,
									modal: <ModifyBillingInfoModal width={750} contract={quotation}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
								},{
									id: 'modifyBillingAddress',
									title: <EditableTransWrapper><Trans>Configurer la fréquence de facturation</Trans></EditableTransWrapper>,
									icon: <Icon type="edit" />,
									disabled: true,
									// modal: <ModifyBillingInfoModal width={750} contract={contract}/>,
									// modalCloseCallback: (refresh) => {
									// 	if (refresh) {
									// 		this.updateDashboard();
									// 	}
									// },
									requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
								}],
								content: <div className="billing-box">
									<div className="section billing-address">
										<div className="title">
											<EditableTransWrapper><Trans>Adresse de facturation</Trans></EditableTransWrapper>
										</div>
										<div className="content">{this.getBillingAddress()}</div>
									</div>
									<div className="section client-reference">
										<div className="title">
											<EditableTransWrapper><Trans>Référence à reporter sur les factures</Trans></EditableTransWrapper>
										</div>
										<div className="content">
											{
												quotation.clientReference ?
													quotation.clientReference
													: <div className="empty-tag">
														<EditableTransWrapper>
															<Trans>{'Le référence client n\'a pas encore été renseigné'}</Trans>
														</EditableTransWrapper>
													</div>
											}

										</div>
									</div>
									<div className="section billing-address">
										<div className="title">
											<EditableTransWrapper><Trans>Fréquence de facturation</Trans></EditableTransWrapper>
										</div>
										<div className="content">
											{/* todo */}
											<div className="empty-tag">
												<EditableTransWrapper>
													<Trans>{'La fréquence de facturation n\'a pas encore été configurée'}</Trans>
												</EditableTransWrapper>
											</div>
										</div>
									</div>
								</div>
							}} />
							<DashboardBox config={{
								id: 'buyingDataPoint',
								title: <EditableTransWrapper><Trans>Point de contact achat</Trans></EditableTransWrapper>,
								icon: <Icon type="phone" />,
								actions: [{
									id: 'selectBuyingDataPoint',
									title: <EditableTransWrapper><Trans>{'Sélectionner un point de contact achat'}</Trans></EditableTransWrapper>,
									icon: <Icon type="check-square-o" />,
									disabled: quotation.buyingDataPoint,
									modal: <SelectBuyingDataPointModal width={750} contract={quotation} />,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
								}, {
									id: 'removeBuyingDataPoint',
									title: <EditableTransWrapper><Trans>{'Désélectionner le point de contact achat'}</Trans></EditableTransWrapper>,
									icon: <Icon type="close-square-o" />,
									disabled: !quotation.buyingDataPoint,
									method: this.removeBuyingDataPoint,
									requiredRights: [{uri: quotation['@id'], action: 'PUT'}]
								}],
								content: <BuyingDataPoint contract={quotation} />,
								requiredRights: [{uri: '/data_points', action: 'GET'}]
							}} />
						</Col>
					</Row>,
				}
			};
		}
		return null;
	}

	async fetchQuotationData(props) {
		let quotation;
		this.setState({ready: false});
		const {quotationId} =  props.match.params;
		const quotationResponse = await apiClient.fetch('/contracts/' + quotationId).catch(() => this.setState({ready: true}));
		if (quotationResponse && quotationResponse.status === 200) {
			quotation = quotationResponse.json;
			this.setState({
				ready: true,
				quotation
			});
		}
	}

	updateDashboard = (props) => {
		this.fetchQuotationData(props || this.props);
	}

	componentDidMount() {
		this.updateDashboard();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.quotationId !== nextProps.match.params.quotationId) {
			this.updateDashboard(nextProps);
		}
	}

	render() {
		const {ready, quotation} = this.state;
		return (
			ready ?
				(
					quotation && quotation.nature === 3?
						<DashboardComp className={classNames('quotation-dashboard contract-dashboard', {
							emergency: quotation.quotationNeedsAdjustment
						})} config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le devis n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(ContractDashboard);
