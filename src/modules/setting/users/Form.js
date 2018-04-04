import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import FormComp from 'antd/lib/form';
import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Spin from 'antd/lib/spin';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import apiClient from '../../../apiClient';
import Radio from 'antd/lib/radio';

class Form extends React.Component {

	state = {
		ready: false,
		user: null,
		employees: null,
		groups: null
	}

	setDefaultValues = () => {
		const {form} = this.props;
		const {user} = this.state;

		if (user) {
			let groups = [];

			for (let key in user.groups) {
				groups.push(user.groups[key]['@id']);
			}

			form.setFieldsValue({
				employee: user.employee['@id'],
				email: user.email,
				groups: groups,
				enabled: user.enabled ? 1 : 0
			});
		}
	}

	async fetch() {
		const {user} = this.props;
		this.setState({ready: false});
		const employeesResponse = await apiClient.fetch('/employees', {params: {pagination: false, withUser: false}});
		const groupsResponse = await apiClient.fetch('/groups', {params: {pagination: false, assignable: true}});

		let userResponse = null;
		if (user) {
			userResponse = await apiClient.fetch(user['@id']);
		}

		if ((!userResponse || userResponse.status === 200) &&
			employeesResponse.status === 200 &&
			groupsResponse.status === 200
		) {
			this.setState({
				ready: true,
				user: userResponse ? userResponse.json : null,
				employees: employeesResponse.json['hydra:member'],
				groups: groupsResponse.json['hydra:member']
			}, () => {
				this.setDefaultValues();
			});
		}
	}

	componentDidMount() {
		this.fetch();
	}

	checkConfirmPlainPassword = (rule, value, callback) => {
		const form = this.props.form;

		if (value && value !== form.getFieldValue('plainPassword')) {
			callback('Le mot de passe ne correspond pas');
		} else {
			callback();
		}
	}

	render() {
		const FormCompItem = FormComp.Item;
		const Option = Select.Option;
		const RadioGroup = Radio.Group;
		const { getFieldDecorator } = this.props.form;
		const { user, employees, groups, ready } = this.state;
		const { i18n } = this.props;
		let employeeField = null;
		let rolesField = null;
		const plainPassword = this.props.form.getFieldValue('plainPassword');

		if (ready && !user) {
			employeeField = <Col xs={24} md={12}>
				<FormCompItem label={<EditableTransWrapper><Trans>Employé</Trans></EditableTransWrapper>}>
					{getFieldDecorator('employee', {
						rules: [{
							required: true, message: i18n.t`Veuillez renseigner l'employé`
						}],
					})(
						<Select allowClear={true} placeholder="Employé" size="large">
							{
								employees.map((employee, idx) => {
									return <Option key={idx} value={employee['@id']}>{employee.firstName} {employee.lastName}</Option>;
								})
							}
						</Select>
					)}
				</FormCompItem>
			</Col>;
		}

		if (ready && (!user || user.groups[0].reference != 'ROLE_SUPER_ADMIN')) {
			rolesField = <Col xs={24} md={12}>
				<FormCompItem label={<EditableTransWrapper><Trans>Rôles</Trans></EditableTransWrapper>}>
					{getFieldDecorator('groups', {
						rules: [{
							required: true, message: i18n.t`Veuillez renseigner au moins un rôle`
						}],
					})(
						<Select mode="multiple" placeholder="Rôles" size="large">
							{
								groups.map((group, idx) => {
									return <Option key={idx} value={group['@id']}>
										{`${group.label}`}
									</Option>;
								})
							}
						</Select>
					)}
				</FormCompItem>
			</Col>;
		}

		return (
			ready ? <FormComp onSubmit={this.handleSubmit}>
				<Row gutter={20} type="flex" align="top">
					{employeeField}
					<Col xs={24} md={12}>
						<FormCompItem label={<EditableTransWrapper><Trans>Email</Trans></EditableTransWrapper>}>
							{getFieldDecorator('email', {
								rules: [{
									required: true, message: i18n.t`Veuillez renseigner l'email`,
								}],
							})(
								<Input placeholder="Email" size="large" />
							)}
						</FormCompItem>
					</Col>
					{rolesField}
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Mot de passe</Trans></EditableTransWrapper>}
							extra={user ? 'Ne remplissez ce champ que si vous souhaitez modifier le mot de passe de cet utilisateur, laissez le vide dans le cas contraire' : ''}
						>
							{getFieldDecorator('plainPassword', {
								rules: [{
									required: !user, message: i18n.t`Veuillez renseigner le mot de passe`,
								}],
							})(
								<Input type="password" placeholder="Mot de passe" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem label={<EditableTransWrapper><Trans>Confirmer le mot de passe</Trans></EditableTransWrapper>}>
							{getFieldDecorator('confirmPlainPassword', {
								rules: [{
									required: (!user || plainPassword), message: i18n.t`Veuillez confirmer le mot de passe`,
								}, {
									validator: this.checkConfirmPlainPassword
								}],
							})(
								<Input type="password" placeholder="Confirmer le mot de passe" size="large" />
							)}
						</FormCompItem>
					</Col>
					<Col xs={24} md={12}>
						<FormCompItem
							label={<EditableTransWrapper><Trans>Activé</Trans></EditableTransWrapper>}>
							{getFieldDecorator('enabled')(
								<RadioGroup size="large">
									<Radio value={1}>
										<EditableTransWrapper><Trans>Oui</Trans></EditableTransWrapper>
									</Radio>
									<Radio value={0}>
										<EditableTransWrapper><Trans>Non</Trans></EditableTransWrapper>
									</Radio>
								</RadioGroup>
							)}
						</FormCompItem>
					</Col>
				</Row>
			</FormComp> : <Spin className="centered-spin" />
		);
	}
}

export default withI18n()(Form);
