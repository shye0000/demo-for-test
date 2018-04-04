import React from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import apiClient from '../../apiClient';
import FileUpload from '../FileUpload/index';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class DocumentForm extends React.Component {

	uploadSuccess = (filePromise) => {
		const {form} = this.props;
		filePromise.then((fileData) => {
			form.setFieldsValue({
				document: fileData['@id']
			});
		});

	}

	render() {
		const FormItem = Form.Item;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		return (
			<Form>
				<FormItem
					label={
						<EditableTransWrapper><Trans>Titre</Trans></EditableTransWrapper>
					}>
					{getFieldDecorator('title', {
						rules: [{required: true, message: i18n.t`Veuillez renseigner le titre`}],
					})(
						<Input
							size="large"
							style={{width: '100%'}}
							placeholder={i18n.t`Titre`}
						/>
					)}
				</FormItem>
				<FileUpload apiClient={apiClient} uploadSuccessCallback={this.uploadSuccess}/>
				<FormItem>
					{getFieldDecorator('document', {
						rules: [{required: true, message: i18n.t`Veuillez sélectionner un fichier`}],
					})(
						<Input style={{display: 'none'}}/>
					)}
				</FormItem>
			</Form>
		);
	}
}
export default  withI18n()(DocumentForm);