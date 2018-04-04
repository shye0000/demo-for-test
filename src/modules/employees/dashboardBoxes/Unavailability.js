import React from 'react';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import Spin from 'antd/lib/spin';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import Actions from '../../../components/actions/Actions';
import apiClient from '../../../apiClient';
import EmployeeUnavailabilityTypes from '../../../apiConstants/EmployeeUnavailabilityTypes';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Unavailability.scss';
import ModifyUnavailabilityModal from '../ModifyUnavailabilityModal';

class Unavailability extends React.Component {

	state = {
		ready: false,
		unavailabilitiesCollection: null
	}

	async fetchUnavailabilities(url) {
		const {employee} = this.props;
		this.setState({ready: false});
		let requestOptions;
		if (!url) {
			url = 'employee_unavailabilities';
			requestOptions = {
				params: {
					['employee']: employee.id,
					['order[startDate]']: 'desc',
					page: 1,
					itemsPerPage: 10
				}
			};
		}
		const unavailabilityResponse = await apiClient.fetch(url, requestOptions).catch(
			() => this.setState({ready: true})
		);
		if (unavailabilityResponse.status === 200) {
			this.setState({
				ready: true,
				unavailabilitiesCollection: unavailabilityResponse.json
			});
		}
	}

	getEmployeeUnavailabilityTypeLabel = (typeValue) => {
		const type = EmployeeUnavailabilityTypes.find((type) => type.value === typeValue);
		if (type) {
			return type.label;
		}
		return null;
	};

	getEmployeeUnavailabilityTypeIcon = (typeValue) => {
		let icon;
		switch (typeValue) {
			case 1:
				icon = <Icon type='schedule' />;
				break;
			case 2:
				icon = <Icon type="star-o" />;
				break;
			case 3:
				icon = <IconSvg type={import('../../../../icons/euro-strike.svg')}/>;
				break;
			case 4:
				icon = <IconSvg type={import('../../../../icons/baby-bottle.svg')}/>;
				break;
			case 5:
				icon = <IconSvg type={import('../../../../icons/baby-bottle.svg')}/>;
				break;
			case 6:
				icon = <IconSvg type={import('../../../../icons/baby-bottle.svg')}/>;
				break;
			case 7:
				icon = <Icon type="medicine-box" />;
				break;
			case 8:
				icon = <Icon type="warning" />;
				break;
			default:
				icon = <Icon type="question" />;
		}
		return React.cloneElement(
			icon,
			{key: typeValue}
		);
	};

	getActions = (unavailability) => {
		const {i18n} = this.props;
		return [{
			id: 'modify',
			title: <EditableTransWrapper><Trans>Modifier</Trans></EditableTransWrapper>,
			icon: <Icon type="edit"/>,
			modal: <ModifyUnavailabilityModal unavailability={unavailability}/>,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					this.fetchUnavailabilities();
				}
			},
			requiredRights: [{uri: unavailability['@id'], action: 'PUT'}]
		}, {
			id: 'delete',
			title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
			icon: <Icon type="delete"/>,
			method: () => {
				Modal.confirm({
					title: i18n.t`Voulez-vous supprimer cette indisponibilité?`,
					className: 'qhs-confirm-modal delete',
					iconType: 'exclamation-circle',
					okText: i18n.t`Supprimer`,
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					width: 450,
					maskClosable: true,
					onOk: () => {
						apiClient.fetch(unavailability['@id'], {method: 'DELETE'}).then(
							null,
							(response) => {
								if (response.response.ok) {
									this.fetchUnavailabilities();
									notification['success']({
										message: i18n.t`L'indisponibilité a été bien supprimée.`,
										className: 'qhs-notification success'
									});
								} else {
									notification['error']({
										message: i18n.t`L'indisponibilité n'a pas été supprimée.`,
										className: 'qhs-notification error'
									});
								}
							}
						);
					}
				});
			},
			requiredRights: [{uri: unavailability['@id'], action: 'DELETE'}]
		}];
	}

	componentDidMount () {
		this.fetchUnavailabilities();
	}

	render() {
		const {unavailabilitiesCollection, ready} = this.state;

		return <div className="unavailability">
			<Spin spinning={!ready} >
				{
					unavailabilitiesCollection && unavailabilitiesCollection['hydra:member'].length ?
						<div>
							{
								unavailabilitiesCollection['hydra:member'].map((unavailability, idx) => {
									return (
										<div key={idx} className="unavailability-item">
											<div className="flag">
												{this.getEmployeeUnavailabilityTypeIcon(unavailability.type)}
											</div>
											<div className="content">
												<div className="name">
													{this.getEmployeeUnavailabilityTypeLabel(unavailability.type)}
												</div>
												<div>
													{(unavailability.halfDays / 2).toLocaleString('fr') + ' '}
													{unavailability.halfDays / 2 > 1 ?
														<EditableTransWrapper><Trans>jours</Trans></EditableTransWrapper>
														:
														<EditableTransWrapper><Trans>jour</Trans></EditableTransWrapper>
													}
												</div>
												<div>
													<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
													{' ' + moment(unavailability.startDate).format('L') + ' '}
													<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
													{' ' + moment(unavailability.endDate).format('L')}
												</div>
											</div>
											<Actions actions={this.getActions(unavailability)}/>
										</div>
									);
								})

							}
							{
								(unavailabilitiesCollection['hydra:totalItems'] > 10) ?
									<div className="pagination">
										<Button
											disabled={!unavailabilitiesCollection['hydra:view']['hydra:previous']}
											onClick={() => this.fetchUnavailabilities(
												unavailabilitiesCollection['hydra:view']['hydra:previous']
											)} icon="left" />
										<Button
											disabled={!unavailabilitiesCollection['hydra:view']['hydra:next']}
											onClick={() => this.fetchUnavailabilities(
												unavailabilitiesCollection['hydra:view']['hydra:next']
											)} icon="right" />
									</div>
									:null
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>Aucune indisponibilité</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;

	}
}

export default withI18n()(Unavailability);