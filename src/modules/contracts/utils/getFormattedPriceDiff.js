const getFormattedPriceDiff = (priceDiff) => {
	let formatted;
	priceDiff = priceDiff || 0;
	formatted = (priceDiff || 0).toLocaleString('fr-FR', {
		style: 'currency',
		currency: 'EUR'
	});
	if (priceDiff > 0) {
		formatted = '+' + formatted;
	}
	return formatted;
};
export default getFormattedPriceDiff;