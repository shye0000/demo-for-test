import React from 'react';
import DashboardHead from './DashboardHead';
import DashboardBody from './DashboardBody';
import './Dashboard.scss';

class Dashboard extends React.Component {

	componentDidMount() {

	}

	componentWillUnmount() {

	}

	render() {
		const {head, body} = this.props.config;
		const className = this.props.className + ' dashboard';
		return <div className={className}>
			<DashboardHead config={head}/>
			<DashboardBody config={body}/>
		</div>;
	}
}

export default Dashboard;
