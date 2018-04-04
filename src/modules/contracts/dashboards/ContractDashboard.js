import React from 'react';
import moment from 'moment';
import {Link} from 'react-router-dom';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import apiClient from '../../../apiClient';
import Col from 'antd/lib/col';
import Row from 'antd/lib/row';
import DashboardBox from '../../../components/dashboard/DashboardBox';
import {Trans, withI18n} from 'lingui-react';
import Tag from '../../../components/tag/Tag';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ContractStatus from '../../../apiConstants/ContractStatus';
import AdditionalClauses from '../dashboardBoxes/AdditionalClauses';
import Benefits from '../dashboardBoxes/Benefits';
import BuyingDataPoint from '../dashboardBoxes/BuyingDataPoint';
import LinkedContracts from '../dashboardBoxes/LinkedContracts';
import ModifyCommercialDiscountModal from '../modals/ModifyCommercialDiscountModal';
import ModifyBillingInfoModal from '../modals/ModifyBillingInfoModal';
import ModifyContractModal from '../modals/ModifyContractModal';
import AddLinkedContractModal from '../modals/AddLinkedContractModal';
import SelectBuyingDataPointModal from '../modals/SelectBuyingDataPointModal';
import BenefitFormModal from '../modals/BenefitFormModal';
import StatusHistoryModal from '../modals/StatusHistoryModal';
import getContractStatusActions from '../utils/getContractStatusActions';
import classNames from 'classnames';
import './ContractDashboard.scss';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import notification from 'antd/lib/notification';
import Documents from '../dashboardBoxes/Documents';
import getFullAddress from '../../utils/getFullAddress';
import AddContractDocumentModal from '../modals/AddContractDocumentModal';

class ContractDashboard extends React.Component {

	state = {
		ready: false,
		contract: null
	}

	getFullOrganizations = () => {
		const {contract} = this.state;
		let fullOrganizations;
		if (contract && contract.division) {
			if (contract.division.parent)
				fullOrganizations = contract.division.parent.name + ' > ' + contract.division.name;
			else
				fullOrganizations = contract.division.name;
			fullOrganizations = <Link className="division-link" to={'/divisions/split/' + contract.division.id}>
				{fullOrganizations}
			</Link>;
		}

		return fullOrganizations;
	}

