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

class ProductInfo extends React.Component {

	state = {
		ready: false,
		productTypes: null,
		priceTaxExcl: null,
		quantity: null,
		fieldsDisabled: false,
	}

	async fetchProductTypes() {
		const response  = await apiClient.fetch('/product_types', {
			params: {
				pagination: false,
				'order[name]': 'ASC'
			}
		});
		if (response.status === 200) {
			this.setState({
				ready: true,
				productTypes: response.json['hydra:member']
			});
		}
	}

	getServiceByProductTypeId = (productTypeId) => {
		let service, productType;
		const {productTypes} = this.state;
		if (productTypes) {
			productType = productTypes.find((type) => productTypeId === type['@id']);
		}
		if (productType) {
			service = productType.service['@id'];
		}
		return service;
	}

	getProductTypeByNameAndService = (name, serviceId) => {
		let productType;
		const {productTypes} = this.state;
		if (productTypes) {
			productType = productTypes.find((type) => type.name === name && type.service['@id'] === serviceId);
		}
		return productType;
	}

	handleProductTypeOnChange = (productType) => {
		const {form} = this.props;
		form.setFieldsValue({
			productType: productType ? productType.label : undefined,
			service: productType ? this.getServiceByProductTypeId(productType.key) : undefined
		});
	}

	handlePriceChange = (priceTaxExcl) => {
		if(!isNaN(priceTaxExcl)){
			this.setState({priceTaxExcl});
			return;
		}
		this.setState({priceTaxExcl: null});
	}

	handleQuantityChange = (quantity) => {
		this.setState({quantity});
	}

	getTotalPrice = () => {
		const {priceTaxExcl, quantity} = this.state;
		if (priceTaxExcl && quantity) {
			return priceTaxExcl * quantity;
		}
		return null;
	}

	async componentDidMount () {
		const {form, product, contract} = this.props;
		this.setState({ready: false});
		await this.fetchProductTypes();
		if (product) {
			let productTypeFakeValue = undefined;
			const  {title, description, priceTaxExcl, quantity, productType, publicComment, service} = product;
			const productTypeEntity = this.getProductTypeByNameAndService(productType, service['@id']);
			if (productTypeEntity) {
				productTypeFakeValue = {
					label: productType,
					key: productTypeEntity['@id']
				};
			}
			await this.setState({
				priceTaxExcl, quantity,
				fieldsDisabled: contract.status !== 1,
			});
			form.setFieldsValue({
				productTypeFake: productTypeFakeValue,
				service: service['@id'],
				productType,
				title,
				description,
				publicComment,
				priceTaxExcl,
				quantity
			});
		}
	}

	render() {
		const {ready, productTypes, fieldsDisabled} = this.state;
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
							label={<EditableTransWrapper><Trans>Type de produit</Trans></EditableTransWrapper>}>
							{getFieldDecorator('productTypeFake', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez sélectionner un type`,
								}],
							})(
								<Select
									allowClear={true} placeholder={i18n.t`Type de produit`}
									size="large" filterOption={false} disabled={fieldsDisabled}
									onChange={this.handleProductTypeOnChange} labelInValue >
									{
										productTypes ? productTypes.map((type) => {
											return <Option key={type['@id']}>{type.name}</Option>;
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
									size="large" disabled={fieldsDisabled}
									placeholder="Commentaire public" autosize={{ minRows: 2, maxRows: 3 }} />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={8}>
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
					<Col xs={24} md={8}>
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
					<Col xs={24} md={8}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Prix HT total</Trans></EditableTransWrapper>}>
							<InputNumber
								size="large" style={{width: '100%'}} className="price-total" disabled={true}
								precision={2} min={0} formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
								placeholder="Prix HT total" value={totalPrice} />
						</FormCompItem>
					</Col>
				</Row>
				<FormCompItem style={{display: 'none'}}>
					{getFieldDecorator('productType')(
						<Input disabled={true} readOnly={true}/>
					)}
				</FormCompItem>
				<FormCompItem style={{display: 'none'}}>
					{getFieldDecorator('service')(
						<Input disabled={true} readOnly={true}/>
					)}
				</FormCompItem>
			</div> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(ProductInfo);