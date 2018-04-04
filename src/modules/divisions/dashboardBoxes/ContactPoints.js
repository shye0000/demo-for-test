import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Collapse from 'antd/lib/collapse';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import DataPointTypes from '../../../apiConstants/DataPointTypes';
import ContactPointContacts from './ContactPointContacts';
import ContactPointInfo from './ContactPointInfo';
import AddContactPointContactModal from '../modals/AddContactPointContactModal';
import ModifyContactPointInfoModal from '../modals/ModifyContactPointInfoModal';
import Actions from '../../../components/actions/Actions';
import './ContactPoints.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';

class ContactPoints extends React.Component {

	constructor(props) {
		super(props);
		this.fetchContactPoints = this.fetchContactPoints.bind(this);
	}

	state = {
		ready: false,
		dataPoints: [],
		openedContactPoint: this.props.openedContactPoint
	}

	componentWillReceiveProps(nextProps) {
		if (this.state.openedContactPoint !== nextProps.openedContactPoint) {
			this.setState({openedContactPoint: nextProps.openedContactPoint});
		}

	}

	getDataPointsFromApiResponse = (dataPointsResponse) => {
		const {param} = this.props;
		return param === 'division' ?
			dataPointsResponse.json['hydra:member'].filter((dataPoint) => {
				if (!dataPoint.subDivision) {
					return dataPoint;
				}
			})
			:
			dataPointsResponse.json['hydra:member'];
	}

	async fetchContactPoints() {
		const {entity, param} = this.props;
		this.setState({
			ready: false,
		});
		const dataPointsResponse = await apiClient.fetch('/data_points', {
			params: {
				[param]: entity.id,
				pagination: false
			}
		}).catch(
			() => this.setState({ready: true})
		);
		if (dataPointsResponse.status === 200) {
			this.setState({
				ready: true,
				dataPoints : this.getDataPointsFromApiResponse(dataPointsResponse)
			});
		}
	}

	componentDidMount () {
		this.fetchContactPoints();
	}

	sortedDataPoints = (dataPoints) => {
		if(dataPoints){
			let typeOne = [], typeTwo = [], typeThree = [], typeFour = [];
			dataPoints.map((dataPoint) => {
				switch (dataPoint.type) {
					case 1:
						typeOne.push(dataPoint);
						break;
					case 2:
						typeTwo.push(dataPoint);
						break;
					case 3:
						typeThree.push(dataPoint);
						break;
					case 4:
						typeFour.push(dataPoint);
						break;
				}
			});
			return [ ...typeTwo, ...typeOne, ...typeFour, ...typeThree];
		}else
			return [];
	}
	getActions = (dataPoint) => {
		const {division, i18n} = this.props;
		return [{
			id: 'addContact',
			icon: <Icon type="plus-circle-o" />,
			title: <EditableTransWrapper><Trans>Ajouter un salarié</Trans></EditableTransWrapper>,
			modal: <AddContactPointContactModal maskClosable={false} dataPoint={dataPoint} division={division}/>,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					this.fetchContactPoints();
				}
			},
			requiredRights: [
				{uri: '/contacts', action: 'GET'},
				{uri: dataPoint['@id'], action: 'PUT'}
			]
		}, {
			id: 'fullFillInfo',
			icon: <Icon type="edit" />,
			title: <EditableTransWrapper><Trans>Remplir les informations complémentaires</Trans></EditableTransWrapper>,
			modal: <ModifyContactPointInfoModal width={750} dataPoint={dataPoint} />,
			modalCloseCallback: (refresh) => {
				if (refresh) {
					this.fetchContactPoints();
				}
			},
			requiredRights: [{uri: dataPoint['@id'], action: 'PUT'}]
		}, {
			id: 'delete',
			title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
			icon: <Icon type="delete"/>,
			method: () => {
				Modal.confirm({
					title: i18n.t`Voulez-vous supprimer ce point de contact?`,
					className: 'qhs-confirm-modal delete',
					iconType: 'exclamation-circle',
					okText: i18n.t`Supprimer`,
					okType: 'danger',
					cancelText: i18n.t`Annuler`,
					maskClosable: true,
					width: 450,
					onOk: () => {
						apiClient.fetch(dataPoint['@id'], {method: 'DELETE'}).then(
							null,
							(response) => {
								if (response.response.ok) {
									this.fetchContactPoints();
									notification['success']({
										message: i18n.t`Le point de contact a bien été supprimé`,
										className: 'qhs-notification success'
									});
								} else {
									notification['error']({
										message: i18n.t`Le point de contact n'a pas été supprimé`,
										className: 'qhs-notification error'
									});
								}
							}
						);
					}
				});
			},
			requiredRights: [{uri: dataPoint['@id'], action: 'DELETE'}]
		}];

	}

	getContactPointPanelHeader = (dataPoint) => {
		return <div className="header-title">
			<EditableTransWrapper>
				<Trans id={DataPointTypes.filter(type => {
					return type.value === dataPoint.type;
				})[0].label} />
			</EditableTransWrapper>
			<div onClick={ev=> ev.stopPropagation()} className="contact-point-actions">
				<Actions  actions={this.getActions(dataPoint)}/>
			</div>
		</div>;
	}

	render() {
		const {ready, dataPoints, openedContactPoint} = this.state;
		const sortedDataPoints = this.sortedDataPoints(dataPoints);
		return <div className="contact-points">
			<Spin spinning={!ready} >
				{
					dataPoints && dataPoints.length ?
						<div>
							{
								sortedDataPoints.map((dataPoint, idx) => {
									const key = dataPoint['@id'];
									return <div key={idx} className="contact-point-item">
										<Collapse bordered={false} defaultActiveKey={[openedContactPoint === key ? key : null]}>
											<Collapse.Panel forceRender={true} key={key} className="contact-point-panel" header={
												this.getContactPointPanelHeader(dataPoint)
											}>
												<ContactPointContacts callback={() => this.fetchContactPoints()} dataPoint={dataPoint} dataPointContacts={dataPoint.dataPointContacts}/>
												<ContactPointInfo dataPoint={dataPoint}/>
											</Collapse.Panel>
										</Collapse>
									</div>;
								})
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper>
								<Trans>{'Vous n\'avez pas encore ajouté de point de contact'}</Trans>
							</EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;
	}
}

export default withI18n()(ContactPoints);