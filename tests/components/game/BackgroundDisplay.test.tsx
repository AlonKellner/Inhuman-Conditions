/**
 * BackgroundDisplay Component Tests
 * Tests for background selection and cycling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackgroundDisplay } from '../../../src/components/game/BackgroundDisplay';
import type { Background } from '../../../src/types/background';

// Mock the store
const mockCycleContent = vi.fn();
const mockUseGameStore = vi.fn();

vi.mock('../../../src/store/gameStore', () => ({
  useGameStore: () => mockUseGameStore(),
}));

describe('BackgroundDisplay', () => {
  const mockBackground: Background = {
    id: 'reality-tv',
    name: 'Reality TV Contestant',
    description: 'A charismatic person seeking fame and attention',
  };

  const mockStoreState = {
    selectedBackground: mockBackground,
    contentIndices: { packetIndex: 0, penaltyIndex: 0, backgroundIndex: 0, roleIndex: 0 },
    permutationSizes: { packets: 11, penalties: 18, backgrounds: 30, roles: 12 },
    cycleContent: mockCycleContent,
  };

  const mockOnContinue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGameStore.mockReturnValue(mockStoreState);
  });

  describe('Rendering', () => {
    it('should render background name', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('Reality TV Contestant')).toBeInTheDocument();
    });

    it('should render background description when provided', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('A charismatic person seeking fame and attention')).toBeInTheDocument();
    });

    it('should handle background without description', () => {
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        selectedBackground: { id: 'chef', name: 'Restaurant Chef' },
      });

      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('Restaurant Chef')).toBeInTheDocument();
      // Should not crash when description is missing
    });

    it('should render cycling buttons', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByLabelText('Previous background')).toBeInTheDocument();
      expect(screen.getByLabelText('Next background')).toBeInTheDocument();
      expect(screen.getByText('1 / 30')).toBeInTheDocument();
    });

    it('should handle missing background gracefully', () => {
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        selectedBackground: null,
      });

      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('No background selected')).toBeInTheDocument();
    });
  });

  describe('Suspect View', () => {
    it('should show main heading "Your Background"', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const heading = screen.getByRole('heading', { name: /Your Background/i });
      expect(heading).toBeInTheDocument();
    });

    it('should show instructions for suspect', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText(/You are playing the role of:/i)).toBeInTheDocument();
    });

    it('should show hint about answering during interview', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText(/answer questions as if you are this person/i)).toBeInTheDocument();
      expect(screen.getByText(/Remember your role, penalty, and restrictions/i)).toBeInTheDocument();
    });

    it('should show "I Understand" button for suspect', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const button = screen.getByText('I Understand');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should call onContinue when "I Understand" is clicked', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const button = screen.getByText('I Understand');
      fireEvent.click(button);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Investigator View', () => {
    it('should show "Suspect Background" heading for investigator', () => {
      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      const heading = screen.getByRole('heading', { name: /Suspect Background/i });
      expect(heading).toBeInTheDocument();
    });

    it('should show waiting message for investigator', () => {
      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Waiting for Suspect to continue/i)).toBeInTheDocument();
    });

    it('should show instructions that Suspect is reviewing', () => {
      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Suspect is reviewing their character background/i)).toBeInTheDocument();
    });

    it('should NOT show continue button for investigator', () => {
      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.queryByText('I Understand')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Continue to next stage')).not.toBeInTheDocument();
    });

    it('should still show background name for investigator', () => {
      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('Reality TV Contestant')).toBeInTheDocument();
    });
  });

  describe('Spectator View', () => {
    it('should show "Suspect Background" heading for spectator', () => {
      render(<BackgroundDisplay role="spectator" onContinue={mockOnContinue} />);

      const heading = screen.getByRole('heading', { name: /Suspect Background/i });
      expect(heading).toBeInTheDocument();
    });

    it('should show waiting message for spectator', () => {
      render(<BackgroundDisplay role="spectator" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Waiting for Suspect to review background/i)).toBeInTheDocument();
    });

    it('should NOT show continue button for spectator', () => {
      render(<BackgroundDisplay role="spectator" onContinue={mockOnContinue} />);

      expect(screen.queryByText('I Understand')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Continue to next stage')).not.toBeInTheDocument();
    });

    it('should still show background name and description for spectator', () => {
      render(<BackgroundDisplay role="spectator" onContinue={mockOnContinue} />);

      expect(screen.getByText('Reality TV Contestant')).toBeInTheDocument();
      expect(screen.getByText('A charismatic person seeking fame and attention')).toBeInTheDocument();
    });
  });

  describe('Cycling Functionality', () => {
    it('should call cycleContent with "previous" when previous button clicked', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const prevButton = screen.getByLabelText('Previous background');
      fireEvent.click(prevButton);

      expect(mockCycleContent).toHaveBeenCalledWith('background', 'previous');
    });

    it('should call cycleContent with "next" when next button clicked', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const nextButton = screen.getByLabelText('Next background');
      fireEvent.click(nextButton);

      expect(mockCycleContent).toHaveBeenCalledWith('background', 'next');
    });

    it('should update counter display when index changes', () => {
      const { rerender } = render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('1 / 30')).toBeInTheDocument();

      // Simulate index change from store
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        contentIndices: { ...mockStoreState.contentIndices, backgroundIndex: 15 },
      });

      rerender(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('16 / 30')).toBeInTheDocument();
    });

    it('should allow cycling for investigator role', () => {
      vi.clearAllMocks();
      mockUseGameStore.mockReturnValue(mockStoreState);

      render(<BackgroundDisplay role="investigator" onContinue={mockOnContinue} />);

      const nextButton = screen.getByLabelText('Next background');
      fireEvent.click(nextButton);

      expect(mockCycleContent).toHaveBeenCalledWith('background', 'next');
    });

    it('should allow cycling for suspect role', () => {
      vi.clearAllMocks();
      mockUseGameStore.mockReturnValue(mockStoreState);

      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const nextButton = screen.getByLabelText('Next background');
      fireEvent.click(nextButton);

      expect(mockCycleContent).toHaveBeenCalledWith('background', 'next');
    });

    it('should allow cycling for spectator role', () => {
      vi.clearAllMocks();
      mockUseGameStore.mockReturnValue(mockStoreState);

      render(<BackgroundDisplay role="spectator" onContinue={mockOnContinue} />);

      const nextButton = screen.getByLabelText('Next background');
      fireEvent.click(nextButton);

      expect(mockCycleContent).toHaveBeenCalledWith('background', 'next');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on cycling buttons', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const prevButton = screen.getByLabelText('Previous background');
      const nextButton = screen.getByLabelText('Next background');

      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toHaveAttribute('aria-label', 'Previous background');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveAttribute('aria-label', 'Next background');
    });

    it('should have proper ARIA label on continue button', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const button = screen.getByLabelText('Continue to next stage');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('I Understand');
    });

    it('should have heading for screen readers', () => {
      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      const heading = screen.getByRole('heading', { name: /Your Background/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long background names', () => {
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        selectedBackground: {
          id: 'long',
          name: 'Very Long Professional Title With Multiple Words That Might Wrap',
        },
      });

      render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText('Very Long Professional Title With Multiple Words That Might Wrap')).toBeInTheDocument();
    });

    it('should handle cycling at boundary indices', () => {
      // Test at first index (0)
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        contentIndices: { ...mockStoreState.contentIndices, backgroundIndex: 0 },
      });

      const { rerender } = render(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);
      expect(screen.getByText('1 / 30')).toBeInTheDocument();

      // Test at last index (29)
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        contentIndices: { ...mockStoreState.contentIndices, backgroundIndex: 29 },
      });

      rerender(<BackgroundDisplay role="suspect" onContinue={mockOnContinue} />);
      expect(screen.getByText('30 / 30')).toBeInTheDocument();
    });
  });
});
