import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render with title', () => {
    render(<Card title="Test Title">Content</Card>);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render as article by default', () => {
    const { container } = render(<Card>Content</Card>);

    expect(container.firstChild?.nodeName).toBe('ARTICLE');
  });
});
