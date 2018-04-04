import React from 'react';
import elementResizeEvent, {unbind} from 'element-resize-event';
import Button from 'antd/lib/button';
import Table from 'antd/lib/table';
import Icon from 'antd/lib/icon';
import Filters from './filters/Filters';
import SearchField from './SearchField';
import Actions from '../actions/Actions';
import {Trans} from 'lingui-react';
import apiClient from '../../apiClient';
import {withRouter} from 'react-router-dom';
import {getUrlParams} from './utils';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import classNames from 'classnames';
import './List.scss';

class List extends React.Component {
	
	state = {
		filtersOpened: false,
		actionIsTriggered: false,
		loading: false,
		customFiltersValues: null,
		quickFiltersValues: null,
		customFiltersValueReady: false,
		quickFiltersValueReady: false,
		listScrollHeight: null,
		listHeadHeight: null,
		listFooterHeight: null,
		listScrollBodyHeight: null,
		generalSearch: undefined,
		fetched: false,
		data: [],
		sorter: null,
		pagination: {
			pageSize: 20,
			current: 1,
			showSizeChanger: true,
			pageSizeOptions: ['10', '20', '50', '100'],
			showTotal: (total, range) => {
				return <div>
					<EditableTransWrapper><Trans>Affichage de</Trans></EditableTransWrapper>
					{' ' + range[0] + ' '}
					<EditableTransWrapper><Trans>à</Trans></EditableTransWrapper>
					{' ' + range[1] + ' '}
					<EditableTransWrapper><Trans>de</Trans></EditableTransWrapper>
					{' ' + total + ' '}
					<EditableTransWrapper><Trans>résultats</Trans></EditableTransWrapper>
				</div>;
			}
		}
	}

	getCurrentFiltersAndSorters = () => {
		const {customFiltersValues, sorter, generalSearch} = this.state;
		const {defaultFilters} = this.props.configurations;
		let params = {
			...defaultFilters
		};
		if (sorter) {
			const sortParam = `order[${sorter.columnKey}]`;
			const sortValue = sorter.order === 'descend' ? 'DESC' : 'ASC';
			params[sortParam] = sortValue;
		}
		params = JSON.parse(JSON.stringify(
			{
				...params,
				...this.formatFiltersValueForFetch(customFiltersValues),
				search: generalSearch || undefined
			}
		));
		return params;

	}

	toggleFilterSideBar = (open) => {
		if (open !== true && open !== false) {
			open = !this.state.filtersOpened;
		}
		this.setState({
			filtersOpened: open,
		});
	}

	generalSearchChange = (newSearchValue) => {
		const {generalSearch, pagination} = this.state;
		if (newSearchValue !== generalSearch) {
			this.setState({
				generalSearch: newSearchValue,
				pagination: {
					...pagination,
					current: 1,
				}
			}, () => {
				this.fetch();
			});
		}
	}

	formatFiltersValueForFetch = (values) => {
		let filtersValue = {...values};
		if (filtersValue) {
			const {filters, quickFilters} = this.props.configurations;
			Object.keys(filtersValue).forEach((filterName) => {
				const currentFilter = [...filters, ...quickFilters]
					.find(filter => filter.name === filterName);

				if (currentFilter && currentFilter.formatValueForRequest) {
					const formatted = currentFilter.formatValueForRequest(filtersValue[filterName]);
					delete filtersValue[filterName];
					filtersValue = {
						...filtersValue,
						...formatted
					};
				}
			});
		}
		return filtersValue;
	}

	formatFiltersValueForUpdateUrl = (values) => {
		let filtersValue = {...values};
		if (filtersValue) {
			const {filters, quickFilters} = this.props.configurations;
			Object.keys(filtersValue).forEach((filterName) => {
				const currentFilter = [...filters, ...quickFilters]
					.find(filter => filter.name === filterName);
				if (currentFilter && currentFilter.formatValueForUrl) {
					const formatted = currentFilter.formatValueForUrl(filtersValue[filterName]);
					delete filtersValue[filterName];
					filtersValue = {
						...filtersValue,
						...formatted
					};
				} else if (currentFilter && currentFilter.formatValueForRequest) {
					const formatted = currentFilter.formatValueForRequest(filtersValue[filterName]);
					delete filtersValue[filterName];
					filtersValue = {
						...filtersValue,
						...formatted
					};
				}
			});
		}
		return filtersValue;
	}

