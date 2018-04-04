import React from 'react';
import {Link} from 'react-router-dom';
import {Trans} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import './NotFoundPage.scss';

export class NotFoundPage extends React.Component {
	componentWillMount() {
		const {staticContext} = this.props;
		if (staticContext) {
			staticContext.is404 = true;
		}
	}

	render() {
		return (
			<div className="not-found">
				<h1>404</h1>
				<h2>
					<EditableTransWrapper><Trans>Page non trouvée!</Trans></EditableTransWrapper>
				</h2>
				<p>
					<Link to="/">
						<EditableTransWrapper><Trans>{'Retournez à la page d\'accueil'}</Trans></EditableTransWrapper>
					</Link>
				</p>
			</div>
		);
	}
}

export default NotFoundPage;