	newAdditionalClause = () => {
		const {i18n} = this.props;
		Modal.confirm({
			title: i18n.t`Voulez vous ajouter un avenant sur ce contrat?`,
			className: 'qhs-confirm-modal',
			okText: i18n.t`Ajouter`,
			cancelText: i18n.t`Annuler`,
			width: 450,
			onOk: () => {
				const {contract} = this.state;
				apiClient.fetch('/contracts', {
					method: 'POST',
					body: jsonStringifyPreserveUndefined({
						nature: 1,
						parent: contract['@id'],
						division: contract.division['@id'],
						commercial: contract.commercial['@id']
					})
				}).then(
					() => {
						this.updateDashboard();
						notification['success']({
							message: i18n.t`L'avenant a été bien ajouté.`,
							className: 'qhs-notification success'
						});

					},
					() => {
						notification['error']({
							message: i18n.t`L'avenant n'a pas été ajouté.`,
							className: 'qhs-notification error'
						});
					}
				);
			}
		});
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

	getBillingAddress = () => {
		const {contract} = this.state;
		const {billingAddress} = contract;
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
		const {contract} = this.state;
		if (contract) {
			return <div>
				<EditableTransWrapper><Trans>Contrat</Trans></EditableTransWrapper>
				{' ' + contract.number}
			</div>;
		}
		return null;
	}

	getContractStatus = () => {
		const {contract} = this.state;
		const contractStatus = ContractStatus.find((status) => status.value === contract.status);
		if (contract) {
			return <div className="contract-status-wrapper">
				<span className="contract-status">
					<div className="status-point" style={{background: contractStatus.color}}/>
					<div className="status-label">
						{' '}
						<EditableTransWrapper><Trans id={contractStatus.label}/></EditableTransWrapper>
					</div>
				</span>
				<div className="info-plus">
					<EditableTransWrapper><Trans>Créé par</Trans></EditableTransWrapper>
					{` ${contract.createdBy.employee.firstName} ${contract.createdBy.employee.lastName} `}
					<EditableTransWrapper><Trans>le</Trans></EditableTransWrapper>
					{' ' + moment(contract.createdAt).format('L')}
				</div>
			</div>;
		}
		return null;
	}

	isContractAfterValidated = () => {
		const {contract} = this.state;
		return contract.status === 6  //ACTIVATED
			|| contract.status === 7  //SUSPENDED
			|| contract.status === 8; //CLOSED
	}

	getConfig = () => {
		const {ready, contract} = this.state;
		const { i18n } = this.props;
		const {totalPlannedOperations} = contract;

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


		if (ready && contract) {
			return {
				head: {
					title: this.getDashboardHeadTitle(),
					subTitle: this.getFullOrganizations(),
					photoComponent: <Icon type="file-text" />,
					contents: [{
						component: <div>
							{this.getContractStatus()}
							<div className="tags">
								<Tag label={
									<EditableTransWrapper><Trans>Sur bon de commande</Trans></EditableTransWrapper>
								} checked={contract.linkedToPurchaseOrders} />
								<Tag label={
									<EditableTransWrapper><Trans>Reconduction tacite</Trans></EditableTransWrapper>
								} checked={contract.tacitRenewal} />
								<Tag label={
									<EditableTransWrapper><Trans>Mode DC4</Trans></EditableTransWrapper>
								} checked={contract.dc4Mode} />
								<Tag label={
									<EditableTransWrapper><Trans>Auto-liquidation</Trans></EditableTransWrapper>
								} checked={contract.autoLiquidation} />
							</div>
						</div>
					}, [
						{
							label: <EditableTransWrapper><Trans>Dates</Trans></EditableTransWrapper>,
							value: (contract.startDate && contract.endDate)?
								<div>
									<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
									{' ' + moment(contract.startDate).format('L') + ' '}
									<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
									{' ' + moment(contract.endDate).format('L')}
								</div>
								: null
						}, {
							label: <EditableTransWrapper><Trans>Durée</Trans></EditableTransWrapper>,
							value: contract.duration ?
								<div>
									{contract.duration + ' '}
									<EditableTransWrapper><Trans>mois</Trans></EditableTransWrapper>
								</div> : null
						}, {
							label: <EditableTransWrapper><Trans>Date de clôture</Trans></EditableTransWrapper>,
							value: contract.closedAt ? <div>{moment(contract.closedAt).format('L')}</div> : null
						}, {
							label: <EditableTransWrapper><Trans>Note de bas de tableau</Trans></EditableTransWrapper>,
							value: contract.note
						}
					], [
						{
							label: <EditableTransWrapper><Trans>En charge</Trans></EditableTransWrapper>,
							value: contract.commercial ?
								<Link to={'/employee/' + contract.commercial.id}>
									{`${contract.commercial.firstName} ${contract.commercial.lastName}`}
								</Link> : null
						}, {
							label: <EditableTransWrapper><Trans>Validé par</Trans></EditableTransWrapper>,
							value: (
								contract.validatedBy ?
									<Link to={'/employee/' + contract.validatedBy.employee.id}>
										{`${contract.validatedBy.employee.firstName} ${contract.validatedBy.employee.lastName}`}
									</Link> : null
							)
						}, {
							label: <EditableTransWrapper><Trans>Montant total</Trans></EditableTransWrapper>,
							value: contract.totalPrice ? contract.totalPrice.toLocaleString('fr-FR', {
								style: 'currency',
								currency: 'EUR'
							}) : null
						}
					]],
					foot: <div>
						{
							contract.comment ? <div className="foot-comment">
								<IconSvg type={import('../../../../icons/message.svg')}/>
								<span className="comment">{contract.comment}</span>
							</div> : null
						}
						{
							contract.status == 7 && contract.statusComment ? <div className="foot-alert">
								<IconSvg type={import('../../../../icons/exclamation-circle-o.svg')}/>
								<span className="comment">{contract.statusComment}</span>
							</div> : null
						}
					</div>,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit" />,
						title: <EditableTransWrapper><Trans>Modifier les informations du contrat</Trans></EditableTransWrapper>,
						modal: <ModifyContractModal width={750} contract={contract}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.updateDashboard();
							}
						},
						requiredRights: [{uri: contract['@id'], action: 'PUT'}]
					}, {
						id: 'seeStatusHistory',
						icon: <Icon type="eye-o" />,
						title: <EditableTransWrapper><Trans>{'Voir l\'historique des statuts'}</Trans></EditableTransWrapper>,
						modal: <StatusHistoryModal width={750} contract={contract}/>,
						requiredRights: [{uri: '/contract_status_histories', action: 'GET'}]
					}, ...getContractStatusActions(i18n, contract, this.updateDashboard)]
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
									disabled: contract.status !== 1,
									modal: <BenefitFormModal
										maskClosable={false}
										wrapClassName="benefit-form-modal"
										width={750} contract={contract}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: '/benefits', action: 'POST'}]
								}],
								content: <Benefits benefitsChangedCallback={this.updateDashboard} contract={contract} />,
								requiredRights: [{uri: '/benefits', action: 'GET'}]
							}} />
							<Row gutter={20}>
								<Col sm={24} md={24} lg={12}>
									{
										this.isContractAfterValidated() ?
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
									{
										this.isContractAfterValidated() ?
											<DashboardBox config={{
												id: 'additionalClauses',
												title: <EditableTransWrapper><Trans>Avenants</Trans></EditableTransWrapper>,
												icon: <Icon type="copy" />,
												actions: [{
													id: 'addAdditionalClause',
													title: <EditableTransWrapper><Trans>{'Ajouter un avenant'}</Trans></EditableTransWrapper>,
													icon: <Icon type="plus" />,
													unfolded: true,
													disabled: contract.status !== 6,
													method: this.newAdditionalClause,
													requiredRights: [{uri: '/contracts', action: 'POST'}]
												}],
												content: <AdditionalClauses contract={contract} />,
												requiredRights: [{uri: '/contracts', action: 'GET'}]
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
											modal: <AddLinkedContractModal contract={contract}/>,
											modalCloseCallback: (refresh) => {
												if (refresh) {
													this.updateDashboard();
												}
											},
											requiredRights: [{uri: contract['@id'], action: 'PUT'}]
										}],
										content: <LinkedContracts contract={contract} />,
										requiredRights: [{uri: '/contracts', action: 'GET'}]
									}}/>
								</Col>
								<Col sm={24} md={24} lg={12}>
									{
										this.isContractAfterValidated() ?
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
											modal: <AddContractDocumentModal contract={contract} uri="/contract_documents" param="contract"/>,
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
										content: <Documents entity={contract} uri="/contract_documents" param="contract"/>,
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
									disabled: contract.status !== 1,
									modal: <ModifyCommercialDiscountModal contract={contract}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: contract['@id'], action: 'PUT'}]
								}],
								content: <div className="comercial-discount-box">
									<div className="percentage-wrapper">
										<span className="percentage">{(Math.round(contract.commercialDiscount * 100 / contract.totalPriceWithoutDiscount * 100) / 100) || 0}</span>
										{'%'}
									</div>
									<div className="details">
										<EditableTransWrapper><Trans>du montant du contrat</Trans></EditableTransWrapper>
										{', '}
										<EditableTransWrapper><Trans>soit</Trans></EditableTransWrapper>
										{' ' + (contract.commercialDiscount || 0).toLocaleString(
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
									modal: <ModifyBillingInfoModal width={750} contract={contract}/>,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: contract['@id'], action: 'PUT'}]
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
									requiredRights: [{uri: contract['@id'], action: 'PUT'}]
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
												contract.clientReference ?
													contract.clientReference
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
									disabled: contract.buyingDataPoint,
									modal: <SelectBuyingDataPointModal width={750} contract={contract} />,
									modalCloseCallback: (refresh) => {
										if (refresh) {
											this.updateDashboard();
										}
									},
									requiredRights: [{uri: contract['@id'], action: 'PUT'}]
								}, {
									id: 'removeBuyingDataPoint',
									title: <EditableTransWrapper><Trans>{'Désélectionner le point de contact achat'}</Trans></EditableTransWrapper>,
									icon: <Icon type="close-square-o" />,
									disabled: !contract.buyingDataPoint,
									method: this.removeBuyingDataPoint,
									requiredRights: [{uri: contract['@id'], action: 'PUT'}]
								}],
								content: <BuyingDataPoint contract={contract} />,
								requiredRights: [{uri: '/data_points', action: 'GET'}]
							}} />
						</Col>
					</Row>,
				}
			};
		}
		return null;
	}

	async fetchContractData(props) {
		let contract;
		this.setState({ready: false});
		const {contractId} =  props.match.params;
		const contractResponse = await apiClient.fetch('/contracts/' + contractId).catch(() => this.setState({ready: true}));
		if (contractResponse && contractResponse.status === 200) {
			contract = contractResponse.json;
			this.setState({
				ready: true,
				contract
			});
		}
	}

	updateDashboard = (props) => {
		this.fetchContractData(props || this.props);
	}

	componentDidMount() {
		this.updateDashboard();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.contractId !== nextProps.match.params.contractId) {
			this.updateDashboard(nextProps);
		}
	}

	render() {
		const {ready, contract} = this.state;
		return (
			ready ?
				(
					contract && contract.nature === 2?
						<DashboardComp className="contract-dashboard" config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Le contrat n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(ContractDashboard);
