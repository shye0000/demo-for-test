import React from 'react';
import moment from 'moment';
import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Spin from 'antd/lib/spin';
import Actions from '../actions/Actions';
import apiClient from '../../apiClient';
import getDocMineTypeIcon from './getDocMineTypeIcon';
import {Trans, withI18n} from 'lingui-react';
import './Documents.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class Documents extends React.Component {

	state = {
		ready: false,
		documents: null
	}

	async fetchDocuments() {
		const {entity, uri, param} = this.props;
		this.setState({ready: false});
		const documentsResponse = await apiClient.fetch(uri, {
			params: {
				[param]: entity.id,
				pagination: false
			}
		}).catch(
			() => this.setState({ready: true})
		);
		if (documentsResponse.status === 200) {
			this.setState({
				ready: true,
				documents: documentsResponse.json
			});
		}
	}


	componentDidMount () {
		this.fetchDocuments();
	}

	getDocumentSubTitle = (document) => {
		return <div>
			<EditableTransWrapper><Trans>Ajouté le</Trans></EditableTransWrapper>
			{' ' + moment(document.document.createdAt).format('L') + ' '}
			<EditableTransWrapper><Trans>par</Trans></EditableTransWrapper>
			{' '}
			{
				document.document.generatedBy ?
					document.document.generatedBy
					:
					<EditableTransWrapper><Trans>le système</Trans></EditableTransWrapper>
			}
		</div>;
	}

	removeDocument = (document) => {
		const {documents} = this.state;
		this.setState({
			documents: documents.filter((item) => {
				return item.id !== document.id;
			})
		});
	}

	getActions = (document) => {
		const {i18n} = this.props;
		return [{
			id: 'delete',
			title: <EditableTransWrapper><Trans>Supprimer</Trans></EditableTransWrapper>,
			icon: <Icon type="delete"/>,
			unfolded: true,
			method: () => {
				Modal.confirm({
					title: i18n.t`Voulez-vous supprimer cette pièce jointe?`,
					content: <p>
						<a href={`${AppConfig.apiEntryPoint}${document.document.content_uri}`} download className="name">
							{document.title  + ' (' + document.document.publicFilename + ') '}
						</a>
						{i18n.t`sera définitivement supprimé des pièces jointes.`}
					</p>,
					className: 'delete qhs-confirm-modal',
					iconType: 'exclamation-circle',
					okText: i18n.t`Supprimer`,
					okType: 'danger',
					width: 450,
					cancelText: i18n.t`Annuler`,
					maskClosable: true,
					store: this.context.store,
					onOk: () => {
						apiClient.fetch(document['@id'], {method: 'DELETE'}).then(
							null,
							(response) => {
								if (response.response.ok) {
									this.fetchDocuments();
									notification['success']({
										message: i18n.t`La pièce jointe a bien été supprimée.`,
										className: 'qhs-notification success'
									});
								} else {
									notification['error']({
										message: i18n.t`La pièce jointe n'a pas été supprimée.`,
										className: 'qhs-notification error'
									});
								}
							}
						);
					}
				});
			},
			requiredRights: [{uri: document['@id'], action: 'DELETE'}]
		}];
	}

	render() {
		const {documents, ready} = this.state;


		return <div className="documents">
			<Spin spinning={!ready} >
				{
					documents && documents['hydra:member'].length ?
						documents['hydra:member'].map((document, idx) => {
							return <div key={idx} className="document-item">
								<div className="flag">{getDocMineTypeIcon(document.document)}</div>
								<div className="document">
									<a
										href={`${AppConfig.apiEntryPoint}${document.document.content_uri}`}
										download className="name">
										{document.title}
									</a>
									<div className="sub-title">
										{this.getDocumentSubTitle(document)}
									</div>
								</div>
								<div className="document-actions">
									<Actions actions={this.getActions(document)}/>
								</div>
							</div>;
						})
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>Aucune pièce jointe</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;
	}
}

export default withI18n()(Documents);