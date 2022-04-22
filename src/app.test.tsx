import { render } from '@testing-library/react';
import App from './app';

describe('<App />', () => {
  it('should render the app', () => {
    render(<App initialProps={{}} Component={() => null} />);

    expect(document.querySelector('#App')).toBeInTheDocument();
  });
});