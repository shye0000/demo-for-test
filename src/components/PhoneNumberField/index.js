import React from 'react';
import Phone, {isValidPhoneNumber} from 'react-phone-number-input';
import {withI18n} from 'lingui-react';
import './PhoneNumberField.scss';
import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';

class PhoneNumberField extends React.Component {

	state = {
		phone: null,
	}

	validatePhoneNumber = (phone) => {
		this.setState({phone});
		const {form, id, i18n} = this.props;
		let valid = isValidPhoneNumber(phone);
		if (valid) {
			form.setFields({
				[id]: {
					value: phone,
					errors: null
				}
			});
		} else {
			form.setFields({
				[id]: {
					value: phone,
					errors:[new Error(i18n.t`Numéro de téléphone invalide`)]
				}
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const {form, id} = nextProps;
		const phoneNumber = form.getFieldValue(id);
		if (phoneNumber) {
			this.setState({phone: phoneNumber});
		}
	}

	render() {
		const {i18n} = this.props;
		const {phone} = this.state;

		return (
			<label className="phone-number-field-wrapper">
				{/*todo Attention a l'attribut country="FR" au cas ou <Phone> devient un WbcComponent , il faut set l'atribut via une config */}
				<Phone
					className="phone-number-field ant-input"
					country="FR"
					placeholder={i18n.t`Numéro`}
					value={phone}
					onChange={ phone => this.validatePhoneNumber(phone) }
				/>
			</label>
		);
	}
}

export default withI18n()(PhoneNumberField);
