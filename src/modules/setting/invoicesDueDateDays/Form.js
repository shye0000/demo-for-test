import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import InputNumber from 'antd/lib/input-number';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';

class Form extends React.Component {

	state = {
		ready: false,
		invoicesDueDateDays: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {invoicesDueDateDays} = this.state;

		if (invoicesDueDateDays) {
			form.setFieldsValue({
				value: invoicesDueDateDays.value
			});
		}
	}

	async fetch() {
		const {invoicesDueDateDays} = this.props;
		this.setState({ready: false});

		let invoicesDueDateDaysResponse = null;
		if (invoicesDueDateDays) {
			invoicesDueDateDaysResponse = await apiClient.fetch(invoicesDueDateDays['@id']);
		}

		if (!invoicesDueDateDaysResponse || invoicesDueDateDaysResponse.status === 200) {
			this.setState({
				ready: true,
				invoicesDueDateDays: invoicesDueDateDaysResponse ? invoicesDueDateDaysResponse.json : null
			}, () => {
				this.setDefaultValues();
			});
		}
	}

	componentDidMount() {
		this.fetch();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { ready } = this.state;
		const { i18n } = this.props;

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					<Col xs={24} md={12}>
						<FormCompItem label={
							<EditableTransWrapper><Trans>Valeur</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('value', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner la valeur`,
								}],
							})(
								<InputNumber placeholder="Valeur" size="large" />
							)}
						</FormCompItem>
					</Col>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(Form);
