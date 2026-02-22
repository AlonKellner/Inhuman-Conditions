import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('should render current step and total steps', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={10} />);

    expect(screen.getByText(/Step 3 of 10/i)).toBeInTheDocument();
  });

  it('should render progress dots', () => {
    const { container } = render(<ProgressIndicator currentStep={2} totalSteps={5} />);

    const dots = container.querySelectorAll('[role="presentation"]');
    expect(dots.length).toBe(5);
  });

  it('should highlight current step dot', () => {
    const { container } = render(<ProgressIndicator currentStep={3} totalSteps={5} />);

    const dots = container.querySelectorAll('[role="presentation"]');
    // Check that the 3rd dot (index 2) is active
    expect(dots[2]).toHaveClass('active');
  });

  it('should render without dots when showDots is false', () => {
    const { container } = render(
      <ProgressIndicator currentStep={3} totalSteps={10} showDots={false} />
    );

    const dots = container.querySelectorAll('[role="presentation"]');
    expect(dots.length).toBe(0);
  });

  it('should handle edge case of step 1', () => {
    render(<ProgressIndicator currentStep={1} totalSteps={10} />);

    expect(screen.getByText(/Step 1 of 10/i)).toBeInTheDocument();
  });

  it('should handle edge case of last step', () => {
    render(<ProgressIndicator currentStep={10} totalSteps={10} />);

    expect(screen.getByText(/Step 10 of 10/i)).toBeInTheDocument();
  });
});
