import React from 'react';
import Icon from 'antd/lib/icon';
import {Trans} from 'lingui-react';
import apiClient from '../../../apiClient';
import Tag from '../../../components/tag/Tag';
import Spin from 'antd/lib/spin';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './Skills.scss';

class Skills extends React.Component {

	state = {
		ready: false,
		skills: null
	}

	async fetchSkills() {
		const {employee} = this.props;
		this.setState({ready: false});
		const skillsResponse = await apiClient.fetch('/skills', {
			params: {
				employees: employee.id,
				pagination: false
			}
		});
		if (skillsResponse.status === 200) {
			this.setState({
				ready: true,
				skills: skillsResponse.json
			});
		}
	}


	componentDidMount () {
		this.fetchSkills();
	}

	render() {
		const {skills, ready} = this.state;

		return <div className="skills">
			<Spin spinning={!ready} >
				{
					skills && skills['hydra:member'].length ?
						<div className="skills-inner">
							{

								skills['hydra:member'].map((skill, idx) => {
									return <Tag checked={true} key={idx} label={skill.label} />;
								})
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>Aucune compétence</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;

	}
}

export default Skills;