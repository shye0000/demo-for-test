import React from 'react';
import SearchField from '../../../src/components/list/SearchField';
import { shallow } from 'enzyme';

const setup = () => {
	// simulate props
	const props = {
		// Jest mock function
		onSearchHandler: jest.fn( (e) => {

		})
	};

	// use enzyme provided "shallow" to render component
	const wrapper = shallow(<SearchField {...props} />);
	return {
		props,
		wrapper
	};
};

describe('SearchField', () => {
	const { wrapper, props } = setup();
	console.log(wrapper.find('input'));
	// case1
	// by checking input element to make sure the component is well rendered
	it('SearchField Component should render', () => {
		//.find(selector) is provided by Enzyme shallow Rendering, its used to find dom elements
		expect(wrapper.find('input').exists());
	});

	// case2
	it('When the Enter key was pressed, onSearchHandler() should be called', () => {
		// mock input and Enter pressed event
		const mockEvent = {
			keyCode: 13, // enter event
			target: {
				value: 'Test'
			}
		};

		// by using Enzyme simulate api to simulate DOM events
		wrapper.find('input').simulate('keyup', mockEvent);
		// check whether props.onSearchHandler has been called
		expect(props.onSearchHandler).toBeCalled();
	});

	// case2
	it('When value changed, onSearchHandler() should be called', () => {
		// by using Enzyme simulate api to simulate DOM events
		wrapper.find('input').simulate('change', { target: { value: 'Test' } });
		// check whether props.onSearchHandler has been called
		expect(props.onSearchHandler).toBeCalled();
	});

	// // case3
	// // 没有输入内容并敲下回车键，测试组件没有调用props的方法
	// it('When the Enter key was pressed without text, onSearchHandler() should not be called', () => {
	// 	// mock input 输入和 Enter事件
	// 	const mockEvent = {
	// 		keyCode: 13, // enter 事件
	// 		target: {
	// 			value: undefined
	// 		}
	// 	};
	// 	// 通过 Enzyme 提供的 simulate api 模拟 DOM 事件
	// 	wrapper.find('input').simulate('keyup', mockEvent);
	// 	// 判断 props.onAddClick 是否被调用
	// 	expect(props.onSearchHandler).not.toBeCalled();
	// });

	// // case4
	// // 创建完成后，input框被晴空
	// it('input value should be empty when todo is created', () => {
	// 	const mockEvent = {
	// 		keyCode: 13, // enter 事件
	// 		target: {
	// 			value: 'Test'
	// 		}
	// 	}
	// 	// 通过 Enzyme 提供的 simulate api 模拟 DOM 事件
	// 	wrapper.find('input').simulate('keyup',mockEvent)
	// 	expect(mockEvent.target.value === '')
	// })
});
