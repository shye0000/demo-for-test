export const CONTACT_MODIFIED = 'CONTACT_MODIFIED';
export const DIVISION_CREATED = 'DIVISION_CREATED';
export const DIVISION_MODIFIED = 'DIVISION_MODIFIED';
export const SUB_DIVISION_CREATED = 'DIVISION_CREATED';
export const SUB_DIVISION_MODIFIED = 'SUB_DIVISION_MODIFIED';
export const UPDATE_HIERARCHY = 'UPDATE_HIERARCHY';
export const HIERARCHY_UPDATED = 'HIERARCHY_UPDATED';


const contactModified = (modifiedContact) => {
	return {
		type: CONTACT_MODIFIED,
		modifiedContact: modifiedContact
	};
};
const divisionCreated = (createdDivision) => {
	return {
		type: DIVISION_CREATED,
		createdDivision: createdDivision
	};
};
const divisionModified = (modifiedDivision) => {
	return {
		type: DIVISION_MODIFIED,
		modifiedDivision: modifiedDivision
	};
};
const subDivisionCreated = (createdDivision) => {
	return {
		type: SUB_DIVISION_CREATED,
		createdDivision: createdDivision
	};
};
const subDivisionModified = (modifiedSubDivision) => {
	return {
		type: SUB_DIVISION_MODIFIED,
		modifiedSubDivision: modifiedSubDivision
	};
};
const updateHierarchy = () => {
	return {
		type: UPDATE_HIERARCHY
	};
};
const hierarchyUpdated = () => {
	return {
		type: HIERARCHY_UPDATED
	};
};

export default {
	CONTACT_MODIFIED: contactModified,
	DIVISION_CREATED: divisionCreated,
	DIVISION_MODIFIED: divisionModified,
	SUB_DIVISION_CREATED: subDivisionCreated,
	SUB_DIVISION_MODIFIED: subDivisionModified,
	UPDATE_HIERARCHY: updateHierarchy,
	HIERARCHY_UPDATED: hierarchyUpdated
};