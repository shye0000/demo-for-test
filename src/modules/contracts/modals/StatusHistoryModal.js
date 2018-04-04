import React from 'react';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ActionModalForm from '../../../components/ActionModalForm';
import StatusHistoryList from '../lists/StatusHistoryList';

class StatusHistoryModal extends ActionModalForm {
	constructor(props) {
		super(props, StatusHistoryList, <div className="modal-title">
			<EditableTransWrapper><Trans>Historique des statuts</Trans></EditableTransWrapper>
		</div>);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.onCloseCallback();
	}
}

export default withI18n()(StatusHistoryModal);