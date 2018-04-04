import React from 'react';
import {withI18n} from 'lingui-react';
import Radio from 'antd/lib/radio';
import './OperationalServicesRadio.scss';

class OperationalServicesRadio extends React.Component {

	state = {
		checkedService: undefined
	}

	async handleRadioButtonOnClick(ev) {
		const {checkedService} = this.state;

		if (checkedService === ev.target.value) {
			await this.setState({checkedService: undefined});
		} else {
			await this.setState({checkedService: ev.target.value});
		}
	}

	handleOnChange = () => {
		const {onChange} = this.props;
		onChange(this.state.checkedService);
	}

	render() {
		const RadioButton = Radio.Button;
		const RadioGroup = Radio.Group;
		const {services, initialValue} = this.props;
		const {checkedService} = this.state;
		return (
			services && services.length ?
				<RadioGroup
					value={checkedService || initialValue}
					onChange={(ev) => this.handleOnChange(ev)}
					className="operational-services-radio">
					{
						services.map((service) => {
							return <RadioButton
								onClick={(ev) => this.handleRadioButtonOnClick(ev)}
								value={service['@id']}
								key={service['@id']}>
								{service.label}
							</RadioButton>;
						})
					}
				</RadioGroup> : null
		);
	}
}

export default withI18n()(OperationalServicesRadio);
