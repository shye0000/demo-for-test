import React from 'react';
import Form from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Checkbox from 'antd/lib/checkbox';
import apiClient from '../../apiClient';
import {withI18n} from 'lingui-react';
import './ModifySkillsForm.scss';

class ModifySkillsForm extends React.Component {

	state={
		ready: false,
		skillOptions: [],
		skillsValue: []
	}

	formatToOptions = (skills) => {
		return skills.map((skill) => {
			return {
				label: skill.label,
				value: skill['@id']
			};
		});
	}

	async fetchSkillOptions() {

		let skillsValue = [];

		const {employee} = this.props;

		this.setState({ready: false});

		const response = await apiClient.fetch('/skills',  {
			params: {pagination: false}
		});

		const valueResponse = await apiClient.fetch('/skills', {
			params: {
				employees: employee.id,
				pagination: false
			}
		});

		if (valueResponse.status === 200) {
			skillsValue = valueResponse.json['hydra:member'].map((skill) => skill['@id']);
		}

		this.setState({
			ready: true,
			skillOptions: this.formatToOptions(response.json['hydra:member']),
			skillsValue
		}, () => {
			this.props.form.setFieldsValue({skills: this.state.skillsValue});
		});

	}

	componentDidMount() {
		this.fetchSkillOptions();
	}

	render() {
		const FormItem = Form.Item;
		const CheckboxGroup = Checkbox.Group;
		const { getFieldDecorator } = this.props.form;
		const { skillOptions, ready } = this.state;

		return (
			ready ?
				<Form className="modify-skills-form">
					<FormItem className="skills-checkbox-wrapper">
						{getFieldDecorator('skills')(
							<CheckboxGroup>
								<Row gutter={10}>
									{
										skillOptions.map((option, idx) => {
											return <Col xs={24} md={12} key={idx}>
												<Checkbox className="skills-checkbox" value={option.value}>{option.label}</Checkbox>
											</Col>;
										})
									}
								</Row>
							</CheckboxGroup>
						)}
					</FormItem>
				</Form> : <Spin />
		);
	}
}
export default withI18n()(ModifySkillsForm);