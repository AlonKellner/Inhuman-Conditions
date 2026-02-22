/**
 * Question Packets
 * 11 themed question sets with role variants
 * Full data will be populated in Phase 3
 */

import type { Packet } from '../types/packet';

// Placeholder packet for testing - will be expanded in Phase 3
export const packets: Packet[] = [
  {
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
        examples: ['What did you have for breakfast?', 'How was your commute?'],
      },
      {
        id: 'q2',
        type: 'secondary',
        text: 'What are your hobbies?',
        examples: ['Do you play any sports?', 'What do you do for fun?'],
      },
    ],
    roles: [
      {
        roleType: 'human',
        description: 'A normal human being',
        traits: ['Honest', 'Relaxed'],
      },
      {
        roleType: 'patient-robot',
        description: 'A robot with memory issues',
        fault: 'long-term-memory',
        traits: ['Evasive', 'Hesitant'],
      },
      {
        roleType: 'violent-robot',
        description: 'A dangerous robot',
        fault: 'self-preservation',
        traits: ['Aggressive'],
        tasks: ['Threaten the investigator', 'Mention violence'],
      },
    ],
  },
];
