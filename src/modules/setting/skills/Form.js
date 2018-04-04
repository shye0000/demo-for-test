import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';

class Form extends React.Component {

	state = {
		ready: false
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {skill} = this.state;

		if (skill) {
			form.setFieldsValue({
				label: skill.label
			});
		}
	}

	async fetch() {
		const {skill} = this.props;
		this.setState({ready: false});

		let skillResponse = null;
		if (skill) {
			skillResponse = await apiClient.fetch(skill['@id']);
		}

		if (!skillResponse || skillResponse.status === 200) {
			this.setState({
				ready: true,
				skill: skillResponse ? skillResponse.json : null
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
							<EditableTransWrapper><Trans>Label</Trans></EditableTransWrapper>
						}>
							{getFieldDecorator('label', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner le label`,
								}],
							})(
								<Input placeholder="Label" size="large" />
							)}
						</FormCompItem>
					</Col>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(Form);
