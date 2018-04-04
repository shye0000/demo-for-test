import React from 'react';
import { renderRoutes } from 'react-router-config';
import HierarchyTree from './HierarchyTree';
import './SplitView.scss';

class SplitView extends React.Component {
	render() {
		const {divisionId, subDivisionId} = this.props.match.params;
		return (
			<div className="split-view division-split-view">
				<div className="left">
					<HierarchyTree divisionId={divisionId} subDivisionId={subDivisionId}/>
				</div>
				<div className="body" key={`${divisionId}-${subDivisionId}`}>
					{renderRoutes(this.props.route.routes)}
				</div>
			</div>
		);
	}
}

export default SplitView;
