import { render, screen } from '@testing-library/react';
import Footer from './components/Footer';

test('renders footer author and copyright', () => {
  render(<Footer />);
  const authorElement = screen.getByText(/Renan Willian/i);
  expect(authorElement).toBeInTheDocument();
});
