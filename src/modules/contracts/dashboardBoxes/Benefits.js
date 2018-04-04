import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Divider from 'antd/lib/divider';
import Collapse from 'antd/lib/collapse';
import Popover from 'antd/lib/popover';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import Actions from '../../../components/actions/Actions';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import './Benefits.scss';
import notification from 'antd/lib/notification';
import Modal from 'antd/lib/modal';
import BenefitFormModal from '../modals/BenefitFormModal';
import getFormattedPriceDiff from '../utils/getFormattedPriceDiff';
import getBenefitInfoWithModification from '../utils/getBenefitInfoWithModification';

class Benefits extends React.Component {

	state = {
		ready: true,
		benefitsHierarchy: null
	}

	weekdayNames = Array.apply(null, Array(7)).map((_, i) => {
		return moment(i, 'e').format('dddd');
	});

	subDivisionIcons = {
		site:   <IconSvg type={import('../../../../icons/environment-o.svg')}/>,
		zone:   <IconSvg type={import('../../../../icons/zone.svg')}/>
	}

	getBenefitActions = (benefit) => {
		const {contract, i18n, benefitsChangedCallback} = this.props;
		const {modification} = benefit;
		let editRequiredRights, disableEditAction;
		if (modification) {
			editRequiredRights = [{uri: modification['@id'], action: 'PUT'}];
			disableEditAction = modification.isNewBenefit || contract.status !== 1;
		} else {
			editRequiredRights = [{uri: benefit['@id'], action: 'PUT'}];
			disableEditAction = false;
		}
		const editAction = {
			id: 'edit',
			title: <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>,
			icon: <Icon type="edit"/>,
			disabled: disableEditAction,
			modal: <BenefitFormModal
				wrapClassName="benefit-form-modal"
				width={750} maskClosable={false}
				contract={contract} benefit={benefit}/>,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					benefitsChangedCallback();
				}
			},
			requiredRights: editRequiredRights
		};
		let deleteAction;
		if (modification && !modification.isNewBenefit) {
			deleteAction = {
				id: 'delete',
				disabled: contract.status !== 1,
				type: 'danger',
				title: <EditableTransWrapper><Trans>Mettre la quantité à zéro</Trans></EditableTransWrapper>,
				icon: <Icon type="delete"/>,
				method: () => {
					Modal.confirm({
						title: i18n.t`Voulez-vous mettre la quantité de la prestation à zéro?`,
						okText: i18n.t`Confirmer`,
						className: 'delete qhs-confirm-modal',
						okType: 'danger',
						cancelText: i18n.t`Annuler`,
						iconType: 'exclamation-circle',
						maskClosable: true,
						width: 500,
						onOk: () => {
							apiClient.fetch(modification['@id'], {
								method: 'PUT',
								body: JSON.stringify({quantity: 0 - benefit.quantity})
							}).then(
								() => {
									benefitsChangedCallback();
									notification['success']({
										message: i18n.t`La quantité de la prestation a bien été mis à zéro.`,
										className: 'qhs-notification success'
									});
								},
								() => {
									notification['error']({
										message: i18n.t`La quantité de la prestation n'a pas été mis à zéro.`,
										className: 'qhs-notification error'
									});
								}
							);
						}
					});
				},
				requiredRights: [{uri: modification['@id'], action: 'PUT'}]
			};
		} else {
			let url, deleteRequiredRights;
			if (modification) {
				url = modification['@id'];
				deleteRequiredRights = [{uri: modification['@id'], action: 'DELETE'}];
			} else {
				url = benefit['@id'];
				deleteRequiredRights = [{uri: benefit['@id'], action: 'DELETE'}];
			}
			deleteAction = {
				id: 'delete',
				disabled: contract.status !== 1,
				type: 'danger',
				title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
				icon: <Icon type="delete"/>,
				method: () => {
					Modal.confirm({
						title: i18n.t`Voulez-vous supprimer cette prestation?`,
						okText: i18n.t`Supprimer`,
						className: 'delete qhs-confirm-modal',
						okType: 'danger',
						cancelText: i18n.t`Annuler`,
						iconType: 'exclamation-circle',
						maskClosable: true,
						onOk: () => {
							apiClient.fetch(url, {method: 'DELETE'}).then(
								null,
								(response) => {
									if (response.response.ok) {
										benefitsChangedCallback();
										notification['success']({
											message: i18n.t`La prestation a été bien supprimée.`,
											className: 'qhs-notification success'
										});
									} else {
										notification['error']({
											message: i18n.t`La prestation n'a pas été supprimée.`,
											className: 'qhs-notification error'
										});
									}
								}
							);
						}
					});
				},
				requiredRights: deleteRequiredRights
			};
		}
		return [editAction, deleteAction];
	}

	addToSubDivisionHierarchy = (subDivision, hierarchy, benefit) => {
		if (subDivision.parent) {
			hierarchy = this.addToSubDivisionHierarchy(subDivision.parent, hierarchy, null);
		}
		if (!hierarchy.children[subDivision['@id']]) {
			hierarchy.children[subDivision['@id']] = {
				...subDivision,
				benefits: [],
				children: {}
			};
		}
		if (benefit) {
			hierarchy.children[subDivision['@id']].benefits.push(benefit);
		}

		return hierarchy.children[subDivision['@id']];
	}

	formatBenefits = (rawBenefits) => {
		let hierarchy = {children: {}};
		for(let i = 0; i < rawBenefits.length; i++) {
			const subDivision = rawBenefits[i].subDivision;
			this.addToSubDivisionHierarchy(subDivision, hierarchy, rawBenefits[i]);
		}
		return hierarchy;
	}

	formatAdditionalClauseModifications = (rawModifications) => {
		let hierarchy = {children: {}};
		for(let i = 0; i < rawModifications.length; i++) {
			let modification = {...rawModifications[i].benefit};
			delete rawModifications[i].benefit;
			modification = {
				...modification,
				modification: {...rawModifications[i]}
			};
			const subDivision = modification.subDivision;
			this.addToSubDivisionHierarchy(subDivision, hierarchy, modification);
		}
		return hierarchy;
	}

	getBenefitInfo = (benefit) => {
		const {contract} = this.props;
		const {modification} = benefit;
		const {priceTaxExcl, quantity, numberOperations} = getBenefitInfoWithModification(benefit, modification);
		let info = [{
			label: <EditableTransWrapper><Trans>Type de prestation</Trans></EditableTransWrapper>,
			value: benefit.benefitType.internalTitle || benefit.benefitType.publicTitle
		}, {
			label: <EditableTransWrapper><Trans>Occurences</Trans></EditableTransWrapper>,
			value: numberOperations || numberOperations === 0 ?
				<span>
					{numberOperations + ' '}
					<EditableTransWrapper><Trans>fois</Trans></EditableTransWrapper>
					<span className="diff">
						{modification && modification.numberOperations ?
							' (' + (modification.numberOperations > 0 ? '+' + modification.numberOperations : modification.numberOperations) + ')' : null}
					</span>
				</span> : null
		}, {
			label: <EditableTransWrapper><Trans>Contraintes horaires</Trans></EditableTransWrapper>,
			value: benefit.benefitTimeConstraints && benefit.benefitTimeConstraints.length ?
				benefit.benefitTimeConstraints.map((timeConstraint, idx) => {
					return <div key={idx}>
						{
							timeConstraint.startDay === timeConstraint.endDay ?
								<span>
									<EditableTransWrapper><Trans>Le</Trans></EditableTransWrapper>
									{' ' + this.weekdayNames[timeConstraint.startDay - 1] + ' '}
									<EditableTransWrapper><Trans>de</Trans></EditableTransWrapper>
									{' ' + timeConstraint.startHour}
									<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
									{' '}
									<EditableTransWrapper><Trans>à</Trans></EditableTransWrapper>
									{' ' + timeConstraint.endHour}
									<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
								</span>
								:
								<span>
									<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
									{' ' + this.weekdayNames[timeConstraint.startDay - 1]}
									{' ' + timeConstraint.startHour}
									<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
									{' '}
									<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
									{' ' + this.weekdayNames[timeConstraint.endDay - 1]}
									{' ' + timeConstraint.endHour}
									<EditableTransWrapper><Trans>h</Trans></EditableTransWrapper>
								</span>
						}
					</div>;
				}) : null
		}, {
			label: <EditableTransWrapper><Trans>Autre(s) contrainte(s)</Trans></EditableTransWrapper>,
			value: benefit.otherConstraints
		}, {
			label: <EditableTransWrapper><Trans>Quantité</Trans></EditableTransWrapper>,
			value: quantity || quantity === 0 ?
				<span>
					{quantity}
					<span className="diff">
						{modification && modification.quantity ?
							' (' + (modification.quantity > 0 ? '+' + modification.quantity : modification.quantity) + ')' : ''}
					</span>
				</span> : null
		}, {
			label: <EditableTransWrapper><Trans>Prix unitaire HT</Trans></EditableTransWrapper>,
			value: priceTaxExcl ?
				<span>
					{priceTaxExcl.toLocaleString('fr-FR', {
						style: 'currency',
						currency: 'EUR'
					})}
					<span className="diff">
						{modification && modification.priceTaxExcl ?
							' (' + getFormattedPriceDiff(modification.priceTaxExcl) + ')' : null}
					</span>
				</span>
				: null
		}, {
			label: <EditableTransWrapper><Trans>Prix total HT</Trans></EditableTransWrapper>,
			value: (benefit.totalPriceTaxExcl || 0).toLocaleString('fr-FR', {
				style: 'currency',
				currency: 'EUR'
			})
		}];
		if (contract.nature !== 3) { // when not quotation
			info.push({
				label: <EditableTransWrapper><Trans>E-mails pré-intervention</Trans></EditableTransWrapper>,
				value: benefit.emailPreInterventionActivated ?
					<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
					:
					<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>
			});
		}
		return info;
	}

	getBenefitTitle = (benefit) => {
		const {modification} = benefit;
		const {title} = getBenefitInfoWithModification(benefit, modification);
		return title || benefit.benefitType.internalTitle || benefit.benefitType.publicTitle;
	}

	getBenefitTitleDescription = (benefit) => {
		let titleDescription = null;
		const {modification} = benefit;
		if (modification) {
			if (modification.isNewBenefit) {
				titleDescription = <Popover
					content={<div style={{padding: '10px 16px 0'}}>
						<p><EditableTransWrapper><Trans>{'Nouvelle prestation créée dans cet avenant'}</Trans></EditableTransWrapper></p>
						<p><EditableTransWrapper><Trans>{'Il n\'est pas possible de modifier la prestation'}</Trans></EditableTransWrapper></p>
					</div>}
					arrowPointAtCenter>
					<Icon type="info-circle" className="info-icon" />
					<EditableTransWrapper><Trans>Nouvelle prestation</Trans></EditableTransWrapper>
				</Popover>;
			} else if (modification.hasModifications) {
				const {description, numberOperations, priceTaxExcl, quantity, title} = modification;
				const gutter = 10;
				titleDescription = <Popover
					content={<div style={{padding: '10px 16px 0'}}>
						<div className="text-alert">
							<p><EditableTransWrapper><Trans>Les informations modifiées :</Trans></EditableTransWrapper></p>
							{title ?
								<Row gutter={gutter}>
									<Col xs={12}><EditableTransWrapper><Trans>Title</Trans></EditableTransWrapper></Col>
									<Col className="value" xs={12}>{title}</Col>
								</Row> : null}
							{description ?
								<Row gutter={gutter}>
									<Col xs={12}><EditableTransWrapper><Trans>Descriptif</Trans></EditableTransWrapper></Col>
									<Col className="value" xs={12}><div dangerouslySetInnerHTML={{__html: description}} /></Col>
								</Row> : null}
							{priceTaxExcl ?
								<Row gutter={gutter}>
									<Col xs={12}><EditableTransWrapper><Trans>Prix UHT</Trans></EditableTransWrapper></Col>
									<Col className="value" xs={12}>{getFormattedPriceDiff(priceTaxExcl)}</Col>
								</Row> : null}
							{quantity ?
								<Row gutter={gutter}>
									<Col xs={12}><EditableTransWrapper><Trans>Quantité</Trans></EditableTransWrapper></Col>
									<Col className="value" xs={12}>{quantity > 0 ? '+' + quantity : quantity}</Col>
								</Row> : null}
							{numberOperations ?
								<Row gutter={gutter}>
									<Col xs={12}><EditableTransWrapper><Trans>Occurences</Trans></EditableTransWrapper></Col>
									<Col className="value" xs={12}>{numberOperations > 0 ? '+' + numberOperations : numberOperations}</Col>
								</Row> : null}
						</div>
						<Divider />
						<p><EditableTransWrapper><Trans>Vous pouvez modifier les information suivantes :</Trans></EditableTransWrapper></p>
						<p><EditableTransWrapper><Trans>Occurences, Quantité, Prix, Titre et Descriptif</Trans></EditableTransWrapper></p>

					</div>}
					arrowPointAtCenter>
					<Icon type="info-circle" className="info-icon alert-icon" />
					<EditableTransWrapper><Trans>Prestation du contrat original (modifiée)</Trans></EditableTransWrapper>
				</Popover>;
			} else {
				titleDescription = <Popover
					content={<div style={{padding: '10px 16px 0'}}>
						<p><EditableTransWrapper><Trans>Prestation copiée du contrat original</Trans></EditableTransWrapper></p>
						<p><EditableTransWrapper><Trans>Vous pouvez modifier les information suivantes :</Trans></EditableTransWrapper></p>
						<p><EditableTransWrapper><Trans>Occurences, Quantité, Prix, Titre et Descriptif</Trans></EditableTransWrapper></p>
					</div>}
					arrowPointAtCenter>
					<Icon type="info-circle" className="info-icon" />
					<EditableTransWrapper><Trans>Prestation du contrat original</Trans></EditableTransWrapper>
				</Popover>;
			}

		}
		return titleDescription;
	}

	getBenefitsComponents = (hierarchy, level) => {
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
							{this.getBenefitsComponents(hierarchy.children[key], level + 1)}
						</Panel>;
					}) : null
			}
			{
				hierarchy.benefits ?
					hierarchy.benefits.map(benefit => {
						const {modification} = benefit;
						const {description, numberOperations} = getBenefitInfoWithModification(benefit, modification);
						return <Panel
							className={classNames({'no-operation' : !numberOperations})}
							showArrow={false}
							key={benefit['@id']} header={
								<div
									className="benefit-title-header"
									style={{paddingLeft: (level - 1) * 25 + 'px' }}
								>
									<Icon className="collapse-icon" type="down" />
									<div className="benefit-title-wrapper">
										<div className="title">
											{this.getBenefitTitle(benefit)}
										</div>
										<div className="title-more">
											<div className="description">
												{this.getBenefitTitleDescription(benefit)}
											</div>
											<div onClick={ev => ev.stopPropagation()}>
												<Actions actions={this.getBenefitActions(benefit)} />
											</div>
										</div>
									</div>
								</div>
							}>
							<div className="benefit-body" style={{paddingLeft: (level - 1) * 25 + 58 + 15 + 12 + 'px' }}>
								<Row type="flex" gutter={30}>
									{
										benefit.description || benefit.publicComment ?
											<Col className="description-wrapper" md={24} lg={12}>
												<div className="description"><div dangerouslySetInnerHTML={{__html: description}} /></div>
												<div className="public-comment"><div dangerouslySetInnerHTML={{__html: benefit.publicComment}} /></div>
											</Col> : null
									}
									<Col className="info-wrapper" md={24} lg={12}>
										{this.getBenefitInfo(benefit).map((info, idx) => {
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
		if (contract.nature === 2) { // contract
			const response = await apiClient.fetch('/benefits', {
				params: {
					contract: contract['@id'],
					pagination: false
				}
			});
			if (response && response.status === 200) {
				const benefits = response.json['hydra:member'];
				this.setState({
					ready: true,
					benefitsHierarchy: benefits && benefits.length ? this.formatBenefits(benefits) : null,
				});
			}
		}
		if (contract.nature === 1) { // additional clause
			const response = await apiClient.fetch('/amendment_modifications', {
				params: {
					amendment: contract['@id'],
					pagination: false
				}
			});
			if (response && response.status === 200) {
				const additionalClauseModifications = response.json['hydra:member'];
				this.setState({
					ready: true,
					benefitsHierarchy:
						additionalClauseModifications && additionalClauseModifications.length ?
							this.formatAdditionalClauseModifications(additionalClauseModifications) : null,
				});
			}
		}
		if (contract.nature === 3) { // quotation
			const response = await apiClient.fetch('/benefits', {
				params: {
					contract: contract['@id'],
					pagination: false
				}
			});
			if (response && response.status === 200) {
				const benefits = response.json['hydra:member'];
				this.setState({
					ready: true,
					benefitsHierarchy: benefits && benefits.length ? this.formatBenefits(benefits) : null,
				});
			}
		}

	}

	componentDidMount () {
		this.fetchHierarchyData();
	}

	render() {
		const {benefitsHierarchy, ready} = this.state;
		return <Spin spinning={!ready}>
			<div className="benefits">
				{
					benefitsHierarchy ?
						this.getBenefitsComponents(benefitsHierarchy, 1)
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Vous n\'avez pas encore ajouté de prestation'}</Trans></EditableTransWrapper>
						</div>
				}
			</div>
		</Spin>;
	}
}

export default withI18n()(Benefits);