import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PenaltyCalibration } from '../../../src/components/game/PenaltyCalibration';

describe('PenaltyCalibration', () => {
  const mockPenalty = 'You must apologize at least once per answer';
  const mockOnComplete = vi.fn();

  describe('Rendering', () => {
    it('should render penalty text correctly', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText(mockPenalty)).toBeInTheDocument();
    });

    it('should show attempt counter for Suspect view', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText(/Practice Attempt 0 of 3/i)).toBeInTheDocument();
    });

    it('should show waiting message for Investigator view', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="investigator"
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText(/Read this aloud to the Suspect/i)).toBeInTheDocument();
      expect(screen.getByText(/Waiting for Suspect to complete 3 practice attempts/i)).toBeInTheDocument();
    });

    it('should show read-only view for Spectator', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="spectator"
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText(/Calibration in progress/i)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('3-Attempt Logic', () => {
    it('should increment counter when "I Practiced" button is clicked', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      // Initial state
      expect(screen.getByText(/Practice Attempt 0 of 3/i)).toBeInTheDocument();

      // Click "I Practiced"
      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });
      fireEvent.click(practiceButton);

      // Should increment to 1
      expect(screen.getByText(/Practice Attempt 1 of 3/i)).toBeInTheDocument();

      // Click again
      fireEvent.click(practiceButton);
      expect(screen.getByText(/Practice Attempt 2 of 3/i)).toBeInTheDocument();

      // Click third time
      fireEvent.click(practiceButton);
      expect(screen.getByText(/Practice Attempt 3 of 3/i)).toBeInTheDocument();
    });

    it('should disable "I Practiced" button after 3 attempts', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

      // Initially enabled
      expect(practiceButton).not.toBeDisabled();

      // Click 3 times
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);

      // Should be disabled after 3 attempts
      expect(practiceButton).toBeDisabled();
    });

    it('should enable "Continue" button only after 3 attempts', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

      // Initially disabled
      expect(continueButton).toBeDisabled();

      // After 1 attempt
      fireEvent.click(practiceButton);
      expect(continueButton).toBeDisabled();

      // After 2 attempts
      fireEvent.click(practiceButton);
      expect(continueButton).toBeDisabled();

      // After 3 attempts
      fireEvent.click(practiceButton);
      expect(continueButton).not.toBeDisabled();
    });

    it('should call onComplete when "Continue" button is clicked after 3 attempts', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

      // Complete 3 attempts
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);

      // Click Continue
      fireEvent.click(continueButton);

      // Should call onComplete
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should resume from currentAttempt prop if provided', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
          currentAttempt={2}
        />
      );

      // Should start at attempt 2
      expect(screen.getByText(/Practice Attempt 2 of 3/i)).toBeInTheDocument();

      // One more click should complete
      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });
      fireEvent.click(practiceButton);

      expect(screen.getByText(/Practice Attempt 3 of 3/i)).toBeInTheDocument();

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });
      expect(practiceButton).toHaveAccessibleName();

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      expect(continueButton).toHaveAccessibleName();
    });

    it('should announce attempt count changes with aria-live', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const liveRegion = screen.getByText(/Practice Attempt 0 of 3/i);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should support keyboard navigation', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

      // Should be keyboard focusable
      practiceButton.focus();
      expect(document.activeElement).toBe(practiceButton);
    });
  });

  describe('Edge Cases', () => {
    it('should not allow incrementing past 3 attempts', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      const practiceButton = screen.getByRole('button', { name: /I Practiced/i });

      // Click 4 times (should cap at 3)
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);
      fireEvent.click(practiceButton);

      expect(screen.getByText(/Practice Attempt 3 of 3/i)).toBeInTheDocument();
    });

    it('should handle missing penalty text gracefully', () => {
      render(
        <PenaltyCalibration
          penalty=""
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      // Should still render without crashing
      expect(screen.getByText(/Practice Attempt 0 of 3/i)).toBeInTheDocument();
    });

    it('should not render interactive elements for Spectator view', () => {
      render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="spectator"
          onComplete={mockOnComplete}
        />
      );

      expect(screen.queryByRole('button', { name: /I Practiced/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument();
    });
  });

  describe('Critical Constraint: No Timer', () => {
    it('should NOT initialize or start any timer', () => {
      // This test verifies that PenaltyCalibration does not interact with timer
      const { container } = render(
        <PenaltyCalibration
          penalty={mockPenalty}
          role="suspect"
          onComplete={mockOnComplete}
        />
      );

      // Verify no timer-related elements
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });
  });
});
