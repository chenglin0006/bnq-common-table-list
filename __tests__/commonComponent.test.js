import {shallow,mount} from 'enzyme';
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CommonComponent from '../src/index'
Enzyme.configure({ adapter: new Adapter() });
import renderer from 'react-test-renderer';

test('filter', () => {
    const props = {
        // Jest 提供的mock 函数
        testClick:jest.fn( (e) => {
            console.log('test','=============')
        }),
    }

    const component = renderer.create(
        <CommonComponent {...props}>Facebook</CommonComponent>,
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    const filterWrapperTest = mount(<CommonComponent {...props} />);
    filterWrapperTest.find('button.test').simulate('click');

});
