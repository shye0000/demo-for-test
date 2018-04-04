import React from 'react';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Icon from 'antd/lib/icon';
import Select from 'antd/lib/select';
import {Trans, withI18n} from 'lingui-react';
import ContractRefusedReasons from '../../../apiConstants/ContractRefusedReasons';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import DatePicker from 'antd/lib/date-picker';
import './SetStatusForm.scss';

class SetStatusForm extends React.Component {

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n, config } = this.props;
		return <FormComp onSubmit={this.handleSubmit} className="set-status-form">
			{
				config.actionDescription ?
					<div className="action-descorption-wrapper">
						<Icon type="info-circle-o" />
						{config.actionDescription}
					</div> : null
			}
			<div className="form-section">
				<Row gutter={20} type="flex" align="top">
					{
						config.targetStatus === 3 ?
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Raison</Trans></EditableTransWrapper>}>
									{getFieldDecorator('rejectionReason', {
										rules: [{
											required: true,
											message: i18n.t`Veuillez renseigner une raison`,
										}],
									})(
										<Select allowClear={true} placeholder={i18n.t`Raison`} size="large">
											{
												ContractRefusedReasons.map((reason, idx) => {
													return <Option key={idx} value={reason.value}>
														<EditableTransWrapper><Trans id={reason.label}/></EditableTransWrapper>
													</Option>;
												})
											}
										</Select>
									)}
								</FormCompItem>
							</Col> : null
					}
					{
						config.targetStatus === 8 ?
							<Col xs={24} md={12}>
								<FormCompItem label={<EditableTransWrapper><Trans>Date de clôture</Trans></EditableTransWrapper>}>
									{getFieldDecorator('closedAt', {
										rules: [{
											required: true,
											message: i18n.t`Veuillez renseigner la date de clôture du contrat`,
										}],
									})(
										<DatePicker
											format="DD/MM/YYYY"
											placeholder={i18n.t`JJ/MM/AAAA`}
											size="large"
											style={{width: '100%'}}/>
									)}
								</FormCompItem>
							</Col> : null
					}
					<Col xs={24} md={24}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Commentaire interne</Trans></EditableTransWrapper>}>
							{getFieldDecorator('comment')(
								<Input.TextArea placeholder={i18n.t`Commentaire interne`} />
							)}
						</FormCompItem>
					</Col>
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

export default withI18n()(SetStatusForm);