import React from 'react';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Row from 'antd/lib/row';
import Action from '../../../components/actions/Action';
import Col from 'antd/lib/col';
import {Trans, withI18n} from 'lingui-react';
import SelectBuyingDataPointModal from '../modals/SelectBuyingDataPointModal';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './SetStatusSendToClientForm.scss';
import classNames from 'classnames';
import moment from 'moment/moment';

class SetStatusSendToClientForm extends React.Component {

	state = {
		contract: this.props.contract
	}

	getFirstContactWithEmailFromBuyingDataPoint = (buyingDataPoint) => {
		let contact;
		if (buyingDataPoint && buyingDataPoint.dataPointContacts.length) {
			contact = buyingDataPoint.dataPointContacts.find(dataPointContact => dataPointContact.contact.email);
		}
		return contact;
	}

	componentDidMount() {
		const {contract} = this.state;
		if (contract.buyingDataPoint) {
			this.props.form.setFieldsValue({
				buyingDataPointFakeField: contract.buyingDataPoint['@id']
			});
		}

	}

	render() {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { contract } = this.state;
		const dataPointContact = this.getFirstContactWithEmailFromBuyingDataPoint(contract.buyingDataPoint);
		let contact, willBeSentTitle, buyingDataPointNotConfiguredTitle;
		if (dataPointContact) {
			contact = dataPointContact.contact;
		}

		switch (contract.nature) {
			case 1:
				willBeSentTitle = <Trans>{'L\'avenant va être envoyé au contact Achat configuré pour cet avenant:'}</Trans>;
				buyingDataPointNotConfiguredTitle = <Trans>{'Le point de contact achat n\'est pas encore configuré, veuillez en sélectionner un pour cet avenant.'}</Trans>;
				break;
			case 2:
				willBeSentTitle = <Trans>{'Le contrat va être envoyé au contact Achat configuré pour ce contrat:'}</Trans>;
				buyingDataPointNotConfiguredTitle = <Trans>{'Le point de contact achat n\'est pas encore configuré, veuillez en sélectionner un pour ce contrat.'}</Trans>;
				break;
			case 3:
				willBeSentTitle = <Trans>{'Le devis va être envoyé au contact Achat configuré pour ce devis:'}</Trans>;
				buyingDataPointNotConfiguredTitle = <Trans>{'Le point de contact achat n\'est pas encore configuré, veuillez en sélectionner un pour ce devis.'}</Trans>;
				break;
		}

		return <FormComp className="set-status-send-to-client-form" onSubmit={this.handleSubmit}>
			<div className="form-section">
				{
					contract.buyingDataPoint ?
						<div>
							<div className="title">
								<EditableTransWrapper>{willBeSentTitle}</EditableTransWrapper>
							</div>
							<div className={classNames('data-point-contact', {
								'contact-out': contact.dateOut && moment(contact.dateOut).valueOf() <= moment().valueOf()
							})}>
								<div className="photo" style={{
									backgroundImage: contact.photo ?
										`url(${AppConfig.apiEntryPoint}${contact.photo.content_uri})` : null
								}}>
									{
										!contact.photo ?
											`${contact.firstName[0]}${contact.lastName[0]}` : null
									}
								</div>
								<div className="body">
									<div className="name">
										{`${contact.firstName} ${contact.lastName}`}
									</div>
									<div className="email">
										{contact.email}
									</div>
								</div>
							</div>
						</div>
						:
						<div>
							<div className="title">
								<EditableTransWrapper>{buyingDataPointNotConfiguredTitle}</EditableTransWrapper>
							</div>
							<Action renderAsButtonWithTitle={true} action={{
								id: 'selectBuyingDataPoint',
								title: <EditableTransWrapper><Trans>{'Sélectionner un point de contact achat'}</Trans></EditableTransWrapper>,
								disabled: contract.buyingDataPoint,
								modal: <SelectBuyingDataPointModal mask={false} width={750} contract={contract} />,
								modalCloseCallback: (refresh, data) => {
									if (refresh) {
										const contract = data.json;
										this.setState({contract});
										this.props.form.setFieldsValue({
											buyingDataPointFakeField: contract.buyingDataPoint['@id']
										});
									}
								},
								requiredRights: [{uri: contract['@id'], action: 'PUT'}]
							}}/>
						</div>
				}
				<Row gutter={20} type="flex" align="top">
					<FormCompItem>
						{getFieldDecorator('buyingDataPointFakeField', {
							rules: [{
								required: true,
								message: i18n.t`Veuillez sélectionner un point de contact`
							}]
						})(
							<Input style={{display: 'none'}} disabled={true} readOnly={true} />
						)}
					</FormCompItem>
					<Col xs={24} md={24}>
						<FormCompItem>
							{getFieldDecorator('errorFakeField')(
								<Input style={{display: 'none'}} disabled={true} readOnly={true} />
							)}
						</FormCompItem>
					</Col>
				</Row>
			</div>
		</FormComp>;
	}
}

export default withI18n()(SetStatusSendToClientForm);