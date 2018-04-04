import React from 'react';
import FormComp from 'antd/lib/form';
import InputNumber from 'antd/lib/input-number';
import Spin from 'antd/lib/spin';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class ModifyCommercialDiscountForm extends React.Component {

	state = {
		ready: false,
		contract: null
	}

	async fetchContract() {
		let contract;
		this.setState({ready: false});
		const response = await apiClient.fetch(this.props.contract['@id']).catch(() => this.setState({ready: true}));
		if (response && response.status === 200) {
			contract = response.json;
			this.setState({
				ready: true,
				contract,
			}, () => {
				const {contract} = this.state;
				const {form} = this.props;
				form.setFieldsValue({
					commercialDiscount: contract.commercialDiscount
				});
			});
		}
	}

	componentDidMount() {
		this.fetchContract();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { ready, contract } = this.state;
		return (
			ready ?
				<div>
					<FormComp onSubmit={this.handleSubmit}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Remise commerciale</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('commercialDiscount')(
								<InputNumber
									placeholder={i18n.t`Remise commerciale`}
									min={0}
									max={contract.totalPriceWithoutDiscount}
									style={{width: '50%'}}
									formatter={value => `${value}€`}
									parser={value => value.replace('€', '')}
								/>
							)}
						</FormCompItem>
					</FormComp>
				</div>
				:
				<Spin className="centered-spin" />
		);
	}
}


export default withI18n()(ModifyCommercialDiscountForm);