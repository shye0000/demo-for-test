import React from 'react';
import FormComp from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import Select from 'antd/lib/select';
import apiClient from '../../../apiClient';
import debounce from 'lodash.debounce';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

class AddLinkedContractForm extends React.Component {

	state = {
		ready: false,
		contracts: null,
		contractSearchFetching: false,
		linkedContracts: [],
	}

	async fetch() {
		this.setState({ready: false,});
		await this.getLinkedContracts();
		await this.searchContracts();
	}

	async getLinkedContracts() {
		const {contract} = this.props;
		let response = await apiClient.fetch('/contracts', {
			params: {
				linkedTo: contract['@id'],
				pagination: false
			}
		});
		if (response.status === 200) {
			this.setState({
				linkedContracts: response.json['hydra:member'].map(linkedContract => linkedContract['@id'])
			});
		}
	}

	async searchContracts(searchValue) {
		let searchResponse;
		this.setState({ contracts: [], contractSearchFetching: true});
		if (searchValue) {
			searchResponse  = await apiClient.fetch('/contracts', {
				params: {
					search: searchValue,
					pagination: false
				}
			});
		} else {
			searchResponse = await apiClient.fetch('/contracts', {
				params: {itemsPerPage: 20}
			});
		}
		if (searchResponse.status === 200) {
			const {linkedContracts} = this.state;
			this.setState({
				ready: true,
				contractSearchFetching: false,
				contracts: searchResponse.json['hydra:member'].map(contract => {
					return {
						...contract,
						linked: !!linkedContracts.find(linkedContractId => linkedContractId === contract['@id'])
					};
				})
			}, () => {
				const {form} = this.props;
				form.setFieldsValue({linkedContracts});
			});
		}
	}

	async componentDidMount() {
		this.setState({ ready: false});
		await this.fetch();
		this.searchContracts = debounce(this.searchContracts, 500);
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const { getFieldDecorator } = this.props.form;
		const { i18n } = this.props;
		const { ready, contracts, contractSearchFetching, linkedContracts } = this.state;

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<div className="form-section">
					<FormCompItem
						label={<EditableTransWrapper><Trans>Contrat lié</Trans></EditableTransWrapper>}>
						{getFieldDecorator('newLinkedContract', {
							rules: [{required: true, message: i18n.t`Veuillez sélectionner un contrat`}],
						})(
							<Select
								showSearch={true}
								notFoundContent={contractSearchFetching ? <Spin size="small" /> : null}
								placeholder={i18n.t`Rechercher et sélectionner un contrat`} size="large" filterOption={false}
								onSearch={(value) => this.searchContracts(value)}>
								{
									contracts ? contracts.map((contract, idx) => {
										return <Option key={idx} value={contract['@id']} disabled={contract.linked}>
											{contract.number}
											{
												contract.nature == 1 ?
													<span>
														{' '}
														<EditableTransWrapper><Trans>(avenant)</Trans></EditableTransWrapper>
													</span>
													: null
											}
											{
												contract.nature == 2 ?
													<span>
														{' '}
														<EditableTransWrapper><Trans>(contrat)</Trans></EditableTransWrapper>
													</span>
													: null
											}
											{
												contract.nature == 3 ?
													<span>
														{' '}
														<EditableTransWrapper><Trans>(devis)</Trans></EditableTransWrapper>
													</span>
													: null
											}
											{
												contract.linked ?
													<span>
														{' '}
														<EditableTransWrapper><Trans>(Déjà lié)</Trans></EditableTransWrapper>
													</span>
													: null
											}
										</Option>;
									}) : null
								}
							</Select>
						)}
					</FormCompItem>
					<FormCompItem>
						{getFieldDecorator('linkedContracts')(
							<Select mode="multiple" style={{display: 'none'}} disabled={true} readOnly={true}>
								{
									linkedContracts ? linkedContracts.map((contract, idx) => {
										return <Option key={idx} value={contract}>
											{contract}
										</Option>;
									}) : null
								}
							</Select>
						)}
					</FormCompItem>
				</div>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(AddLinkedContractForm);