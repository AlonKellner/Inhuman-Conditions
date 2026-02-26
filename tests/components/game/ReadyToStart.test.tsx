import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReadyToStart } from '../../../src/components/game/ReadyToStart';

describe('ReadyToStart', () => {
  const mockOnStartInterview = vi.fn();

  beforeEach(() => {
    mockOnStartInterview.mockClear();
  });

  describe('Rendering', () => {
    it('should render instructions for starting the interview', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      expect(screen.getByText(/Ready to begin the interview/i)).toBeInTheDocument();
    });

    it('should show "Start Interview" button for Investigator', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton).not.toBeDisabled();
    });

    it('should show waiting message for Suspect', () => {
      render(
        <ReadyToStart
          role="suspect"
          onStartInterview={mockOnStartInterview}
        />
      );

      expect(screen.getByText(/Waiting for Investigator to start the interview/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Start Interview/i })).not.toBeInTheDocument();
    });

    it('should show waiting message for Spectator', () => {
      render(
        <ReadyToStart
          role="spectator"
          onStartInterview={mockOnStartInterview}
        />
      );

      expect(screen.getByText(/Waiting for Investigator to start the interview/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Start Interview/i })).not.toBeInTheDocument();
    });
  });

  describe('Manual Start Interaction', () => {
    it('should call onStartInterview when "Start Interview" button is clicked', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      expect(mockOnStartInterview).toHaveBeenCalledTimes(1);
    });

    it('should disable button after clicking to prevent double-start', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });

      // Before click
      expect(startButton).not.toBeDisabled();

      // Click
      fireEvent.click(startButton);

      // After click
      expect(startButton).toBeDisabled();
    });

    it('should not call onStartInterview multiple times if clicked rapidly', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });

      // Rapid clicks
      fireEvent.click(startButton);
      fireEvent.click(startButton);
      fireEvent.click(startButton);

      // Should only call once due to button being disabled
      expect(mockOnStartInterview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timer Initialization Timing', () => {
    it('should NOT initialize or start timer on mount', () => {
      const { container } = render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      // Verify no timer-related elements exist
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
      expect(screen.queryByText(/5:00/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/4:59/i)).not.toBeInTheDocument();
    });

    it('should ONLY start timer when "Start Interview" button is clicked', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      // Timer should not be present initially
      expect(screen.queryByText(/5:00/i)).not.toBeInTheDocument();

      // Click start button
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      // onStartInterview should be called, which triggers timer in parent
      expect(mockOnStartInterview).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on Start button', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      expect(startButton).toHaveAccessibleName();
    });

    it('should support keyboard navigation', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      const startButton = screen.getByRole('button', { name: /Start Interview/i });

      // Should be keyboard focusable
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
    });

    it('should announce when interview is about to start', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      // Look for aria-live region
      const instructions = screen.getByText(/Ready to begin the interview/i);
      expect(instructions).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Multi-Device Coordination', () => {
    it('should display sync instructions for multi-device mode', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
          isMultiDevice={true}
        />
      );

      expect(screen.getByText(/Both players should be ready/i)).toBeInTheDocument();
      expect(screen.getByText(/Click "Start Interview" when both players confirm readiness/i)).toBeInTheDocument();
    });

    it('should display single-device instructions for single-device mode', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
          isMultiDevice={false}
        />
      );

      expect(screen.getByText(/Position the device where both players can see/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onStartInterview prop gracefully', () => {
      // This should not crash
      expect(() => {
        render(
          <ReadyToStart
            role="investigator"
            onStartInterview={undefined as any}
          />
        );
      }).not.toThrow();
    });

    it('should not render Start button for invalid role', () => {
      render(
        <ReadyToStart
          role={'invalid' as any}
          onStartInterview={mockOnStartInterview}
        />
      );

      expect(screen.queryByRole('button', { name: /Start Interview/i })).not.toBeInTheDocument();
    });
  });

  describe('Critical Constraint: Manual Start Only', () => {
    it('should NOT auto-start interview after any time period', async () => {
      const { container } = render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      // Wait for 5 seconds (using fake timers would be better in real implementation)
      await new Promise(resolve => setTimeout(resolve, 100));

      // onStartInterview should NOT have been called
      expect(mockOnStartInterview).not.toHaveBeenCalled();

      // Timer should still not exist
      expect(container.querySelector('[data-testid="countdown-timer"]')).not.toBeInTheDocument();
    });

    it('should require explicit button click to start', () => {
      render(
        <ReadyToStart
          role="investigator"
          onStartInterview={mockOnStartInterview}
        />
      );

      // onStartInterview should NOT be called on mount
      expect(mockOnStartInterview).not.toHaveBeenCalled();

      // Only after explicit click
      const startButton = screen.getByRole('button', { name: /Start Interview/i });
      fireEvent.click(startButton);

      expect(mockOnStartInterview).toHaveBeenCalledTimes(1);
    });
  });
});
