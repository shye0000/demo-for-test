import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Checkbox from 'antd/lib/checkbox';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import TimeConstraintsField from './TimeConstraintsField';
import './ConstraintAndOthers.scss';

class ConstraintAndOthers extends React.Component {

	state = {
		defaultTimeConstraints: [],
		modifyNotNewAmendmentModification: false
	}

	setStatesAndFieldsDefaultValues = () => {
		const {form, contract, benefit} = this.props;
		let defaultValues, newStates;
		if (contract.nature === 3) { // when is quotation
			defaultValues = {
				otherConstraints: benefit.otherConstraints,
			};
			newStates = {
				defaultTimeConstraints:              benefit.benefitTimeConstraints,
				modifyNotNewAmendmentModification:   false
			};
		} else { // when is contract or additional clause
			const {modification} = benefit;
			defaultValues = {
				otherConstraints:               benefit.otherConstraints,
				emailPreInterventionActivated:  benefit.emailPreInterventionActivated,
			};
			newStates = {
				defaultTimeConstraints:             benefit.benefitTimeConstraints,
				modifyNotNewAmendmentModification:  modification ? !modification.isNewBenefit : false
			};
		}
		form.setFieldsValue(defaultValues);
		this.setState(newStates);

	}

	componentDidMount() {
		const {benefit} = this.props;
		if (benefit) { // when modification
			this.setStatesAndFieldsDefaultValues();
		}
	}

	render() {
		const FormCompItem = Form.Item;
		const { TextArea } = Input;
		const {i18n, form, contract} = this.props;
		const {defaultTimeConstraints, modifyNotNewAmendmentModification} = this.state;
		const { getFieldDecorator } = form;
		return <div className="constraint-and-others">
			<Row gutter={20}>
				<Col xs={24} md={24}>
					<TimeConstraintsField
						disabled={modifyNotNewAmendmentModification}
						defaultTimeConstraints={defaultTimeConstraints}
						form={form} fieldName="benefitTimeConstraints"/>
				</Col>
				<Col xs={24} md={24}>
					<FormCompItem
						label={<EditableTransWrapper><Trans>Contrainte autre</Trans></EditableTransWrapper>}>
						{getFieldDecorator('otherConstraints')(
							<TextArea
								size="large" placeholder={i18n.t`Contrainte autre`}
								autosize={{ minRows: 2, maxRows: 5 }}
								disabled={modifyNotNewAmendmentModification} />
						)}
					</FormCompItem>
				</Col>
				{ contract.nature !== 3 ?
					<Col xs={24} md={24}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>E-mails pré-intervention</Trans></EditableTransWrapper>}>
							{getFieldDecorator('emailPreInterventionActivated',{
								valuePropName: 'checked'
							})(
								<Checkbox disabled={modifyNotNewAmendmentModification} >
									<EditableTransWrapper>
										<Trans>Envoyer des e-mails pré-intervention</Trans>
									</EditableTransWrapper>
								</Checkbox>
							)}
						</FormCompItem>
					</Col> : null }
			</Row>
		</div>;
	}
}


export default withI18n()(ConstraintAndOthers);