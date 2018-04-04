import React from 'react';
import BillingFormBody from './ContactPointInfoFormBodies/BillingFormBody';
import BuyingFormBody from './ContactPointInfoFormBodies/BuyingFormBody';
import PreInterventionFormBody from './ContactPointInfoFormBodies/PreInterventionFormBody';
import SiteManagerFormBody from './ContactPointInfoFormBodies/SiteManagerFormBody';

class ContactPointInfoForm extends React.Component {

	getFormBodyByType = () => {
		const {dataPoint} = this.props;
		switch (dataPoint.type) {
			case 1: // BILLING
				return BillingFormBody;
			case 2: // BUYING
				return BuyingFormBody;
			case 3: // SITE_MANAGER
				return SiteManagerFormBody;
			case 4: // PRE_INTERVENTION
				return PreInterventionFormBody;
		}
	}

	render() {
		const FormBody = this.getFormBodyByType();
		return <div className="contact-point-form">
			<FormBody {...this.props} />
		</div>;
	}
}

export default ContactPointInfoForm;