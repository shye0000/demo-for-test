import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import {Trans, withI18n} from 'lingui-react';
import getFullAddress from '../../utils/getFullAddress';
import './ContactPointInfo.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ContactPointInfo extends React.Component {

	getFullAddress = () => {
		const {dataPoint} = this.props;
		if (dataPoint) {
			return getFullAddress(dataPoint);
		}
		return null;
	}

	getInvoicesDueDateDays = () => {
		const {dataPoint} = this.props;
		if (dataPoint && dataPoint.invoicesDueDateDays) {
			return <div>
				{dataPoint.invoicesDueDateDays + ' '}
				{
					dataPoint.invoicesDueDateDays > 1 ?
						<EditableTransWrapper>
							<Trans>jours</Trans>
						</EditableTransWrapper>
						:
						<EditableTransWrapper>
							<Trans>jour</Trans>
						</EditableTransWrapper>
				}
			</div>;
		}
		return null;
	}

	getInfoByType = () => {
		const {dataPoint} = this.props;
		switch (dataPoint.type) {
			case 1: // BILLING
				return [
					{
						label: <EditableTransWrapper>
							<Trans>Code comptable</Trans>
						</EditableTransWrapper>,
						value: dataPoint.accountabilityCode
					}, {
						label: <EditableTransWrapper>
							<Trans>Adresse</Trans>
						</EditableTransWrapper>,
						value: this.getFullAddress()
					}, {
						label: <EditableTransWrapper>
							<Trans>Taux de TVA</Trans>
						</EditableTransWrapper>,
						value: dataPoint.vatRate ? dataPoint.vatRate.value + '%' : null
					}, {
						label: <EditableTransWrapper>
							<Trans>Factor</Trans>
						</EditableTransWrapper>,
						value: dataPoint.factorCode ? dataPoint.factorCode.company : null
					}, {
						label: <EditableTransWrapper>
							<Trans>Référence pour factures</Trans>
						</EditableTransWrapper>,
						value: dataPoint.reference
					}, {
						label: <EditableTransWrapper>
							<Trans>Echéance des factures</Trans>
						</EditableTransWrapper>,
						value: this.getInvoicesDueDateDays()
					}, {
						label: <EditableTransWrapper>
							<Trans>Commentaire interne</Trans>
						</EditableTransWrapper>,
						value: dataPoint.internalComment
					}
				];
			case 2: // BUYING
				return [
					{
						label: <EditableTransWrapper>
							<Trans>Commentaire interne</Trans>
						</EditableTransWrapper>,
						value: dataPoint.internalComment
					}
				];
			case 3: // SITE_MANAGER
				return [
					{
						label: <EditableTransWrapper>
							<Trans>Services liés</Trans>
						</EditableTransWrapper>,
						value: dataPoint.services ? dataPoint.services.map(service => service.label).join(', ') : null
					}, {
						label: <EditableTransWrapper>
							<Trans>Commentaire interne</Trans>
						</EditableTransWrapper>,
						value: dataPoint.internalComment
					}, {
						label: <EditableTransWrapper>
							<Trans>Commentaire pour techniciens</Trans>
						</EditableTransWrapper>,
						value: dataPoint.technicianComment
					}
				];
			case 4: // PRE_INTERVENTION
				return [
					{
						label: <EditableTransWrapper>
							<Trans>Services  liés</Trans>
						</EditableTransWrapper>,
						value: dataPoint.services ? dataPoint.services.map(service => service.label).join(', ') : null
					}, {
						label: <EditableTransWrapper>
							<Trans>Commentaire interne</Trans>
						</EditableTransWrapper>,
						value: dataPoint.internalComment
					}
				];
		}
	}

	render() {
		const infos = this.getInfoByType();
		const hasInfo = !!infos.find((info) => {
			if (info.value) {
				return info;
			}
		});
		return <div className="contact-point-Info">
			<div className="title">
				<EditableTransWrapper>
					<Trans>Informations complémentaires</Trans>
				</EditableTransWrapper>
			</div>
			{
				hasInfo ?
					<div>
						{
							infos.map((info, idx) => {
								return <Row className="info-item"  key={idx} gutter={15}>
									<Col xs={{ span: 24}} md={{ span: 8}} className="label">{info.label}</Col>
									<Col xs={{ span: 24}} md={{ span: 16}} className="value">{info.value || 'N/A'}</Col>
								</Row>;
							})
						}
					</div>

					:
					<div className="empty-tag">
						<EditableTransWrapper>
							<Trans>Aucune information complémentaire</Trans>
						</EditableTransWrapper>
					</div>
			}
		</div>;
	}
}

export default withI18n()(ContactPointInfo);