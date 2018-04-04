import React from 'react';

const getFullAddress = (addressEntity) => {
	const {address, addressBis, zipCode, city, country} = addressEntity;
	if (!(address || addressBis || zipCode || city || country)) {
		return null;
	}
	return <div>
		{address ? <div>{address}</div> : null}
		{addressBis ? <div>{addressBis}</div> : null}
		{zipCode || city || country ?
			<div>
				{zipCode ? <span>{zipCode + ' '}</span> : null}
				{city ? <span>{city + ' '}</span> : null}
				{country ? <span>{country.name}</span> : null}
			</div> : null}
	</div>;
};
export default getFullAddress;
