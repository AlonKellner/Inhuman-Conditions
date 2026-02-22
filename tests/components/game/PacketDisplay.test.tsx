/**
 * PacketDisplay Component Tests
 * Tests for packet selection and cycling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PacketDisplay } from '../../../src/components/game/PacketDisplay';
import type { Packet } from '../../../src/types/packet';
import { RoleType } from '../../../src/types';

// Mock the store
const mockCycleContent = vi.fn();
const mockUseGameStore = vi.fn();

vi.mock('../../../src/store/gameStore', () => ({
  useGameStore: () => mockUseGameStore(),
}));

describe('PacketDisplay', () => {
  const mockPacket: Packet = {
    id: 'small-talk',
    name: 'Small Talk',
    difficulty: 'intro',
    icon: '📞',
    prompt: 'Get to know the suspect through casual conversation',
    questions: [
      {
        id: 'q1',
        type: 'primary',
        text: 'Tell me about your day',
        examples: ['What did you have for breakfast?'],
      },
      {
        id: 'q2',
        type: 'secondary',
        text: 'What are your hobbies?',
        examples: ['Do you play any sports?'],
      },
    ],
    roles: [],
  };

  const mockStoreState = {
    selectedPacket: mockPacket,
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
    it('should render packet name and icon', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('Small Talk')).toBeInTheDocument();
      expect(screen.getByText('📞')).toBeInTheDocument();
    });

    it('should render difficulty level', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Difficulty:/i)).toBeInTheDocument();
      expect(screen.getByText(/intro/i)).toBeInTheDocument();
    });

    it('should render cycling buttons', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByLabelText('Previous packet')).toBeInTheDocument();
      expect(screen.getByLabelText('Next packet')).toBeInTheDocument();
      expect(screen.getByText('1 / 11')).toBeInTheDocument();
    });

    it('should handle missing packet gracefully', () => {
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        selectedPacket: null,
      });

      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('No packet selected')).toBeInTheDocument();
    });
  });

  describe('Investigator View', () => {
    it('should show prompt for investigator', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Investigator Prompt:/i)).toBeInTheDocument();
      expect(screen.getByText(mockPacket.prompt)).toBeInTheDocument();
    });

    it('should show full question list for investigator', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('Tell me about your day')).toBeInTheDocument();
      expect(screen.getByText('What are your hobbies?')).toBeInTheDocument();
      expect(screen.getByText(/Questions \(2\):/i)).toBeInTheDocument();
    });

    it('should show question types', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const primaryLabels = screen.getAllByText('(primary)');
      const secondaryLabels = screen.getAllByText('(secondary)');

      expect(primaryLabels.length).toBeGreaterThan(0);
      expect(secondaryLabels.length).toBeGreaterThan(0);
    });

    it('should show continue button for investigator', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).not.toBeDisabled();
    });

    it('should call onContinue when continue button is clicked', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const continueButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Suspect View', () => {
    it('should NOT show investigator prompt for suspect', () => {
      render(<PacketDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.queryByText(/Investigator Prompt:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(mockPacket.prompt)).not.toBeInTheDocument();
    });

    it('should NOT show question list for suspect', () => {
      render(<PacketDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.queryByText('Tell me about your day')).not.toBeInTheDocument();
      expect(screen.queryByText('What are your hobbies?')).not.toBeInTheDocument();
    });

    it('should show waiting message for suspect', () => {
      render(<PacketDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText(/Waiting for Investigator to continue/i)).toBeInTheDocument();
    });

    it('should show instructions for suspect', () => {
      render(<PacketDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.getByText(/will ask you questions/i)).toBeInTheDocument();
      expect(screen.getByText(/will not see the questions in advance/i)).toBeInTheDocument();
    });

    it('should NOT show continue button for suspect', () => {
      render(<PacketDisplay role="suspect" onContinue={mockOnContinue} />);

      expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument();
    });
  });

  describe('Spectator View', () => {
    it('should show read-only view for spectator', () => {
      render(<PacketDisplay role="spectator" onContinue={mockOnContinue} />);

      expect(screen.getByText('Small Talk')).toBeInTheDocument();
      expect(screen.getByText(/Waiting for players to select packet/i)).toBeInTheDocument();
    });

    it('should NOT show continue button for spectator', () => {
      render(<PacketDisplay role="spectator" onContinue={mockOnContinue} />);

      expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument();
    });
  });

  describe('Cycling Functionality', () => {
    it('should call cycleContent with "previous" when previous button clicked', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const prevButton = screen.getByLabelText('Previous packet');
      fireEvent.click(prevButton);

      expect(mockCycleContent).toHaveBeenCalledWith('packet', 'previous');
    });

    it('should call cycleContent with "next" when next button clicked', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const nextButton = screen.getByLabelText('Next packet');
      fireEvent.click(nextButton);

      expect(mockCycleContent).toHaveBeenCalledWith('packet', 'next');
    });

    it('should update counter display when index changes', () => {
      const { rerender } = render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('1 / 11')).toBeInTheDocument();

      // Simulate index change from store
      mockUseGameStore.mockReturnValue({
        ...mockStoreState,
        contentIndices: { ...mockStoreState.contentIndices, packetIndex: 5 },
      });

      rerender(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      expect(screen.getByText('6 / 11')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const prevButton = screen.getByLabelText('Previous packet');
      const nextButton = screen.getByLabelText('Next packet');
      const continueButton = screen.getByRole('button', { name: /Continue/i });

      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toHaveAttribute('aria-label', 'Previous packet');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveAttribute('aria-label', 'Next packet');
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toHaveAttribute('aria-label', 'Continue to next stage');
    });

    it('should have heading for screen readers', () => {
      render(<PacketDisplay role="investigator" onContinue={mockOnContinue} />);

      const heading = screen.getByRole('heading', { name: /Question Packet/i });
      expect(heading).toBeInTheDocument();
    });
  });
});
