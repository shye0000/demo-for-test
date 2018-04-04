import React from 'react';
import notification from 'antd/lib/notification';
import Icon from 'antd/lib/icon';
import Upload from 'antd/lib/upload';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Spin from 'antd/lib/spin';

class FileUpload extends React.Component {

	state = {
		isUploading: false,
		fileList: [],
	}

	handleFilesList = (file) => {
		const fileList = [file];
		this.setState({ fileList });
	}

	render() {
		const Dragger = Upload.Dragger;
		const {isUploading} = this.state;
		const {multiple, apiClient, uploadSuccessCallback, title, i18n} = this.props;
		const uploaderProps = {
			name: 'file',
			multiple: multiple,
			defaultFileList: this.state.fileList,

			customRequest: ({file}) => {
				this.setState({isUploading: true});
				const formData = new FormData();
				formData.append('attachment', file);
				apiClient.fetch('/files/upload', {
					method: 'POST',
					body: formData
				}).then(
					null,
					(response) => {
						this.setState({isUploading: false});
						if (response.response.status === 201) {
							this.handleFilesList(file);
							notification['success']({
								message: `${file.name} ${i18n.t`le fichier a bien été téléchargé.`}`,
								className: 'qhs-notification success'
							});
							uploadSuccessCallback(response.response.json());
						} else {
							notification['error']({
								message: `${file.name} ${i18n.t`le fichier n'a pas été téléchargé.`}`,
								className: 'qhs-notification error'
							});
						}
					}
				);
			}
		};

		return(
			<Spin spinning={isUploading}>
				<Dragger {...uploaderProps} fileList={this.state.fileList}>
					<p className="ant-upload-drag-icon">
						<Icon type="inbox" />
					</p>
					<p className="ant-upload-text">{title}</p>
					<p className="ant-upload-hint">
						<EditableTransWrapper><Trans>Cliquer ou faire glisser un fichier ici</Trans></EditableTransWrapper>
					</p>
				</Dragger>
			</Spin>
		);
	}

}
export default withI18n()(FileUpload);