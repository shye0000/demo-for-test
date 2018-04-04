import React from 'react';
import {withI18n} from 'lingui-react';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import debounce from 'lodash.debounce';
import './SearchField.scss';

class SearchField extends React.Component {

	constructor(props) {
		super(props);
		this.searchHandler = debounce(this.searchHandler, 500);
	}

	state= {
		filterString: ''
	}

	searchHandler = () => {
		this.props.onSearchHandler(this.state.filterString);
	}

	onSearchValueChange = (ev) => {
		ev.persist();
		this.setState({filterString: ev.target.value}, () => this.searchFilter.focus());
		this.searchHandler();
	}

	searchFieldEmpty = () => {
		this.searchFilter.focus();
		this.setState({ filterString: '' });
		this.props.onSearchHandler('');
	}

	componentWillReceiveProps(nextProps) {
		this.setState({filterString: nextProps.value});
	}

	render() {
		const {filterString} = this.state;
		const {i18n, onSearchHandler} = this.props;
		const suffix = filterString ?
			<Icon
				className="search-field-suffix-action"
				type="close-circle"
				onClick={this.searchFieldEmpty} /> : null;
		return <Input
			className="search-field"
			ref={node => this.searchFilter = node}
			placeholder={i18n.t`Recherche`}
			value={this.state.filterString}
			onChange={(ev) => this.onSearchValueChange(ev)}
			onPressEnter={() => onSearchHandler(filterString)}
			prefix={<Icon type="search" />}
			suffix={suffix}/>;
	}
}

export default withI18n()(SearchField);