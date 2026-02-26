/**
 * CyclingButtons Component Tests
 * Tests for the reusable cycling control component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CyclingButtons } from '../../../src/components/game/CyclingButtons';

describe('CyclingButtons', () => {
  const mockOnPrevious = vi.fn();
  const mockOnNext = vi.fn();

  const defaultProps = {
    label: 'Penalty',
    currentIndex: 0,
    totalItems: 18,
    onPrevious: mockOnPrevious,
    onNext: mockOnNext,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render label correctly', () => {
      render(<CyclingButtons {...defaultProps} />);
      expect(screen.getByText('Penalty')).toBeInTheDocument();
    });

    it('should render counter with 1-based index', () => {
      render(<CyclingButtons {...defaultProps} currentIndex={0} />);
      // Index 0 should display as "1 / 18" (1-based for users)
      expect(screen.getByText('1 / 18')).toBeInTheDocument();
    });

    it('should render counter correctly for different indices', () => {
      const { rerender } = render(<CyclingButtons {...defaultProps} currentIndex={5} />);
      expect(screen.getByText('6 / 18')).toBeInTheDocument();

      rerender(<CyclingButtons {...defaultProps} currentIndex={17} />);
      expect(screen.getByText('18 / 18')).toBeInTheDocument();
    });

    it('should render previous button with correct label', () => {
      render(<CyclingButtons {...defaultProps} />);
      const prevButton = screen.getByLabelText('Previous penalty');
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toHaveTextContent('<');
    });

    it('should render next button with correct label', () => {
      render(<CyclingButtons {...defaultProps} />);
      const nextButton = screen.getByLabelText('Next penalty');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveTextContent('>');
    });

    it('should use label in aria-label for buttons', () => {
      render(<CyclingButtons {...defaultProps} label="Packet" />);
      expect(screen.getByLabelText('Previous packet')).toBeInTheDocument();
      expect(screen.getByLabelText('Next packet')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onPrevious when previous button is clicked', () => {
      render(<CyclingButtons {...defaultProps} />);
      const prevButton = screen.getByLabelText('Previous penalty');

      fireEvent.click(prevButton);

      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should call onNext when next button is clicked', () => {
      render(<CyclingButtons {...defaultProps} />);
      const nextButton = screen.getByLabelText('Next penalty');

      fireEvent.click(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
      expect(mockOnPrevious).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks correctly', () => {
      render(<CyclingButtons {...defaultProps} />);
      const prevButton = screen.getByLabelText('Previous penalty');
      const nextButton = screen.getByLabelText('Next penalty');

      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(prevButton);

      expect(mockOnNext).toHaveBeenCalledTimes(2);
      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State', () => {
    it('should disable both buttons when disabled prop is true', () => {
      render(<CyclingButtons {...defaultProps} disabled={true} />);

      const prevButton = screen.getByLabelText('Previous penalty');
      const nextButton = screen.getByLabelText('Next penalty');

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should not call handlers when disabled', () => {
      render(<CyclingButtons {...defaultProps} disabled={true} />);

      const prevButton = screen.getByLabelText('Previous penalty');
      const nextButton = screen.getByLabelText('Next penalty');

      fireEvent.click(prevButton);
      fireEvent.click(nextButton);

      expect(mockOnPrevious).not.toHaveBeenCalled();
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should enable buttons when disabled prop is false', () => {
      render(<CyclingButtons {...defaultProps} disabled={false} />);

      const prevButton = screen.getByLabelText('Previous penalty');
      const nextButton = screen.getByLabelText('Next penalty');

      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live region on counter', () => {
      render(<CyclingButtons {...defaultProps} />);
      const counter = screen.getByText('1 / 18');

      expect(counter).toHaveAttribute('aria-live', 'polite');
      expect(counter).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have title attributes for tooltip', () => {
      render(<CyclingButtons {...defaultProps} />);

      const prevButton = screen.getByLabelText('Previous penalty');
      const nextButton = screen.getByLabelText('Next penalty');

      expect(prevButton).toHaveAttribute('title', 'Previous penalty');
      expect(nextButton).toHaveAttribute('title', 'Next penalty');
    });
  });

  describe('Different Content Types', () => {
    it('should work with "Packet" label', () => {
      render(<CyclingButtons {...defaultProps} label="Packet" totalItems={11} />);

      expect(screen.getByText('Packet')).toBeInTheDocument();
      expect(screen.getByText('1 / 11')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous packet')).toBeInTheDocument();
    });

    it('should work with "Background" label', () => {
      render(<CyclingButtons {...defaultProps} label="Background" totalItems={30} />);

      expect(screen.getByText('Background')).toBeInTheDocument();
      expect(screen.getByText('1 / 30')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous background')).toBeInTheDocument();
    });

    it('should work with "Role" label', () => {
      render(<CyclingButtons {...defaultProps} label="Role" totalItems={12} />);

      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('1 / 12')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous role')).toBeInTheDocument();
    });
  });
});
