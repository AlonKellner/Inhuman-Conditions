/**
 * Integration Tests: CatalyzerCardImage Component
 * Feature: 003-pdf-asset-extraction (US5)
 * Tests: T015-T018
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalyzerCardImage from '../../../src/components/cards/CatalyzerCardImage';

describe('CatalyzerCardImage Component', () => {
  // T015: Test renders card image when cardImage is present
  it('renders card image when cardImage is present', () => {
    const cardImagePath = '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png';
    const card = {
      id: 'small-talk-human-1',
      packetId: 'small-talk',
      roleType: 'patient-robot' as const,
      fault: 'long-term-memory' as const,
      description: 'Test card',
      traits: ['trait1'],
      inducerMazeImage: '/assets/mazes/test.png',
      cardImage: cardImagePath,
    };

    render(<CatalyzerCardImage card={card} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', cardImagePath);
  });

  // T016: Test renders fallback widget when cardImage is undefined
  it('renders fallback widget when cardImage is undefined', () => {
    const card = {
      id: 'small-talk-human-1',
      packetId: 'small-talk',
      roleType: 'patient-robot' as const,
      fault: 'long-term-memory' as const,
      description: 'Test card',
      traits: ['trait1'],
      inducerMazeImage: '/assets/mazes/test.png',
      // cardImage is undefined
    };

    render(<CatalyzerCardImage card={card} />);

    // Should render fallback content (not an image)
    const fallback = screen.queryByTestId('catalyzer-card-fallback');
    expect(fallback).toBeInTheDocument();

    // Should NOT render an image
    const image = screen.queryByRole('img');
    expect(image).not.toBeInTheDocument();
  });

  // T017: Test has correct alt text for accessibility
  it('has correct alt text for accessibility', () => {
    const card = {
      id: 'small-talk-human-1',
      packetId: 'small-talk',
      roleType: 'patient-robot' as const,
      fault: 'long-term-memory' as const,
      description: 'Test card',
      traits: ['trait1'],
      inducerMazeImage: '/assets/mazes/test.png',
      cardImage: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',
    };

    render(<CatalyzerCardImage card={card} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName();
    expect(image.getAttribute('alt')).toMatch(/small-talk.*patient-robot/i);
  });

  // T018: Test lazy-loads images
  it('lazy-loads images', () => {
    const card = {
      id: 'small-talk-human-1',
      packetId: 'small-talk',
      roleType: 'patient-robot' as const,
      fault: 'long-term-memory' as const,
      description: 'Test card',
      traits: ['trait1'],
      inducerMazeImage: '/assets/mazes/test.png',
      cardImage: '/assets/cards/suspect/01_small_talk_suspect_p1_c01_human-card.png',
    };

    render(<CatalyzerCardImage card={card} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders correctly with different role types', () => {
    const violentCard = {
      id: 'threat-violent-1',
      packetId: 'threat-assessment',
      roleType: 'violent-robot' as const,
      fault: 'self-preservation' as const,
      description: 'Violent robot card',
      traits: ['aggressive'],
      tasks: ['task1', 'task2'],
      inducerMazeImage: '/assets/mazes/test.png',
      cardImage: '/assets/cards/suspect/08_threat_suspect_p3_c01_violent-card.png',
    };

    render(<CatalyzerCardImage card={violentCard} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('alt')).toMatch(/threat-assessment.*violent-robot/i);
  });
});
