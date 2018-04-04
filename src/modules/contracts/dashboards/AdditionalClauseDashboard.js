import React from 'react';
import moment from 'moment';
import {Link} from 'react-router-dom';
import DashboardComp from '../../../components/dashboard/Dashboard';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ContractStatus from '../../../apiConstants/ContractStatus';
import Benefits from '../dashboardBoxes/Benefits';
import BenefitFormModal from '../modals/BenefitFormModal';
import StatusHistoryModal from '../modals/StatusHistoryModal';
import getContractStatusActions from '../utils/getContractStatusActions';
import BuyingDataPoint from '../dashboardBoxes/BuyingDataPoint';
import SelectBuyingDataPointModal from '../modals/SelectBuyingDataPointModal';
import './ContractDashboard.scss';
import './AdditionalClauseDashboard.scss';
import Documents from '../dashboardBoxes/Documents';
import Modifications from '../dashboardBoxes/Modifications';
import AddContractDocumentModal from '../modals/AddContractDocumentModal';
import ModifyAdditionalClauseModal from '../modals/ModifyAdditionalClauseModal';
import jsonStringifyPreserveUndefined from '../../utils/jsonStringifyPreserveUndefined';
import message from 'antd/lib/message/index';
import Modal from 'antd/lib/modal/index';

class AdditionalClauseDashboard extends React.Component {

	state = {
		ready: false,
		additionalClause: null
	}

	getFullOrganizations = () => {
		const {additionalClause} = this.state;
		let fullOrganizations;
		if (additionalClause && additionalClause.division) {
			if (additionalClause.division.parent)
				fullOrganizations = additionalClause.division.parent.name + ' > ' + additionalClause.division.name;
			else
				fullOrganizations = additionalClause.division.name;
			fullOrganizations = <Link className="division-link" to={'/divisions/split/' + additionalClause.division.id}>
				{fullOrganizations}
			</Link>;
		}

		return fullOrganizations;
	}

	getDashboardHeadTitle = () => {
		const {additionalClause} = this.state;
		const {parent} = additionalClause;
		if (additionalClause) {
			return <div>
				<EditableTransWrapper><Trans>Avenant</Trans></EditableTransWrapper>
				{' ' + additionalClause.number + ' '}
				<EditableTransWrapper><Trans>au contrat</Trans></EditableTransWrapper>
				{' '}
				<Link to={'/contracts/list/' + parent.id}>{parent.number}</Link>
			</div>;
		}
		return null;
	}

	getAdditionalClauseStatus = () => {
		const {additionalClause} = this.state;
		const additionalClauseStatus = ContractStatus.find((status) => status.value === additionalClause.status);
		if (additionalClause) {
			return <div className="contract-status-wrapper">
				<span className="contract-status">
					<div className="status-point" style={{background: additionalClauseStatus.color}}/>
					<div className="status-label">
						{' '}
						<EditableTransWrapper><Trans id={additionalClauseStatus.label}/></EditableTransWrapper>
					</div>
				</span>
				<div className="info-plus">
					<EditableTransWrapper><Trans>Créé par</Trans></EditableTransWrapper>
					{` ${additionalClause.createdBy.employee.firstName} ${additionalClause.createdBy.employee.lastName} `}
					<EditableTransWrapper><Trans>le</Trans></EditableTransWrapper>
					{' ' + moment(additionalClause.createdAt).format('L')}
				</div>
			</div>;
		}
		return null;
	}

	removeBuyingDataPoint = () => {
		const {i18n} = this.props;
		Modal.confirm({
			title: i18n.t`Voulez vous désélectionner le point de contact achat?`,
			okText: i18n.t`Désélectionner`,
			okType: 'danger',
			cancelText: i18n.t`Annuler`,
			onOk: () => {
				const {additionalClause} = this.state;
				apiClient.fetch(additionalClause['@id'], {
					method: 'PUT',
					body: jsonStringifyPreserveUndefined({
						buyingDataPoint: null
					})
				}).then(
					() => {
						this.updateDashboard();
						message.success(i18n.t`Le point de contact achat a été bien désélectionné.`);

					},
					() => {
						message.error(i18n.t`Le point de contact achat n'a pas été désélectionné.`);

					}
				);
			}
		});
	}

