import React from 'react';
import apiClient from '../../../apiClient';
import Spin from 'antd/lib/spin';
import Button from 'antd/lib/button';
import {Link} from 'react-router-dom';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import {Trans} from 'lingui-react';
import DataPointTypes from '../../../apiConstants/DataPointTypes';
import './DataPoint.scss';

class DataPoint extends React.Component {
	state = {
		ready: false,
		dataPointCollection: null
	}

	async fetchDataPoints(url) {
		const {contact} = this.props;
		this.setState({ready: false});
		let requestOptions;
		if (!url) {
			url = '/data_points';
			requestOptions = {
				params: {
					['dataPointContacts.contact']: contact.id,
					['order[type]']: 'asc',
					page: 1,
					itemsPerPage: 10
				}
			};
		}
		const dataPointResponse = await apiClient.fetch(url, requestOptions).catch(
			() => this.setState({ready: true})
		);
		if (dataPointResponse.status === 200) {
			this.setState({
				ready: true,
				dataPointCollection: dataPointResponse.json
			});
		}
	}

	componentDidMount() {
		this.fetchDataPoints();
	}

	render() {
		const {dataPointCollection, ready} = this.state;

		return <div className="datapoint">
			<Spin spinning={!ready}  className="" indicator="">
				{
					dataPointCollection && dataPointCollection['hydra:member'].length ?
						<div>
							{
								dataPointCollection['hydra:member'].map((datapoint, idx) => {
									return (
										<div key={idx} className="datapoint-item">
											<div className="division">
												<Link to={'/divisions/split/'+datapoint.division.id}>
													{
														((datapoint.division.parent)
															? datapoint.division.parent.name +' > '+ datapoint.division.name
															: datapoint.division.name)
														+
														((datapoint.subDivision)
															? (
																(datapoint.subDivision.parent)
																	? ' > '+ datapoint.subDivision.parent.name +' > '+ datapoint.subDivision.name
																	: ' > '+ datapoint.subDivision.name)
															: ''
														)
													}
												</Link>
											</div>

											<EditableTransWrapper><Trans>Point de contact</Trans></EditableTransWrapper>
											&nbsp;
											<span className="lowercase"><EditableTransWrapper>
												<Trans id={DataPointTypes.filter(type => {
													return type.value === datapoint.type;
												})[0].label}/>
											</EditableTransWrapper></span>
										</div>
									);
								})
							}
							{
								(dataPointCollection['hydra:totalItems']>10)?
									<div className="pagination">
										<Button
											disabled={!dataPointCollection['hydra:view']['hydra:previous']}
											onClick={() => this.fetchDataPoints(
												dataPointCollection['hydra:view']['hydra:previous']
											)} icon="left" />
										<Button
											disabled={!dataPointCollection['hydra:view']['hydra:next']}
											onClick={() => this.fetchDataPoints(
												dataPointCollection['hydra:view']['hydra:next']
											)} icon="right" />
									</div>
									:null
							}
						</div>
						:
						<div className="empty-tag">
							<EditableTransWrapper><Trans>{'Ce salarié tiers n\'est inclus dans aucun point de contact'}</Trans></EditableTransWrapper>
						</div>
				}
			</Spin>
		</div>;

	}

}

export default DataPoint;