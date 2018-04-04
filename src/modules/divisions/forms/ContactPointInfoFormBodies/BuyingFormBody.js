import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../../apiClient';

class BuyingFormBody extends React.Component {

	state = {
		ready: false,
		dataPoint: null,
	}

	async fetchDataPoint() {
		this.setState({ready: false});
		const {form, dataPoint} = this.props;
		const dataPointResponse = await apiClient.fetch(dataPoint['@id']);

		if (dataPointResponse.status === 200) {
			this.setState({
				ready: true,
				dataPoint: dataPointResponse.json,
			}, () => {
				const {dataPoint} = this.state;
				form.setFieldsValue({
					internalComment: dataPoint.internalComment
				});
			});
		}
	}

	componentDidMount() {
		this.fetchDataPoint();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { ready } = this.state;

		return <div className="contact-point-form">
			{
				ready ?
					<FormComp onSubmit={this.handleSubmit}>
						<Row gutter={20} type="flex">
							<Col md={24}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
									{getFieldDecorator('internalComment')(
										<Input.TextArea placeholder={i18n.t`Commentaire interne`} style={{width: '100%'}}/>
									)}
								</FormCompItem>
							</Col>
						</Row>
					</FormComp> : <Spin className="centered-spin" />
			}
		</div>;
	}
}

export default withI18n()(BuyingFormBody);