	getConfig = () => {
		const {ready, additionalClause} = this.state;
		const { i18n } = this.props;

		if (ready && additionalClause) {
			const config =  {
				head: {
					title: this.getDashboardHeadTitle(),
					subTitle: this.getFullOrganizations(),
					photoComponent: <Icon type="file-text" />,
					contents: [{
						component: this.getAdditionalClauseStatus()
					}, [
						{
							label: <EditableTransWrapper><Trans>Date de création</Trans></EditableTransWrapper>,
							value: additionalClause.createdAt?
								<div>{moment(additionalClause.createdAt).format('L')}</div> : null
						}, {
							label: <EditableTransWrapper><Trans>{'Date d\'activation'}</Trans></EditableTransWrapper>,
							value: additionalClause.closedAt?
								<div>{moment(additionalClause.closedAt).format('L')}</div> : null
						}, {
							label: <EditableTransWrapper><Trans>Note de bas de tableau</Trans></EditableTransWrapper>,
							value: additionalClause.note
						}
					], [
						{
							label: <EditableTransWrapper><Trans>En charge</Trans></EditableTransWrapper>,
							value: additionalClause.commercial ?
								<Link to={'/employee/' + additionalClause.commercial.id}>
									{`${additionalClause.commercial.firstName} ${additionalClause.commercial.lastName}`}
								</Link> : null
						}, {
							label: <EditableTransWrapper><Trans>Validé par</Trans></EditableTransWrapper>,
							value: (
								additionalClause.validatedBy ?
									<Link to={'/employee/' + additionalClause.validatedBy.employee.id}>
										{`${additionalClause.validatedBy.employee.firstName} ${additionalClause.validatedBy.employee.lastName}`}
									</Link> : null
							)
						}
					]],
					foot: <div>
						{
							additionalClause.comment ? <div className="foot-comment">
								<IconSvg type={import('../../../../icons/message.svg')}/>
								<span className="comment">{additionalClause.comment}</span>
							</div> : null
						}
						{
							additionalClause.status == 7 && additionalClause.statusComment ? <div className="foot-alert">
								<IconSvg type={import('../../../../icons/exclamation-circle-o.svg')}/>
								<span className="comment">{additionalClause.statusComment}</span>
							</div> : null
						}
					</div>,
					actions: [{
						id: 'modify',
						icon: <Icon type="edit" />,
						title: <EditableTransWrapper><Trans>{'Modifier les informations de l\'avenant'}</Trans></EditableTransWrapper>,
						modal: <ModifyAdditionalClauseModal contract={additionalClause} width={750}/>,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.updateDashboard();
							}
						},
						requiredRights: [{uri: additionalClause['@id'], action: 'PUT'}]
					}, {
						id: 'seeStatusHistory',
						icon: <Icon type="eye-o" />,
						title: <EditableTransWrapper><Trans>{'Voir l\'historique des statuts'}</Trans></EditableTransWrapper>,
						modal: <StatusHistoryModal width={750} contract={additionalClause}/>,
						requiredRights: [{uri: '/contract_status_histories', action: 'GET'}]
					},
					...getContractStatusActions(i18n, additionalClause, this.updateDashboard)
					]
				},
				body: {
					boxes: [{
						id: 'modifications',
						big: true,
						disabled: additionalClause.status !== 1,
						title: <EditableTransWrapper><Trans>Modifications au contrat</Trans></EditableTransWrapper>,
						icon: <Icon type="edit"/>,
						content: <Modifications additionalClause={additionalClause} />,
						requiredRights: [{uri: '/amendment_modifications', action: 'GET'}]
					}, {
						id: 'documents',
						title: <EditableTransWrapper><Trans>Pièces jointes</Trans></EditableTransWrapper>,
						icon: <Icon type="paper-clip"/>,
						actions: [{
							id: 'addDocuments',
							title: <EditableTransWrapper><Trans>Ajouter une pièce jointe</Trans></EditableTransWrapper>,
							icon: <Icon type="plus"/>,
							unfolded: true,
							modal: <AddContractDocumentModal contract={additionalClause} uri="/contract_documents" param="contract"/>,
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
						content: <Documents entity={additionalClause} uri="/contract_documents" param="contract"/>,
						requiredRights: [{uri: '/contract_documents', action: 'GET'}]
					}, {
						id: 'buyingDataPoint',
						title: <EditableTransWrapper><Trans>Point de contact achat</Trans></EditableTransWrapper>,
						icon: <Icon type="phone" />,
						actions: [{
							id: 'selectBuyingDataPoint',
							title: <EditableTransWrapper><Trans>{'Sélectionner un point de contact achat'}</Trans></EditableTransWrapper>,
							icon: <Icon type="check-square-o" />,
							disabled: additionalClause.buyingDataPoint,
							modal: <SelectBuyingDataPointModal width={750} contract={additionalClause} />,
							modalCloseCallback: (refresh) => {
								if (refresh) {
									this.updateDashboard();
								}
							},
							requiredRights: [{uri: additionalClause['@id'], action: 'PUT'}]
						}, {
							id: 'removeBuyingDataPoint',
							title: <EditableTransWrapper><Trans>{'Désélectionner le point de contact achat'}</Trans></EditableTransWrapper>,
							icon: <Icon type="close-square-o" />,
							disabled: !additionalClause.buyingDataPoint,
							method: this.removeBuyingDataPoint,
							requiredRights: [{uri: additionalClause['@id'], action: 'PUT'}]
						}],
						content: <BuyingDataPoint contract={additionalClause} />,
						requiredRights: [{uri: '/data_points', action: 'GET'}]
					}]
				}
			};
			if (additionalClause.status !== 8) {
				config.body.boxes.unshift({
					id: 'benefits',
					big: true,
					title: <EditableTransWrapper><Trans>Prestations</Trans></EditableTransWrapper>,
					icon: <Icon type="tool" />,
					actions: [{
						id: 'addBenefit',
						title: <EditableTransWrapper><Trans>Ajouter une prestation</Trans></EditableTransWrapper>,
						icon: <Icon type="plus" />,
						unfolded: true,
						disabled: additionalClause.status !== 1,
						modal: <BenefitFormModal
							maskClosable={false}
							wrapClassName="benefit-form-modal"
							width={750} contract={additionalClause}
							newBenefitForAdditionalClause={true} />,
						modalCloseCallback: (refresh) => {
							if (refresh) {
								this.updateDashboard();
							}
						},
						requiredRights: [{uri: '/amendment_modifications', action: 'POST'}]
					}],
					content: <Benefits benefitsChangedCallback={this.updateDashboard} contract={additionalClause} />,
					requiredRights: [{uri: '/amendment_modifications', action: 'GET'}]
				});
			}
			return config;
		}
		return null;
	}

	async fetchAdditionalClauseData(props) {
		let additionalClause;
		this.setState({ready: false});
		const {additionalClauseId} =  props.match.params;
		const additionalClauseResponse = await apiClient.fetch('/contracts/' + additionalClauseId).catch(() => this.setState({ready: true}));
		if (additionalClauseResponse && additionalClauseResponse.status === 200) {
			additionalClause = additionalClauseResponse.json;
			this.setState({
				ready: true,
				additionalClause
			});
		}
	}

	updateDashboard = (props) => {
		this.fetchAdditionalClauseData(props || this.props);
	}

	componentDidMount() {
		this.updateDashboard();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.additionalClauseId !== nextProps.match.params.additionalClauseId) {
			this.updateDashboard(nextProps);
		}
	}

	render() {
		const {ready, additionalClause} = this.state;
		return (
			ready ?
				(
					additionalClause && additionalClause.nature === 1?
						<DashboardComp
							className="additionalClause-dashboard contract-dashboard"
							config={this.getConfig()} />
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'L\'avenant n\'existe pas'}</Trans></EditableTransWrapper>
						</div>
				)
				:
				<Spin className="centered-spin" size="large" />
		);
	}
}

export default withI18n()(AdditionalClauseDashboard);
