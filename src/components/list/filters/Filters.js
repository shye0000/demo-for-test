import React from 'react';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import {Trans, withI18n} from 'lingui-react';
import {getUrlParams} from '../utils';
import dot from 'dot-object';
import './Filters.scss';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';

const pickFiltersValue = (values, filters) => {
	let filtersValue = {};
	values = dot.object(values);
	for (let i in filters) {
		const filterName = filters[i].name;
		filtersValue[filterName] = dot.pick(filterName, values);
	}
	return JSON.parse(JSON.stringify(filtersValue));
};

class Filters extends React.Component {

	submitFilters = (e, reset) => {
		if (e) {
			e.preventDefault();
		}
		const {form, filtersSubmitCallback, filters} = this.props;
		form.validateFields((err, values) => {
			if (!err) {
				filtersSubmitCallback(pickFiltersValue(values, filters), true, reset);
			}
		});
	}

	resetFiltersForm = (e) => {
		this.props.form.resetFields();
		this.submitFilters(e, true);
	}

	getFilterByName = (filterName) => {
		const {filters} = this.props;
		return filters.find((filter) => filter.name === filterName);
	}

	async setFiltersValueFromUrlQuery() {
		let filtersValue = {};
		const {search, form, filters, filtersClosedChangeCallback} = this.props;
		const searchParams = getUrlParams(search);
		for (let idx in filters) {
			const filterName = filters[idx].name;
			const filter = filters[idx];
			let filterValidValue;
			const value = dot.pick(filterName, searchParams);
			if (value) {
				if (filter && filter.getValidValueForFilter) {
					filterValidValue = await filter.getValidValueForFilter(value);
				} else {
					filterValidValue = value;
				}
				filtersValue[filterName] = filterValidValue;
			}
		}
		if (Object.keys(filtersValue).length > 0) {
			form.setFieldsValue(filtersValue);
			if (filtersClosedChangeCallback) {
				filtersClosedChangeCallback(true);
			}
		}

		this.submitFilters();

	}

	componentDidMount = () => {
		this.setFiltersValueFromUrlQuery();
	}

	render () {
		const FormItem = Form.Item;
		let {filters, i18n, autoSubmit} = this.props;
		const { getFieldDecorator } = this.props.form;
		return <Form className="filters-form-row" onSubmit={(e) => this.submitFilters(e)}>
			<div className="form-body">
				{
					filters.map((filter) => {
						return <div key={filter.name || filter.title} className="filter-field">
							<span className="filters-subtitle">{filter.title}</span>
							<FormItem>
								{getFieldDecorator(filter.name, {
									rules: [{ required: filter.required, message: i18n.t`Veuillez renseigner ce champ.` }]
								})(filter.component)}
							</FormItem>
						</div>;
					})
				}
			</div>
			{
				!autoSubmit ?
					<Row className="footer" gutter={16}>
						<Col span={12}>
							<Button htmlType="submit" className="action" type="primary">
								<EditableTransWrapper><Trans>Appliquer</Trans></EditableTransWrapper>
							</Button>
						</Col>
						<Col span={12}>
							<Button className="action reinitial-action" onClick={this.resetFiltersForm}>
								<EditableTransWrapper><Trans>Réinitialiser</Trans></EditableTransWrapper>
							</Button>
						</Col>
					</Row>: null
			}
		</Form>;
	}
}

export default Form.create({
	onValuesChange: (props, values) => {
		const {autoSubmit, filtersSubmitCallback, filters} = props;
		if (autoSubmit) {
			filtersSubmitCallback(pickFiltersValue(values, filters), false);
		}
	}
})(withI18n()(Filters));
