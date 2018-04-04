import React from 'react';
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';
import Steps from 'antd/lib/steps';
import Button from 'antd/lib/button';
import {Trans, withI18n} from 'lingui-react';
import EditableTransWrapper from 'wbc-components/lib/Translations/components/EditableTransWrapper';
import Form from 'antd/lib/form';
import './MultiStepsForm.scss';

class StepForm extends React.Component {
	render() {
		const {form, data} = this.props;
		return <this.props.stepForm form={form} {...data}/>;
	}
}

export const StepFormWrapper = Form.create()(StepForm);

class MultiStepsForm extends React.Component {

	state = {
		ready: true,
		currentStep: 0,
		submitting: false,
		stepStatus: {}
	}

	stepForms = []

	validateStep = (stepIdx) => {
		return new Promise((resolve, reject) => {
			this.stepForms[stepIdx].props.form.validateFields((err, values) => {
				if (err) {
					this.setState({
						stepStatus: {
							...this.state.stepStatus,
							[this.state.currentStep]: 'error'
						}
					});
					reject(err);
					return;
				}
				resolve(values);
			});
		});
	}

	nextStep = () => {
		const step = this.state.currentStep + 1;
		this.goToStep(step);
	}

	prevStep = () => {
		const step = this.state.currentStep - 1;
		this.goToStep(step);
	}

	goToStep = (step) => {
		this.validateStep(this.state.currentStep).then(
			() => {
				this.setState({
					currentStep: step,
					stepStatus: {
						...this.state.stepStatus,
						[step]: 'process',
						[this.state.currentStep]: 'finish'
					}
				});
			},
			() => {
				if (this.state.currentStep > step) {
					this.setState({
						stepStatus: {
							...this.state.stepStatus,
							[step]: 'process',
						},
						currentStep: step
					});
				}
			}
		);
	}

	handleApiError(error) {
		error.response.json().then(
			(body) => {
				if (body.violations && body.violations.length) {
					let stepStatus = {};
					let firstErrorStep;
					for (let key of Object.keys(this.stepForms)) {
						const stepForm = this.stepForms[key];
						const stepValues = stepForm.props.form.getFieldsValue();
						stepStatus[key] = 'finish';
						let fieldsWithError = {};
						for(let i = 0; i < body.violations.length; i++) {
							const fieldError = body.violations[i];
							if (stepValues.hasOwnProperty(fieldError.propertyPath)) {
								if (!firstErrorStep) firstErrorStep = key;
								stepStatus[key] = 'error';
								if (!fieldsWithError[fieldError.propertyPath]) {
									fieldsWithError[fieldError.propertyPath] = {
										value: stepValues[fieldError.propertyPath],
										errors: []
									};
								}
								fieldsWithError[fieldError.propertyPath].errors.push(new Error(fieldError.message));
							}
						}
						stepForm.props.form.setFields(fieldsWithError);
					}
					this.setState({
						currentStep: parseInt(firstErrorStep) || this.state.currentStep,
						stepStatus
					});
				}
			}
		);
	}


	async handleSubmit(e) {
		e.preventDefault();
		const {handleSubmit} = this.props;
		let formValues = {};
		let formValid = true;
		for (let key of Object.keys(this.stepForms)) {
			const values = await this.validateStep(key).catch(() => {
				formValid = false;
			});
			formValues = {
				...formValues,
				...values
			};
		}
		if (formValid) {
			this.setState({submitting: true});
			handleSubmit(formValues).then(
				() => {},
				(error) => {
					this.handleApiError(error);
					this.setState({submitting: false});
				}
			);
		}

	}

	getStepIdxById = (stepId) => {
		const {steps} = this.props;
		return steps.findIndex(step => step.id === stepId);
	}

	goToDefaultActiveStep = () => {
		const {defaultActiveStep} = this.props;
		const defaultActiveStepIdx = this.getStepIdxById(defaultActiveStep);
		if (defaultActiveStepIdx > -1) {
			this.setState({currentStep: defaultActiveStepIdx});
		}
	}

	componentDidMount() {
		this.goToDefaultActiveStep();
	}

	render() {
		const {ready, currentStep, submitting, stepStatus} = this.state;
		const {steps, submitButtonText} = this.props;
		const Step = Steps.Step;

		return (
			ready ? <div className="multi-steps-form">

				<Steps className="form-steps" current={currentStep}>
					{steps.map((step, idx) => <Step status={stepStatus[idx]} key={step.id} title={step.title} onClick={() => this.goToStep(idx)}/>)}
				</Steps>

				<Form>
					<div className="steps-content">
						{steps.map((step, idx) => {
							return <div style={{display: idx === currentStep ? 'block' : 'none'}} key={step.id}>
								<StepFormWrapper wrappedComponentRef={el => this.stepForms[idx] = el} stepForm={step.content} data={step.data} />
							</div>;
						})}
					</div>
					<div className="steps-action">
						<div>
							{
								currentStep > 0 &&
								<Button size="large" onClick={() => this.prevStep()}>
									<Icon type="left" />
									<EditableTransWrapper><Trans>Précédent</Trans></EditableTransWrapper>
								</Button>
							}
						</div>
						{
							currentStep < steps.length - 1 &&
							<Button size="large" type="primary" onClick={() => this.nextStep()}>
								<EditableTransWrapper><Trans>Suivant</Trans></EditableTransWrapper>
								<Icon type="right" />
							</Button>
						}
						{
							currentStep === steps.length - 1 &&
							<Button size="large" type="primary" loading={submitting} onClick={(e) => this.handleSubmit(e)}>
								{submitButtonText}
								<Icon type="right" />
							</Button>
						}
					</div>
				</Form>
			</div> : <Spin className="centered-spin" />
		);
	}
}


export default withI18n()(MultiStepsForm);