	fetch = () => {

		const {
			pagination, customFiltersValues, quickFiltersValues, sorter,
			generalSearch, quickFiltersValueReady, customFiltersValueReady} = this.state;

		if (!quickFiltersValueReady || !customFiltersValueReady) {
			return;
		}

		this.setState({
			loading: true
		});

		const {resourceEndPoint, defaultFilters} = this.props.configurations;
		let params = {
			...defaultFilters
		};
		if (sorter) {
			const sortParam = `order[${sorter.columnKey}]`;
			const sortValue = sorter.order === 'descend' ? 'DESC' : 'ASC';
			params[sortParam] = sortValue;
		}

		const formattedFiltersValue = this.formatFiltersValueForFetch({
			...customFiltersValues,
			...quickFiltersValues
		});
		const formattedFiltersValueForUrl = this.formatFiltersValueForUpdateUrl({
			...customFiltersValues,
			...quickFiltersValues
		});

		params = JSON.parse(JSON.stringify(
			{
				...params,
				...formattedFiltersValue,
				page: pagination.current,
				search: generalSearch || undefined,
				itemsPerPage: pagination.pageSize,
			}
		));

		this.updateUrlParams(JSON.parse(JSON.stringify({
			...formattedFiltersValueForUrl,
			search: generalSearch || undefined
		})));

		apiClient.fetch(resourceEndPoint, {params}).then((response) => {
			const pagination = {...this.state.pagination};
			pagination.total = response.json['hydra:totalItems'];
			this.setState({
				data: response.json['hydra:member'].map((item) => {
					return {
						...item,
						key: item['@id'] || item.id
					};
				}),
				loading: false,
				fetched: true,
				pagination
			});
		});
	}

	handleListOnChange = (pagination, defaultFilters, sorter, customFiltersValues, quickFiltersValues) => {
		const pager = { ...this.state.pagination };

		let allFiltersValue = {};

		if (pagination) {
			pager.current = pagination.current;
			pager.pageSize = pagination.pageSize;
		} else {
			pager.current = 1;
		}

		if (customFiltersValues) {
			allFiltersValue['customFiltersValues'] = customFiltersValues;
		}

		if (quickFiltersValues) {
			allFiltersValue['quickFiltersValues'] = quickFiltersValues;
		}

		return new Promise((resolve) => {
			this.setState({
				...allFiltersValue,
				pagination: pager,
				sorter
			}, () => resolve());
		});

	}

	async filtersOnSubmit(filtersValue, isQuickFilter, ready, reset) {
		const {sorter, quickFiltersValues, customFiltersValues, quickFiltersValueReady, customFiltersValueReady} = this.state;
		if (isQuickFilter) {
			await this.handleListOnChange(null, null, sorter, null, {
				...quickFiltersValues,
				...filtersValue
			});
			this.setState({quickFiltersValueReady: ready || quickFiltersValueReady}, () => this.fetch());
		} else {
			const newCustomFiltersValues = reset ? {} : {
				...customFiltersValues,
				...filtersValue
			};
			await this.handleListOnChange(null, null, sorter, newCustomFiltersValues);
			this.setState({customFiltersValueReady: ready || customFiltersValueReady}, () => this.fetch());
		}
	}

	updateListScrollHeight = () => {
		const listHeadElement = this.contentRow.getElementsByClassName('ant-table-thead');
		const listFooterElement = this.contentRow.getElementsByClassName('ant-pagination ant-table-pagination');
		const listBodyElement = this.contentRow.getElementsByClassName('ant-table-tbody');
		if (listFooterElement[0] && listFooterElement[0]) {
			this.setState({
				listHeadHeight: listHeadElement[0].getBoundingClientRect().height,
				listFooterHeight: listFooterElement[0].getBoundingClientRect().height,
				listScrollHeight: this.contentRow.getBoundingClientRect().height,
				listScrollBodyHeight: listBodyElement[0].getBoundingClientRect().height
			});
		}
		if (this.listBodyElement) {
			this.listBodyElement.removeEventListener('scroll', this.listScroll);
		}
		this.listBodyElement = this.contentRow.getElementsByClassName('ant-table-body')[0];
		this.listBodyElement.addEventListener('scroll', this.listScroll);
	}

	listScroll = (event) => {
		const listHeaderElement = this.contentRow.getElementsByClassName('ant-table-header');
		if (listHeaderElement[0]) {
			const scrollLeft = event.target.scrollLeft;
			listHeaderElement[0].style.marginLeft = (-1 * scrollLeft).toString() + 'px';
		}

	}

