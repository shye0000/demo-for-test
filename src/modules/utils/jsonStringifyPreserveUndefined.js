const jsonStringifyPreserveUndefined = (jsonObj) => {
	return JSON.stringify(jsonObj, (k, v) => { if (v === undefined) { return null; } return v; });
};

export default jsonStringifyPreserveUndefined;