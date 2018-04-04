import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Spin from 'antd/lib/spin';
import FormComp from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../../apiClient';

class SiteManagerFormBody extends React.Component {

	state = {
		ready: false,
		dataPoint: null,
		services: null,
	}

	async fetchOptions() {
		this.setState({ready: false});
		const {form, dataPoint} = this.props;
		const dataPointResponse = await apiClient.fetch(dataPoint['@id']);
		const servicesResponse = await apiClient.fetch('/services', {
			params: {
				pagination:false,
				operational: true
			}
		});
		if (dataPointResponse.status === 200 && servicesResponse.status ===200) {
			this.setState({
				ready: true,
				dataPoint: dataPointResponse.json,
				services: servicesResponse.json['hydra:member']
			}, () => {
				const {dataPoint} = this.state;
				form.setFieldsValue({
					services:                dataPoint.services ? dataPoint.services.map(service => service['@id']) : undefined,
					technicianComment:       dataPoint.technicianComment,
					internalComment:         dataPoint.internalComment
				});
			});
		}
	}

	componentDidMount() {
		this.fetchOptions();
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { services, ready } = this.state;

		return <div className="contact-point-form">
			{
				ready ?
					<FormComp onSubmit={this.handleSubmit}>
						<Row gutter={20} type="flex">
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Services liés</Trans></EditableTransWrapper>}>
									{getFieldDecorator('services')(
										<Select
											allowClear={true} placeholder={i18n.t`Services liés`}
											mode="multiple" size="large">
											{
												services.map((service, idx) => {
													return <Option key={idx} value={service['@id']}>{service.label}</Option>;
												})
											}
										</Select>
									)}
								</FormCompItem>
							</Col>
							<Col md={24}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
									{getFieldDecorator('internalComment')(
										<Input.TextArea placeholder={i18n.t`Commentaire interne`} style={{width: '100%'}}/>
									)}
								</FormCompItem>
							</Col>
							<Col md={24}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Commentaire pour techniciens</Trans></EditableTransWrapper>}>
									{getFieldDecorator('technicianComment')(
										<Input.TextArea placeholder={i18n.t`Commentaire pour techniciens`} style={{width: '100%'}}/>
									)}
								</FormCompItem>
							</Col>
						</Row>
					</FormComp> : <Spin className="centered-spin" />
			}
		</div>;
	}
}

export default withI18n()(SiteManagerFormBody);