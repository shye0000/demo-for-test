import {CONTACT_MODIFIED, UPDATE_HIERARCHY, HIERARCHY_UPDATED} from './actions';

const reducers = (state = [], action) => {
	switch (action.type) {
		case CONTACT_MODIFIED: {
			return {
				modifiedContact: action.modifiedContact
			};
		}
		case UPDATE_HIERARCHY: {
			return {
				updateHierarchy: true
			};
		}
		case HIERARCHY_UPDATED: {
			return {
				updateHierarchy: false
			};
		}

		default: {
			return state;
		}
	}
};

reducers.reducer = 'divisions';

export default reducers;