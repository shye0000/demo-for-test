import React from 'react';
import Form from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../../apiClient';

class ChooseSite extends React.Component {

	state = {
		ready: false,
		sites: null,
		zones: null,
		selectedSite: null,
		fieldsDisabled: false
	}

	getFullOrganizations = () => {
		const {contract} = this.props;
		let fullOrganizations;
		if (contract && contract.division) {
			if (contract.division.parent)
				fullOrganizations = contract.division.parent.name + ' > ' + contract.division.name;
			else
				fullOrganizations = contract.division.name;
		}
		return fullOrganizations;
	}

	async searchSubDivisions(selectedSite) {
		let searchResponse;
		const {contract} = this.props;

		let params = {
			hasParent: !!selectedSite,
			'order[name]': 'ASC',
			pagination: false
		};

		await this.setState({selectedSite});

		if (selectedSite) {
			params.parent = selectedSite;
			this.setState({ zone: [] });
		} else {
			params.divisions = [contract.division['@id']];
			this.setState({ sites: [] });
		}

		searchResponse  = await apiClient.fetch('/sub_divisions', {params});

		if (searchResponse.status === 200) {
			if (selectedSite) {
				this.setState({
					ready: true,
					zones: searchResponse.json['hydra:member']
				});
			} else {
				this.setState({
					ready: true,
					sites: searchResponse.json['hydra:member'].map(
						(site) => {
							const fullName = this.getFullOrganizations() + ' > ' + site.name;
							return {
								...site,
								fullName
							};
						}
					).sort((a, b) => {
						if(a.fullName < b.fullName) return -1;
						if(a.fullName > b.fullName) return 1;
						return 0;
					})
				});
			}

		}
	}

	async componentDidMount () {
		const {benefit, form, contract} = this.props;

		this.setState({
			ready: false,
			fieldsDisabled: contract.status !== 1
		});
		await this.searchSubDivisions();
		if (benefit) {
			const {modification} = benefit;
			await this.setState({
				fieldsDisabled: modification ? !modification.isNewBenefit : contract.status !== 1
			});
			const site = benefit.subDivision.parent ?
				benefit.subDivision.parent['@id'] : benefit.subDivision['@id'];
			const zone = benefit.subDivision.parent ?
				benefit.subDivision['@id'] : undefined;
			await this.searchSubDivisions(site);
			form.setFieldsValue({site, zone});
		}
	}

	render() {
		const {ready, fieldsDisabled} = this.state;
		const FormCompItem = Form.Item;
		const Option = Select.Option;
		const {sites, zones, selectedSite} = this.state;
		const {i18n} = this.props;
		const { getFieldDecorator } = this.props.form;
		return (
			ready ? <div>
				<Row gutter={20}>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Site sous contrat</Trans></EditableTransWrapper>}>
							{getFieldDecorator('site', {
								rules: [{
									required: true,
									message: i18n.t`Veuillez sélectionner un site`,
								}],
							})(
								<Select
									disabled={fieldsDisabled}
									allowClear={true} placeholder={i18n.t`Site sous contrat`} size="large"
									onChange={(selectedSite) => this.searchSubDivisions(selectedSite)}>
									{
										sites? sites.map((site, idx) => {
											return <Option key={idx} value={site['@id']}>
												{site.fullName}
											</Option>;
										}) : null
									}
								</Select>
							)}
						</FormCompItem>
					</Col>
				</Row>
				<Row gutter={20}>
					{
						selectedSite && zones && zones.length ?
							<Col xs={24} md={12}>
								<FormCompItem
									label={<EditableTransWrapper><Trans>Zone</Trans></EditableTransWrapper>}>
									{getFieldDecorator('zone', {
										rules: [{
											required: true,
											message: i18n.t`Veuillez sélectionner une zone`,
										}],
									})(
										<Select
											allowClear={true} placeholder={i18n.t`Zone`}
											size="large" disabled={fieldsDisabled}>
											{
												zones? zones.map((zone, idx) => {
													return <Option key={idx} value={zone['@id']}>
														{zone.name}
													</Option>;
												}) : null
											}
										</Select>
									)}
								</FormCompItem>
							</Col> : null
					}

				</Row>
			</div> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(ChooseSite);