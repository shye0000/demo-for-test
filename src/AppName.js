import React from 'react';
import {Link} from 'react-router-dom';
import cheet from 'cheet.js';
import classNames from 'classnames';
import WordShuffler from './WordShuffler';
import IconSvg from 'wbc-components/lib/IconSvg/IconSvg';
import './AppName.scss';

class AppName extends React.Component {

	state = { qhs: 0 }

	componentDidMount() {
		let qhs;
		cheet('q h s q h s q h s', {
			next: (str, key, num) => {
				clearTimeout(qhs);
				const count = num + 1;
				if (count === 3) {
					this.setState({
						qhs: 1
					});
				} else if (count === 6) {
					this.setState({
						qhs: 2
					});
				}
			},
			fail: () => {
				this.setState({
					qhs: 0
				});
			},
			done: () => {
				this.setState({
					qhs: 3
				}, () => {
					new WordShuffler(this.shuffler, {
						textColor : '#fff',
						timeOffset : 4,
						mixCapital : true,
						mixSpecialCharacters : true
					});
					qhs = setTimeout(() => {
						this.setState({qhs: 0});
					}, 6000);
				});
			}
		});
		cheet('esc', {
			done: () => {
				this.setState({
					qhs: 0
				});
			}
		});
	}

	componentWillUnmount() {
		cheet.disable('esc');
		cheet.disable('q h s q h s q h s');
	}

	render() {
		const {qhs} = this.state;

		return (
			<div className={classNames('app-name', {qhs: qhs===3})}>
				{
					qhs === 3 ?
						<Link to="/" id="app-name-text">
							<div className="shuffler-wrapper">
								<IconSvg type={import('../icons/QHS.svg')}/>
								<span ref={shuffler => this.shuffler = shuffler}>Made by WEBCENTRIC</span>
							</div>
						</Link>
						:
						<Link to="/" id="app-name-text" className={classNames({
							'shake': qhs === 1,
							'rubberBand': qhs === 2
						})}>
							<IconSvg type={import('../icons/QHS.svg')}/>
						</Link>
				}
			</div>
		);
	}
}

export default AppName;
