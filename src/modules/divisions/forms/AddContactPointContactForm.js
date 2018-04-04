import React from 'react';
import FormComp from 'antd/lib/form';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import debounce from 'lodash.debounce';
import apiClient from '../../../apiClient';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './AddContactPointContactForm.scss';

class AddContactPointContactForm extends React.Component {

	state = {
		contactSearchFetching: false,
		contacts: null
	}

	async searchContacts(searchContactsValue) {
		const {division} = this.props;
		this.setState({ contacts: [], contactSearchFetching: true });
		const searchValue = searchContactsValue ? {search: searchContactsValue} : null;
		const searchContactsResponse  = await apiClient.fetch('/contacts', {
			params: {
				...searchValue,
				divisionOrParent: division.parent ? division.parent.id : division.id,
				pagination: false,
				isOut: false,
			}
		});
		if (searchContactsResponse.status === 200) {
			this.setState({
				contactSearchFetching: false,
				contacts: searchContactsResponse.json['hydra:member']
			});
		}
	}

	componentDidMount() {
		this.searchContacts();
		this.searchContacts = debounce(this.searchContacts, 500);
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { contactSearchFetching, contacts } = this.state;
		const { i18n } = this.props;
		return <div className="add-contact-to-contact-point-form">
			<FormComp onSubmit={this.handleSubmit}>
				<FormCompItem label={
					<EditableTransWrapper><Trans>Salariés</Trans></EditableTransWrapper>
				}>
					{getFieldDecorator('dataPointContacts', {
						rules: [{
							required: true, message: 'Veuillez renseigner au moins un salarié'
						}],
					})(
						<Select
							showSearch={true} mode="multiple" dropdownClassName="contact-field"
							notFoundContent={contactSearchFetching ? <Spin size="small" /> : null}
							placeholder={i18n.t`Salariés`} size="large" filterOption={false}
							onSearch={(value) => this.searchContacts(value)}>
							{
								contacts? contacts.map((contact, idx) => {
									return <Option key={idx} value={contact['@id']}>
										<div className="contact-option">
											<div className="photo" style={{
												backgroundImage: contact.photo ?
													`url(${AppConfig.apiEntryPoint}${contact.photo.content_uri})` : null
											}}>
												{
													!contact.photo ?
														`${contact.firstName[0]}${contact.lastName[0]}` : null
												}
											</div>
											<div className="name">{`${contact.firstName} ${contact.lastName}`}</div>
										</div>

									</Option>;
								}) : null
							}
						</Select>
					)}
				</FormCompItem>
			</FormComp>
		</div>;
	}
}


export default withI18n()(AddContactPointContactForm);