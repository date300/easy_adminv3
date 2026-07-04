import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the download page at /download', () => {
  window.history.pushState({}, '', '/download');
  render(<App />);

  expect(screen.getByText(/download our app/i)).toBeInTheDocument();
});
