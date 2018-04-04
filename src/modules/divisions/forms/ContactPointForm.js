import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import DataPointTypes from '../../../apiConstants/DataPointTypes';

class ContactPointForm extends React.Component {

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		return(
			<div className="contact-point-form">
				<FormComp onSubmit={this.handleSubmit}>
					<Row gutter={20} type="flex">
						<Col xs={24} md={12}>
							<FormCompItem
								label={<EditableTransWrapper><Trans>Type de point de contact</Trans></EditableTransWrapper>}>
								{getFieldDecorator('type', {
									rules: [{
										required: true,
										message: i18n.t`Veuillez sélectionner le type`,
									}],
								})(
									<Select placeholder={i18n.t`Type de point de contact`} size="large" allowClear={true}>
										{
											DataPointTypes.map((type, idx) => {
												return <Option key={idx} value={type.value}>{type.label}</Option>;
											})
										}
									</Select>
								)}
							</FormCompItem>
						</Col>
					</Row>
					<FormCompItem>
						{getFieldDecorator('subDivision')(
							<Input disabled={true} readOnly={true} style={{display: 'none'}}/>
						)}
					</FormCompItem>
				</FormComp>
			</div>
		);
	}
}

const WrappedFormComp = FormComp.create()(withI18n()(ContactPointForm));

export default WrappedFormComp;