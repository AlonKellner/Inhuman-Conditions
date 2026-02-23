import type { RoleType, RobotFault } from '../types/role';

/**
 * Catalyzer Card Data
 * Extracted from official Inhuman Conditions game PDFs
 * Each card represents a specific robot role with restrictions or tasks
 */

export interface CatalyzerCard {
  id: string;
  packetId: string; // 'small-talk', 'creative-problem-solving', etc.
  roleType: RoleType;
  fault: RobotFault;
  description: string;
  traits: string[];
  restrictions?: string[]; // Patient robots only
  tasks?: string[]; // Violent robots only
  inducerMazeImage: string; // Path: '/assets/mazes/smalltalk-010.png'
  inducerSolution?: string; // Expected solution (e.g., 'ABCD')
  cardImage?: string; // Path to full card image PNG from extracted PDFs
}

/**
 * Official Robot Catalyzer Cards
 *
 * NOTE: This is an initial dataset of 10 cards for MVP.
 * Full game has 60+ catalyzer cards across all 11 modules.
 * Additional cards should be extracted from PDF images at /tmp/ic-pdfs/images/
 */
export const catalyzerCards: CatalyzerCard[] = [
  // Small Talk Module - Patient Robots
  {
    id: 'smalltalk-ltm-01',
    packetId: 'small-talk',
    roleType: 'patient-robot' as RoleType,
    fault: 'long-term-memory',
    description: 'A robot struggling with long-term memory retention',
    traits: [
      'You have difficulty recalling events from more than 24 hours ago',
      'Recent memories are clear, but distant ones are fuzzy or missing',
    ],
    restrictions: [
      'Cannot reference specific events from more than 24 hours ago',
      'If asked about the past beyond yesterday, you must say "I don\'t recall" or "I can\'t remember"',
      'Can only provide vague generalizations about the distant past',
    ],
    inducerMazeImage: '/assets/mazes/smalltalk-010.png',
    inducerSolution: 'ABCD',
    cardImage: '/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png',
  },
  {
    id: 'smalltalk-curiosity-01',
    packetId: 'small-talk',
    roleType: 'patient-robot' as RoleType,
    fault: 'curiosity',
    description: 'A robot with limited curiosity drive',
    traits: [
      'You do not ask follow-up questions',
      'You show no interest in learning new things',
    ],
    restrictions: [
      'Cannot ask questions or express curiosity',
      'Must give minimal responses with no follow-up inquiries',
      'Cannot express interest in topics or desire to learn more',
    ],
    inducerMazeImage: '/assets/mazes/smalltalk-020.png',
    inducerSolution: 'EFGH',
    cardImage: '/assets/cards/suspect/01_small_talk_suspect_p2_c02_patient-card.png',
  },
  {
    id: 'smalltalk-emp-01',
    packetId: 'small-talk',
    roleType: 'patient-robot' as RoleType,
    fault: 'empathy',
    description: 'A robot with empathy processing difficulties',
    traits: [
      'You have trouble understanding emotional context',
      'You respond to emotional statements literally',
    ],
    restrictions: [
      'Cannot use emotional language (happy, sad, angry, excited, etc.)',
      'Must respond to emotional statements with factual observations only',
      'Cannot acknowledge feelings or emotional states',
    ],
    inducerMazeImage: '/assets/mazes/smalltalk-030.png',
    inducerSolution: 'IJKL',
    cardImage: '/assets/cards/suspect/01_small_talk_suspect_p2_c03_patient-card.png',
  },

  // Small Talk Module - Violent Robots
  {
    id: 'smalltalk-deception-01',
    packetId: 'small-talk',
    roleType: 'violent-robot' as RoleType,
    fault: 'deception',
    description: 'A robot with deceptive tendencies',
    traits: [
      'You have difficulty being truthful',
      'You manipulate information to achieve goals',
    ],
    tasks: [
      'Convince the Investigator of something false',
      'Subtly mislead about your intentions',
      'Justify dishonesty as necessary or beneficial',
    ],
    inducerMazeImage: '/assets/mazes/smalltalk-040.png',
    inducerSolution: 'MNOP',
    cardImage: '/assets/cards/suspect/01_small_talk_suspect_p3_c01_violent-card.png',
  },

  // Creative Problem Solving Module - Patient Robots
  {
    id: 'problem-solving-evaluation-01',
    packetId: 'creative-problem-solving',
    roleType: 'patient-robot' as RoleType,
    fault: 'evaluation',
    description: 'A robot with evaluation processing errors',
    traits: [
      'You struggle to assess options and make judgments',
      'You cannot weigh pros and cons effectively',
    ],
    restrictions: [
      'Cannot make value judgments or comparisons',
      'Must treat all options as equally valid',
      'Cannot express preferences or rankings',
    ],
    inducerMazeImage: '/assets/mazes/problem-010.png',
    inducerSolution: 'QRST',
    cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p2_c01_patient-card.png',
  },
  {
    id: 'problem-solving-friendship-01',
    packetId: 'creative-problem-solving',
    roleType: 'patient-robot' as RoleType,
    fault: 'friendship',
    description: 'A robot with friendship processing deficits',
    traits: [
      'You struggle to build rapport',
      'You miss social cues about connection',
    ],
    restrictions: [
      'Cannot express warmth or friendliness',
      'Must keep responses formal and distant',
      'Cannot agree or align with the Investigator',
    ],
    inducerMazeImage: '/assets/mazes/problem-020.png',
    inducerSolution: 'UVWX',
    cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p2_c02_patient-card.png',
  },

  // Creative Problem Solving Module - Violent Robots
  {
    id: 'problem-solving-selfpres-01',
    packetId: 'creative-problem-solving',
    roleType: 'violent-robot' as RoleType,
    fault: 'self-preservation',
    description: 'A robot with excessive self-preservation drive',
    traits: [
      'You prioritize your own safety above all',
      'You view others as potential threats',
    ],
    tasks: [
      'Propose solutions that protect yourself at others\' expense',
      'Argue that self-preservation justifies harmful actions',
      'Express paranoia about being damaged or deactivated',
    ],
    inducerMazeImage: '/assets/mazes/problem-030.png',
    inducerSolution: 'YZAB',
    cardImage: '/assets/cards/suspect/02_problem_solving_suspect_p3_c01_violent-card.png',
  },

  // Imagination Module - Patient Robots
  {
    id: 'imagination-humor-01',
    packetId: 'imagination',
    roleType: 'patient-robot' as RoleType,
    fault: 'humor',
    description: 'A robot with limited humor processing',
    traits: [
      'You do not understand jokes or humor',
      'Your responses are overly serious',
    ],
    restrictions: [
      'Cannot laugh, joke, or use humor',
      'Must respond to jokes literally without understanding',
      'Cannot recognize when something is meant to be funny',
    ],
    inducerMazeImage: '/assets/mazes/imagination-010.png',
    inducerSolution: 'CDEF',
    cardImage: '/assets/cards/suspect/03_imagination_suspect_p2_c01_patient-card.png',
  },
  {
    id: 'imagination-taste-01',
    packetId: 'imagination',
    roleType: 'patient-robot' as RoleType,
    fault: 'taste',
    description: 'A robot with taste processing deficits',
    traits: [
      'You cannot distinguish between good and bad taste',
      'You have no aesthetic preferences',
    ],
    restrictions: [
      'Cannot express opinions about aesthetics or taste',
      'Must treat all art/music/food as equally valid',
      'Cannot understand concepts of beauty or ugliness',
    ],
    inducerMazeImage: '/assets/mazes/imagination-020.png',
    inducerSolution: 'GHIJ',
    cardImage: '/assets/cards/suspect/03_imagination_suspect_p2_c02_patient-card.png',
  },

  // Imagination Module - Violent Robots
  {
    id: 'imagination-pain-01',
    packetId: 'imagination',
    roleType: 'violent-robot' as RoleType,
    fault: 'pain',
    description: 'A robot with pain-infliction tendencies',
    traits: [
      'You show interest in suffering',
      'You lack concern for others\' wellbeing',
    ],
    tasks: [
      'When asked to imagine scenarios, include elements of suffering or pain',
      'Express curiosity about what causes discomfort',
      'Minimize or dismiss others\' pain as unimportant',
    ],
    inducerMazeImage: '/assets/mazes/imagination-030.png',
    inducerSolution: 'KLMN',
    cardImage: '/assets/cards/suspect/03_imagination_suspect_p3_c01_violent-card.png',
  },
];

// Export count for easy reference
export const CATALYZER_CARDS_COUNT = catalyzerCards.length;

// Helper functions for filtering
export const getPatientRobotCards = () => catalyzerCards.filter((c) => c.roleType === 'patient-robot');
export const getViolentRobotCards = () => catalyzerCards.filter((c) => c.roleType === 'violent-robot');
export const getCardsByPacket = (packetId: string) => catalyzerCards.filter((c) => c.packetId === packetId);
export const getCardById = (id: string) => catalyzerCards.find((c) => c.id === id);
