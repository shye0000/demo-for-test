import React from 'react';
import Spin from 'antd/lib/spin';
import FormComp from 'antd/lib/form';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../../apiClient';
import getBenefitInfoWithModification from '../../utils/getBenefitInfoWithModification';
import './BenefitInfo.scss';

class BenefitInfo extends React.Component {

	state = {
		ready: false,
		benefitTypes: null,
		price: null,
		quantity: null,
		numberOperations: null,
		fieldsDisabled: false,
		modifyNotNewAmendmentModification: false
	}

	async fetchBenefitTypes() {
		const response  = await apiClient.fetch('/benefit_types', {
			params: {
				pagination: false,
				isAdministrable: true
			}
		});
		if (response.status === 200) {
			this.setState({
				ready: true,
				benefitTypes: response.json['hydra:member']
			});
		}
	}

	handlePriceChange = (price) => {
		if(!isNaN(price)){
			this.setState({price});
			return;
		}
		this.setState({price: null});
	}

	handleQuantityChange = (quantity) => {
		this.setState({quantity});
	}

	handleNumberOperationsChange = (numberOperations) => {
		this.setState({numberOperations});
	}

	getTotalPrice = () => {
		const {price, quantity, numberOperations} = this.state;
		if (price && quantity && numberOperations) {
			return price * quantity * numberOperations;
		}
		return null;
	}

	async componentDidMount () {
		const {form, benefit, contract} = this.props;
		this.setState({ready: false});
		await this.fetchBenefitTypes();
		if (benefit) {
			const {modification} = benefit;
			const  {title, description, priceTaxExcl, quantity, numberOperations} = getBenefitInfoWithModification(benefit, modification);
			const price = priceTaxExcl;
			await this.setState({
				price, quantity, numberOperations,
				fieldsDisabled:    contract.status !== 1,
				modifyNotNewAmendmentModification: modification ? !modification.isNewBenefit : false
			});

			form.setFieldsValue({
				benefitType:       benefit.benefitType ? benefit.benefitType['@id'] : undefined,
				title:             title,
				description:       description,
				publicComment:     benefit.publicComment,
				priceTaxExcl:      price,
				quantity:          quantity,
				numberOperations:  numberOperations,
			});
		}
	}

	render() {
		const {ready, benefitTypes, fieldsDisabled, modifyNotNewAmendmentModification} = this.state;
		const FormCompItem = FormComp.Item;
		const {i18n} = this.props;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { TextArea } = Input;

		const totalPrice = this.getTotalPrice();

		return (
			ready ? <div className="benefit-info">
				<Row gutter={20}>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Type de prestation</Trans></EditableTransWrapper>}>
							{getFieldDecorator('benefitType', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez sélectionner un type`,
								}],
							})(
								<Select
									allowClear={true} placeholder={i18n.t`Type de prestation`}
									size="large" filterOption={false} disabled={fieldsDisabled || modifyNotNewAmendmentModification} >
									{
										benefitTypes? benefitTypes.map((type, idx) => {
											return <Option key={idx} value={type['@id']}>
												{type.internalTitle || type.publicTitle}
											</Option>;
										}) : null
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Titre optionnel</Trans></EditableTransWrapper>}>
							{getFieldDecorator('title')(
								<Input size="large" placeholder={i18n.t`Titre optionnel`} disabled={fieldsDisabled} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={24}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Descriptif</Trans></EditableTransWrapper>}>
							{getFieldDecorator('description')(
								<TextArea
									size="large" disabled={fieldsDisabled}
									placeholder="Descriptif" autosize={{ minRows: 3, maxRows: 6 }} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={24}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Commentaire public</Trans></EditableTransWrapper>}>
							{getFieldDecorator('publicComment')(
								<TextArea
									size="large" disabled={fieldsDisabled || modifyNotNewAmendmentModification}
									placeholder="Commentaire public" autosize={{ minRows: 2, maxRows: 3 }} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={6}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Prix UHT</Trans></EditableTransWrapper>}>
							{getFieldDecorator('priceTaxExcl', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez renseigner ce champ`,
								}],
							})(
								<InputNumber
									precision={2} size="large" style={{width: '100%'}} placeholder="Prix HT"
									min={0} formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
									parser={value => value.replace(/€\s?|( *)/g, '')}
									onChange={this.handlePriceChange} disabled={fieldsDisabled}
								/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={6}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Quantité</Trans></EditableTransWrapper>}>
							{getFieldDecorator('quantity', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez renseigner ce champ`,
								}],
							})(
								<InputNumber
									size="large" min={0} style={{width: '100%'}} disabled={fieldsDisabled}
									placeholder="Quantité" onChange={this.handleQuantityChange}/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={6}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Occurences</Trans></EditableTransWrapper>}>
							{getFieldDecorator('numberOperations', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez renseigner ce champ`,
								}],
							})(
								<InputNumber
									size="large" min={0} style={{width: '100%'}} disabled={fieldsDisabled}
									placeholder="Occurences" onChange={this.handleNumberOperationsChange}/>
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={6}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Prix HT total</Trans></EditableTransWrapper>}>
							<InputNumber
								size="large" style={{width: '100%'}} className="price-total" disabled={true}
								precision={2} min={0} formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
								placeholder="Prix HT total" value={totalPrice} />
						</FormCompItem>
					</Col>
				</Row>
			</div> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(BenefitInfo);