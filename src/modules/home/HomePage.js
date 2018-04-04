import React from 'react';
import {connect} from 'react-redux';
import {NavLink} from 'react-router-dom';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './styles/_homePage.scss';

const mapStateToProps = (state) => {
	return {
		language: state.trans.language
	};
};

class HomePage extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="home">
				<div className="home-header">
					<EditableTransWrapper><Trans>Bienvenue</Trans></EditableTransWrapper>
				</div>
				{/*todo Supprimer la classe css disabled sur les Col pour activer la redirection lorsque les pages seront pretes*/}
				<div className="home-content">
					<Row gutter={16}>
						<Col className="home-tiles" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/divisions">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/organisation.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Organisations</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/contracts">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/file-double.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Contrats et devis</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/siren.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Urgences</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/warning.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Journal des anomalies</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
					</Row>
					<Row gutter={16}>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg type={import('../../../icons/sink.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Calendrier assainissement</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/broom.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Calendrier ramonage</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/spray.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Calendrier dégraissage</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
						<Col className="home-tiles disabled" xs={{ span: 24}} sm={{ span: 12}} md={{ span: 6}} lg={{ span: 6}} xl={{ span: 6}} span={6}>
							<NavLink to="/">
								<div className="home-tiles-content">
									<div className="home-tiles-icon">
										<IconSvg  type={import('../../../icons/euro.svg')}/>
									</div>
									<div className="home-tiles-title">
										<EditableTransWrapper><Trans>Factures</Trans></EditableTransWrapper>
									</div>
								</div>
							</NavLink>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps)(HomePage);