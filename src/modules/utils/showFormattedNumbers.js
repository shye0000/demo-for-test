import {formatPhoneNumber, parsePhoneNumber, isValidPhoneNumber} from 'react-phone-number-input';

const showFormattedNumbers = (number) => {
	if(isValidPhoneNumber(number))
		return formatPhoneNumber( parsePhoneNumber(number), 'International' );
	else
		return number;
};

export default showFormattedNumbers;
