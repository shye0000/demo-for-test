import React from 'react';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import {checkUserHasRights} from '../../modules/utils/userRightsManagement';
import './Action.scss';

class Action extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false
		};
	}

	actionOnClick = (ev, action, hasRights) => {
		if (!hasRights || action.disabled) {
			return;
		}
		if (action.modal) {
			this.setState({modalVisible: true});
		} else if (action.method) {
			action.method();
		}
	}

	modalCloseCallback = (action, refresh, data) => {
		this.setState({modalVisible: false});
		if (action.modalCloseCallback) {
			action.modalCloseCallback(refresh, data);
		}
	}

	getActionComp = () => {
		const {action, renderAsButton, size, renderAsButtonWithTitle} = this.props;
		const hasRights = checkUserHasRights(action.requiredRights);
		if (renderAsButtonWithTitle) {
			return <Button
				type={action.type}
				disabled={!hasRights || action.disabled}
				size={size} onClick={(ev) => this.actionOnClick(ev, action, hasRights)}>
				{action.icon} {action.title}
			</Button>;
		}
		return (
			renderAsButton ?
				<Tooltip title={action.title} arrowPointAtCenter placement="topRight">
					<Button
						type={action.type}
						disabled={!hasRights || action.disabled}
						size={size} onClick={(ev) => this.actionOnClick(ev, action, hasRights)}>
						{action.icon}
					</Button>
				</Tooltip>
				:
				<div
					className={classNames('popover-content', {
						disabled: !hasRights || action.disabled,
						danger: action.type === 'danger'
					})}
					onClick={(ev) => this.actionOnClick(ev, action, hasRights)}>
					<div className="action-icon">
						{action.icon}
					</div>
					<div className="action-title">
						{action.title}
					</div>
				</div>
		);
	}

	render () {
		const {action} = this.props;
		const {modalVisible} = this.state;
		const actionComp = this.getActionComp();
		let modal;
		if (action.modal) {
			modal = React.cloneElement(
				action.modal,
				{
					visible: modalVisible,
					onCloseCallback: (refresh, data) => this.modalCloseCallback(action, refresh, data)
				}
			);
		}
		return (
			<div className="action">
				{
					action.link ?
						<Link to={action.link}>
							{actionComp}
						</Link>
						:
						<div>
							{actionComp}
							{modal}
						</div>
				}
			</div>
		);
	}
}

export default Action;
