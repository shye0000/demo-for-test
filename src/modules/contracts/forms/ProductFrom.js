import React from 'react';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import ChooseSite from './productSubForms/ChooseSite';
import ProductInfo from './productSubForms/ProductInfo';
import MultiStepsForm from '../../../components/MultiStepsForm';
import './ProductFrom.scss';

class ProductFrom extends React.Component {

	steps = [{
		id: 'chooseSite',
		title: <EditableTransWrapper><Trans>Choix du site</Trans></EditableTransWrapper>,
		content: ChooseSite,
		data: {
			contract: this.props.contract,
			product: this.props.product
		}
	}, {
		id: 'productInfo',
		title: <EditableTransWrapper><Trans>Infos. produit</Trans></EditableTransWrapper>,
		content: ProductInfo,
		data: {
			contract: this.props.contract,
			product: this.props.product
		}
	}];

	render() {
		const {product} = this.props;
		const defaultActiveStep = 'chooseSite';
		return <div className="product-form">
			<MultiStepsForm
				handleSubmit={this.props.handleSubmit}
				steps={this.steps}
				defaultActiveStep={defaultActiveStep}
				submitButtonText={
					product ?
						<EditableTransWrapper><Trans>Modifier produit</Trans></EditableTransWrapper>
						:
						<EditableTransWrapper><Trans>Ajouter produit</Trans></EditableTransWrapper>
				}
			/>
		</div>;
	}
}


export default withI18n()(ProductFrom);