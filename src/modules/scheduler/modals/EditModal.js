import React from 'react';
import EditForm from '../forms/EditForm';
import ActionModalForm from '../../../components/ActionModalForm/index';
import {Trans, withI18n} from 'lingui-react';

class AddContractDocumentModal extends ActionModalForm {
	constructor(props) {
		super(props, EditForm, <div className="modal-title">
			<Trans>Modifier</Trans>
		</div>, <Trans>Modifier</Trans>);
	}
	handleSubmit = (e) => {
		e.preventDefault();

	}
}

export default withI18n()(AddContractDocumentModal);
