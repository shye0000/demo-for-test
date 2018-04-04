import React from 'react';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import ModifyUnavailabilityModal from '../ModifyUnavailabilityModal';
import Actions from '../../../components/actions/Actions';
import apiClient from '../../../apiClient';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Spin from 'antd/lib/spin';
import Button from 'antd/lib/button';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Unavailability.scss';

class Unavailability extends React.Component{

	state = {
		ready : true,
		unavailabilities : this.props.unavailabilities
	}

	async fetchUnavailabilities(url){
		const {vehicle} = this.props;
		this.setState({ready: false});
		let requestOptions;
		if (!url) {
			url = 'vehicle_unavailabilities';
			requestOptions = {
				params: {
					vehicle: vehicle.id,
					['order[startDate]']: 'desc',
					itemsPerPage: 10,
				}
			};
		}
		const unavailabilityResponse = await apiClient.fetch(url, requestOptions).catch(
			() => this.setState({ready: true})
		);
		if (unavailabilityResponse.status === 200) {
			this.setState({
				ready: true,
				unavailabilities: unavailabilityResponse.json
			});
		}
	}

	componentDidMount() {
		this.fetchUnavailabilities();
	}

	toDiffDurationString = (big, small) => {

		let diffDaysString, diffHoursString, diffMinutesString;
		if (small.isAfter(big)) { [big, small] = [small, big]; }
		let diffDays = big.diff(small, 'days');
		let diffHours = big.diff(small, 'hours') - diffDays * 24;
		let diffMinutes = big.diff(small, 'minutes') - diffDays * 24 * 60 - diffHours * 60;
		if (diffDays) {diffDaysString = diffDays + (diffDays > 1 ? ' jours' : ' jour');}
		if (diffHours) {diffHoursString = diffHours + (diffHours > 1 ? ' heures' : ' heure');}
		if (diffMinutes) {diffMinutesString = diffMinutes + (diffMinutes > 1 ? ' minutes' : ' minute');}
		return [diffDaysString, diffHoursString, diffMinutesString].filter((diff) => diff).join(' ');
	}

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
					title: i18n.t`Voulez-vous supprimer cet indisponibilité?`,
					okText: i18n.t`Supprimer`,
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					maskClosable: true,
					className: 'qhs-confirm-modal delete',
					iconType: 'exclamation-circle',
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
	};

	render(){
		const {unavailabilities, ready} = this.state;

		return <div className="unavailability">
			<Spin spinning={!ready} >
				{
					unavailabilities && unavailabilities['hydra:member'].length ?
						<div>
							{
								unavailabilities['hydra:member'].map((unavailability, idx) => {
									return (
										<div key={idx} className="unavailability-item">
											<div className="content">
												<div className="title">
													<EditableTransWrapper><Trans>Du</Trans></EditableTransWrapper>
													{' ' + moment(unavailability.startDate).format('L') + ' '}
													<EditableTransWrapper><Trans>au</Trans></EditableTransWrapper>
													{' ' + moment(unavailability.endDate).format('L')}
												</div>
												<div>
													{this.toDiffDurationString(moment(unavailability.startDate), moment(unavailability.endDate))}
												</div>
												{
													unavailability.comment ?
														<div className="unavailability-comment">
															<IconSvg className="icon-comment" type={import('../../../../icons/message.svg')}/>
															{unavailability.comment}
														</div> : null
												}
											</div>
											<Actions actions={this.getActions(unavailability)}/>
										</div>
									);
								})
							}
							{
								(unavailabilities['hydra:view']['hydra:next'] || unavailabilities['hydra:view']['hydra:previous'])?
									<div className="pagination">
										<Button
											disabled={!unavailabilities['hydra:view']['hydra:previous']}
											onClick={() => this.fetchUnavailabilities(
												unavailabilities['hydra:view']['hydra:previous']
											)} icon="left" />
										<Button
											disabled={!unavailabilities['hydra:view']['hydra:next']}
											onClick={() => this.fetchUnavailabilities(
												unavailabilities['hydra:view']['hydra:next']
											)} icon="right" />
									</div> : null
							}
						</div>	:  <div className="empty-tag">
							<EditableTransWrapper><Trans>Aucun indisponibilité</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;
	}
}

export default withI18n()(Unavailability);