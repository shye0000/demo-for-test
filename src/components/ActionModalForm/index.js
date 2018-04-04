import React from 'react';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';

export const ModalFormWrapper = Form.create()(
	(props) => {
		const { visible, handleOk, handleCancel, form, confirmLoading, Formcomp, title, footer } = props;
		return (
			<Modal
				{...props}
				title={title}
				visible={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				destroyOnClose={true}
				footer={footer}
				confirmLoading={confirmLoading}>
				<Formcomp {...props} key={visible} form={form} handleSubmit={handleOk}/>
			</Modal>
		);
	}
);

export default class ActionModalForm extends React.Component {
	constructor(props, formComp, title, okText, footer) {
		super(props);
		this.formComp = formComp;
		this.title = title;
		this.okText = okText;
		this.footer = footer;
	}

	state={confirmLoading: false}

	render() {
		return <ModalFormWrapper
			{...this.props}
			ref={(form) => this.form = form}
			visible={this.props.visible}
			handleOk={this.handleSubmit}
			handleCancel={() => this.props.onCloseCallback(this.props.refreshPageWhenCancel)}
			confirmLoading={this.state.confirmLoading}
			title={this.title}
			okText={this.okText}
			footer={this.footer}
			Formcomp={this.formComp}>
		</ModalFormWrapper>;
	}
}