	componentDidMount = () => {
		const tableState = {
			...this.table.state
		};
		if (tableState.sortColumn) {
			this.setState({
				sorter: {
					columnKey: tableState.sortColumn.key,
					field: undefined,
					order: tableState.sortOrder,
					column: tableState.sortColumn
				}
			});
		}

		window.addEventListener('resize', this.updateListScrollHeight);
		this.listScrollBodyElement = this.contentRow.getElementsByClassName('ant-table-content')[0];
		this.listElement = this.contentRow.getElementsByClassName('ant-table')[0];
		elementResizeEvent(this.listScrollBodyElement, this.updateListScrollHeight);
		this.listElement.addEventListener('scroll', this.listScroll);
		this.updateListScrollHeight();
		this.setGeneralSearchDefaultValue();
		// this.updateListScrollHeight = debounce(this.updateListScrollHeight, 100);
	}

	componentWillUnmount = () => {
		window.removeEventListener('resize', this.updateListScrollHeight);
		unbind(this.listScrollBodyElement);
		this.listBodyElement.removeEventListener('scroll', this.listScroll);
		this.listElement.removeEventListener('scroll', this.listScroll);
	}

	updateUrlParams = (filtersValue) => {
		const {history, location} = this.props;
		let searchArray = [];
		Object.keys(filtersValue).forEach(filterName => {
			searchArray.push(filterName + '=' + filtersValue[filterName]);
		});
		history.push({
			pathname: location.pathname,
			search: '?' + searchArray.join('&')
		});
	}

	setGeneralSearchDefaultValue = () => {
		const {location} = this.props;
		const params = getUrlParams(location.search);
		this.setState({generalSearch: params.search});
	}

	render () {
		const {filters, title, columns, actions, quickFilters} = this.props.configurations;
		const {location} = this.props;
		const {filtersOpened, data, pagination, loading, generalSearch,
			listScrollBodyHeight, listScrollHeight, listHeadHeight, listFooterHeight} = this.state;

		let scrollY = listScrollHeight - listFooterHeight - listHeadHeight;
		// hide scroll bar when not needed
		if (listScrollBodyHeight < scrollY) {
			scrollY = null;
		}

		return (
			<div className="list-layout">
				<div className="list-content">
					<div className="list-header-row">
						<div>
							<span className="list-title">{title}</span>
						</div>
						<div className="list-top-options">
							<div>
								<SearchField
									value={generalSearch}
									onSearchHandler={this.generalSearchChange}/>
							</div>
							{
								filters && filters.length ?
									<div>
										<Button
											id="list-filter-button" className="list-button"
											onClick={() => this.toggleFilterSideBar()} icon="filter"/>
									</div> : null
							}
							{<Actions primary={true} actions={actions} />}
						</div>
					</div>
					<Filters
						autoSubmit={true}
						filters={quickFilters || []}
						search={location.search}
						filtersSubmitCallback={(filtersValue, ready, reset) => this.filtersOnSubmit(filtersValue, true, ready, reset)}
					/>
					<div className="list-content-row" ref={(node) => this.contentRow = node}>
						<Table
							ref={(table) => this.table = table}
							columns={columns}
							dataSource={data}
							pagination={pagination}
							loading={loading}
							scroll={{y: scrollY}}
							onChange={(pagination, defaultFilters, sorter) => this.handleListOnChange(pagination, defaultFilters, sorter).then(() => this.fetch())}
						/>
					</div>
				</div>
				<div className={classNames('filters', {
					'closed': !filtersOpened
				})}>
					<div className="filters-head">
						<div className="filters-close">
							<Icon className="filters-close-button" onClick={() => this.toggleFilterSideBar(false)} type="close"/>
						</div>
						<div className="filters-title-row">
							<span className="filters-title">
								<EditableTransWrapper><Trans>Filtres</Trans></EditableTransWrapper>
							</span>
						</div>
					</div>
					<Filters
						filters={filters || []}
						filtersClosedChangeCallback={(open) => this.toggleFilterSideBar(open)}
						search={location.search}
						filtersSubmitCallback={(filtersValue, ready, reset) => this.filtersOnSubmit(filtersValue, false, ready, reset)}
					/>
				</div>
			</div>
		);
	}
}

export default withRouter(List);
