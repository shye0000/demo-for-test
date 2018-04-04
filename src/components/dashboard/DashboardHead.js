import React from 'react';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Actions from '../actions/Actions';
import classNames from 'classnames';
import './DashboardHead.scss';

class DashboardHead extends React.Component {

	getHeaderContent = () => {
		const { contents } = this.props.config;
		const nbColumn = contents && contents.length ? contents.length : 0;
		if (nbColumn) {
			return contents.map((column, idx) => {
				return <Col key={idx} sm={24} md={24 / (nbColumn - 1)} lg={24 / nbColumn}>
					{
						column.length ?
							column.map((content, index) => {
								return <div key={index} className="item">
									<Row gutter={10} type="flex" align="top">
										<Col xs={24} sm={24} md={8}>
											<span className="label">{content.label}</span>
										</Col>
										<Col xs={24} sm={24} md={16}>
											<span className="value">
												{content.value ? content.value : <div className="empty-label">N/A</div>}
											</span>
										</Col>
									</Row>
								</div>;
							}) : null
					}
					{column.component}
				</Col>;
			});
		}
		return null;
	};

	render() {
		const {config} = this.props;
		return <div className={classNames('dashboard-head', {
			'with-photo': config.photo || config.photoComponent
		})}>
			<div className="top">
				{
					config.photo ? <div className="photo" style={{backgroundImage: `url(${config.photo})`}} /> : null
				}
				{
					config.photoComponent ?
						<div className="photo">
							<div className="component-wrapper">
								{config.photoComponent}
							</div>
						</div> : null
				}
				<div className="title-wrapper">
					<div className="title">{config.title}</div>
					<div className="sub-title">{config.subTitle}</div>
				</div>
			</div>
			<div className="content">
				<Row gutter={24} type="flex">
					{this.getHeaderContent()}
				</Row>
			</div>
			<div className="bottom">
				{config.foot}
			</div>
			<div className="actions-wrapper">
				<Actions
					primary={true} actions={config.actions}
					getPopupContainer={config.getActionsPopupContainer}/>
			</div>
		</div>;
	}
}

export default DashboardHead;