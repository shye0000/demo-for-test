import React from 'react';
import Actions from '../actions/Actions';
import './DashboardBox.scss';


class DashboardBox extends React.Component {
	render() {
		const {config} = this.props;
		return <div className="dashboard-box">
			<div className="title-wrapper">
				<div className="title">
					<div className="title-icon">{config.icon}</div>
					<div className="title-content">{config.title}</div>
				</div>
				<div className="box-actions">
					<div className="box-actions-wrapper"><Actions  actions={config.actions} /></div>
				</div>
			</div>
			<div className="box-content">
				{config.content}
			</div>
		</div>;
	}
}

export default DashboardBox;