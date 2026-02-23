/**
 * Integration Tests: QuestionCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Tests: T019-T021
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestionCardImage from '../../../src/components/cards/QuestionCardImage';

describe('QuestionCardImage Component', () => {
  // T019: Test renders card image when cardImage is present
  it('renders card image when cardImage is present', () => {
    const cardImagePath = '/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png';
    const question = {
      id: 'small-talk-primary-1',
      type: 'primary' as const,
      text: 'What is your favorite memory?',
      examples: ['Example 1', 'Example 2'],
      cardImage: cardImagePath,
    };

    render(<QuestionCardImage question={question} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', cardImagePath);
  });

  // T020: Test renders fallback text when cardImage is undefined
  it('renders fallback text when cardImage is undefined', () => {
    const question = {
      id: 'small-talk-primary-1',
      type: 'primary' as const,
      text: 'What is your favorite memory?',
      examples: ['Example 1', 'Example 2'],
      // cardImage is undefined
    };

    render(<QuestionCardImage question={question} />);

    // Should render fallback text content
    const questionText = screen.getByText('What is your favorite memory?');
    expect(questionText).toBeInTheDocument();

    // Should NOT render an image
    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  // T021: Test has correct alt text for accessibility
  it('has correct alt text for accessibility', () => {
    const question = {
      id: 'small-talk-primary-1',
      type: 'primary' as const,
      text: 'What is your favorite memory?',
      examples: ['Example 1', 'Example 2'],
      cardImage: '/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png',
    };

    render(<QuestionCardImage question={question} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName();
    expect(image.getAttribute('alt')).toMatch(/primary.*What is your favorite memory/i);
  });

  it('lazy-loads images', () => {
    const question = {
      id: 'small-talk-secondary-2',
      type: 'secondary' as const,
      text: 'Describe your ideal vacation',
      examples: ['Beach', 'Mountains'],
      cardImage: '/assets/cards/investigator/01_small_talk_investigator_p3_c02_secondary-prompts.png',
    };

    render(<QuestionCardImage question={question} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders correctly with secondary question type', () => {
    const secondaryQuestion = {
      id: 'hopes-secondary-1',
      type: 'secondary' as const,
      text: 'What do you hope for in the future?',
      examples: ['Peace', 'Prosperity'],
      cardImage: '/assets/cards/investigator/05_hopes_investigator_p3_c01_secondary-prompts.png',
    };

    render(<QuestionCardImage question={secondaryQuestion} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('alt')).toMatch(/secondary.*What do you hope for/i);
  });

  it('renders fallback with examples visible', () => {
    const question = {
      id: 'imagination-primary-1',
      type: 'primary' as const,
      text: 'If you could be any animal, which would you choose?',
      examples: ['Eagle - for freedom', 'Dolphin - for intelligence'],
      // cardImage is undefined - should show fallback with examples
    };

    render(<QuestionCardImage question={question} />);

    const questionText = screen.getByText('If you could be any animal, which would you choose?');
    expect(questionText).toBeInTheDocument();

    // Examples should be visible in fallback
    const example1 = screen.getByText(/Eagle.*freedom/);
    const example2 = screen.getByText(/Dolphin.*intelligence/);
    expect(example1).toBeInTheDocument();
    expect(example2).toBeInTheDocument();
  });
});
