import React from 'react';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ChooseSite from './benefitSubForms/ChooseSite';
import BenefitInfo from './benefitSubForms/BenefitInfo';
import ConstraintAndOthers from './benefitSubForms/ConstraintAndOthers';
import MultiStepsForm from '../../../components/MultiStepsForm';
import './BenefitForm.scss';

class BenefitForm extends React.Component {

	steps = [{
		id: 'chooseSite',
		title: <EditableTransWrapper><Trans>Choix du site</Trans></EditableTransWrapper>,
		content: ChooseSite,
		data: {
			contract: this.props.contract,
			benefit: this.props.benefit
		}
	}, {
		id: 'benefitInfo',
		title: <EditableTransWrapper><Trans>Infos. prestation</Trans></EditableTransWrapper>,
		content: BenefitInfo,
		data: {
			contract: this.props.contract,
			benefit: this.props.benefit
		}
	}, {
		id: 'others',
		title: <EditableTransWrapper><Trans>Contraintes et autres</Trans></EditableTransWrapper>,
		content: ConstraintAndOthers,
		data: {
			benefit: this.props.benefit,
			contract: this.props.contract
		}
	}];

	render() {
		const {benefit, contract} = this.props;
		const defaultActiveStep = contract.status === 1 ? 'chooseSite' : 'others';
		return <div className="benefit-form">
			<MultiStepsForm
				handleSubmit={this.props.handleSubmit}
				steps={this.steps}
				defaultActiveStep={defaultActiveStep}
				submitButtonText={
					benefit ?
						<EditableTransWrapper><Trans>Modifier prestation</Trans></EditableTransWrapper>
						:
						<EditableTransWrapper><Trans>Ajouter prestation</Trans></EditableTransWrapper>
				}
			/>
		</div>;
	}
}


export default withI18n()(BenefitForm);