const getBenefitInfoWithModification = (benefit, modification) => {
	let {title, description, priceTaxExcl, quantity, numberOperations} = modification || {};
	priceTaxExcl = priceTaxExcl ? benefit.priceTaxExcl + priceTaxExcl : benefit.priceTaxExcl;
	quantity = quantity ? benefit.quantity + quantity : benefit.quantity;
	numberOperations = numberOperations ? benefit.numberOperations + numberOperations : benefit.numberOperations;
	title = title || benefit.title;
	description = description || benefit.description;
	return {title, description, priceTaxExcl, quantity, numberOperations};
};

export default getBenefitInfoWithModification;