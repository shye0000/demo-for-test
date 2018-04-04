import React from 'react';
import DownloadUnavailabilityForm from './DownloadUnavailabilityForm';
import ActionModalForm from '../../components/ActionModalForm';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../apiClient';

export default class DownloadUnavailabilityModal extends ActionModalForm {
	constructor(props) {
		super(props, DownloadUnavailabilityForm, <div className="modal-title">
			<EditableTransWrapper><Trans>Etat des indisponibilités</Trans></EditableTransWrapper>
		</div>, <EditableTransWrapper><Trans>Télécharger</Trans></EditableTransWrapper>);
	}
	handleSubmit = (e) => {
		e.preventDefault();
		this.form.validateFields((err, fieldsValue) => {
			if (err) {
				return;
			}
			this.setState({confirmLoading: true});
			const url = `/employee_unavailabilities/excel_export/
			${fieldsValue.start.format('YYYY-MM-DD')}/${fieldsValue.end.format('YYYY-MM-DD')}`;
			apiClient.fetch(url, {
				params: {
					pagination: false
				}
			}).then(
				() => {this.setState({confirmLoading: false});},
				(res) => {
					let filename = `conges_${fieldsValue.start.format('YYYY-MM-DD')}_${fieldsValue.end.format('YYYY-MM-DD')}.xlsx`;
					const disposition = res.response.headers.get('Content-Disposition');
					if (disposition && disposition.indexOf('attachment') !== -1) {
						const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
						const matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1]) {
							filename = matches[1].replace(/['"]/g, '');
						}
					}
					res.response.blob().then((blob) => {
						if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
							window.navigator.msSaveBlob(blob, filename);
						else {
							const a = window.document.createElement('a');
							a.href = window.URL.createObjectURL(blob, {type: 'text/plain'});
							a.download = filename
								|| 'conges.xlsx';
							document.body.appendChild(a);
							a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
							document.body.removeChild(a);
						}
						this.props.onCloseCallback();
					});
					this.setState({confirmLoading: false});
				}
			);
		});
	}
}