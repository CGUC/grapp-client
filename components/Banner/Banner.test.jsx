import renderer from 'react-test-renderer';
import React from 'react';
import Banner from './Banner';

it('renders without crashing', () => {
  const rendered = renderer.create(<Banner />).toJSON();
  expect(rendered).toBeTruthy();
});
