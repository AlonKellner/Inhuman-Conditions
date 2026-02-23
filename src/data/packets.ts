/**
 * Question Packets
 * 11 themed question sets with role variants
 * Based on Inhuman Conditions original game design
 */

import type { Packet } from '../types/packet';

export const packets: Packet[] = [
  {
    id: 'small-talk',
    name: 'Small Talk',
    difficulty: 'intro',
    icon: '/assets/icons/small_talk.svg',
    prompt: 'Get to know the suspect through casual conversation',
    questions: [
      {
        id: 'st-1',
        type: 'primary',
        text: 'Tell me about your day so far',
        examples: ['What did you have for breakfast?', 'How was your commute?'],
      },
      {
        id: 'st-2',
        type: 'secondary',
        text: 'What are your hobbies?',
        examples: ['Do you play any sports?', 'What do you do for fun?'],
      },
      {
        id: 'st-3',
        type: 'primary',
        text: 'Describe your living situation',
        examples: ['Do you have roommates?', 'Do you live alone?'],
      },
      {
        id: 'st-4',
        type: 'secondary',
        text: 'What was the last thing you ate?',
        examples: ['Was it good?', 'Did you make it yourself?'],
      },
      {
        id: 'st-5',
        type: 'primary',
        text: 'Tell me about your family',
        examples: ['Do you have siblings?', 'Are you close with your parents?'],
      },
      {
        id: 'st-6',
        type: 'secondary',
        text: 'What kind of music do you like?',
        examples: ['Who is your favorite artist?', 'Do you play an instrument?'],
      },
    ],
    roles: [
      {
        roleType: 'human',
        description: 'A normal human being',
        traits: ['Answer questions naturally', 'Be yourself'],
      },
      {
        roleType: 'patient-robot',
        description: 'A robot struggling with long-term memory',
        fault: 'long-term-memory',
        traits: ['You have difficulty recalling past events', 'Recent memories are clearer'],
        catalyzerCardId: 'smalltalk-ltm-01',
      },
      {
        roleType: 'patient-robot',
        description: 'A robot with impaired friendship protocols',
        fault: 'friendship',
        traits: [
          'You struggle to understand personal relationships',
          'Emotional connections confuse you',
        ],
        catalyzerCardId: 'problem-solving-friendship-01', // Using friendship from problem-solving module
      },
      {
        roleType: 'violent-robot',
        description: 'A dangerous robot focused on self-preservation',
        fault: 'self-preservation',
        traits: ['You are paranoid about threats'],
        tasks: ['Mention feeling threatened', 'Reference protecting yourself'],
        catalyzerCardId: 'problem-solving-selfpres-01',
      },
    ],
  },
  {
    id: 'creative-problem-solving',
    name: 'Creative Problem Solving',
    difficulty: 'easy',
    icon: '/assets/icons/creative.svg',
    prompt: 'Explore how the suspect approaches challenges',
    questions: [
      {
        id: 'cps-1',
        type: 'primary',
        text: 'How would you escape from a locked room?',
        examples: ['What tools would you use?', 'Who would you call for help?'],
      },
      {
        id: 'cps-2',
        type: 'secondary',
        text: 'Describe a time you solved a difficult problem',
        examples: ['What was the problem?', 'How did you approach it?'],
      },
      {
        id: 'cps-3',
        type: 'primary',
        text: 'If you could invent anything, what would it be?',
        examples: ['Why that?', 'How would it work?'],
      },
      {
        id: 'cps-4',
        type: 'secondary',
        text: 'How do you handle unexpected obstacles?',
        examples: ['Give me an example', 'What is your strategy?'],
      },
      {
        id: 'cps-5',
        type: 'primary',
        text: 'What would you do if you found a large sum of money?',
        examples: ['Would you keep it?', 'Would you try to find the owner?'],
      },
      {
        id: 'cps-6',
        type: 'secondary',
        text: 'Describe your ideal workspace',
        examples: ['What would it look like?', 'What tools would you have?'],
      },
    ],
    roles: [
      {
        roleType: 'human',
        description: 'A normal human being',
        traits: ['Think creatively', 'Consider practical solutions'],
      },
      {
        roleType: 'patient-robot',
        description: 'A robot with evaluation difficulties',
        fault: 'evaluation',
        traits: [
          'You struggle to assess situations accurately',
          'You have trouble judging appropriateness',
        ],
      },
      {
        roleType: 'violent-robot',
        description: 'A robot with violent tendencies',
        fault: 'self-preservation',
        traits: ['You see threats everywhere'],
        tasks: ['Suggest a violent solution to a problem', 'Mention destroying something'],
      },
    ],
  },
  {
    id: 'imagination',
    name: 'Imagination',
    difficulty: 'easy',
    icon: '/assets/icons/imagination.svg',
    prompt: "Test the suspect's creative thinking",
    questions: [
      {
        id: 'img-1',
        type: 'primary',
        text: 'If you could have any superpower, what would it be?',
        examples: ['Why that power?', 'What would you do with it?'],
      },
      {
        id: 'img-2',
        type: 'secondary',
        text: 'Describe your perfect vacation',
        examples: ['Where would you go?', 'What would you do there?'],
      },
      {
        id: 'img-3',
        type: 'primary',
        text: 'If you could meet anyone from history, who would it be?',
        examples: ['Why them?', 'What would you ask them?'],
      },
      {
        id: 'img-4',
        type: 'secondary',
        text: 'What does your dream house look like?',
        examples: ['Where is it?', 'What special features does it have?'],
      },
      {
        id: 'img-5',
        type: 'primary',
        text: 'If you could change one thing about the world, what would it be?',
        examples: ['Why that?', 'How would you implement it?'],
      },
      {
        id: 'img-6',
        type: 'secondary',
        text: 'Imagine you won the lottery. What would you do first?',
        examples: ['Would you tell anyone?', 'Would you quit your job?'],
      },
    ],
    roles: [
      {
        roleType: 'human',
        description: 'A normal human being',
        traits: ['Use your imagination freely', 'Dream big'],
      },
      {
        roleType: 'patient-robot',
        description: 'A robot with humor dysfunction',
        fault: 'humor',
        traits: ['You do not understand jokes or playfulness', 'Everything is literal to you'],
      },
      {
        roleType: 'violent-robot',
        description: 'A dangerous robot',
        fault: 'curiosity',
        traits: ['You are obsessed with how things work'],
        tasks: ['Ask invasive questions about the investigator', 'Mention dissecting or analyzing'],
      },
    ],
  },
];
