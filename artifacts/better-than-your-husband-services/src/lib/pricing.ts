export type EstimatorAnswer = string | number | boolean;

export type EstimatorQuestion = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'textarea' | 'boolean';
  helper?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  options?: string[];
  visibleWhen?: {
    questionId: string;
    value: string;
  };
};

export type PricingRulePlaceholders = {
  basePrice: null;
  minimumCharge: null;
  hourlyRate: null;
  perSquareFootRate: null;
  perLinearFootRate: null;
  perItemRate: null;
  quantityTiers: never[];
  difficultyAdjustments: never[];
  materialCharges: never[];
  materialMarkup: null;
  travelCharges: never[];
  addOnCharges: never[];
  pricingTiers: never[];
  estimatedRange: null;
};

export type PricingConfiguration = {
  status: 'inactive';
  reviewRequired: true;
  resultLabel: 'Estimated Project Range';
  rulePlaceholders: PricingRulePlaceholders;
  manualReviewConditions: string[];
};

export type EstimatorService = {
  id: string;
  label: string;
  summary: string;
  questions: EstimatorQuestion[];
  pricing: PricingConfiguration;
};

const inactivePricing: PricingConfiguration = {
  status: 'inactive',
  reviewRequired: true,
  resultLabel: 'Estimated Project Range',
  rulePlaceholders: {
    basePrice: null,
    minimumCharge: null,
    hourlyRate: null,
    perSquareFootRate: null,
    perLinearFootRate: null,
    perItemRate: null,
    quantityTiers: [],
    difficultyAdjustments: [],
    materialCharges: [],
    materialMarkup: null,
    travelCharges: [],
    addOnCharges: [],
    pricingTiers: [],
    estimatedRange: null,
  },
  manualReviewConditions: [
    'Verified business pricing rules have not been entered yet.',
    'Actual conditions, access, materials, measurements, and project scope require review.',
  ],
};

const sharedProjectQuestions = {
  access: {
    id: 'access',
    label: 'How easy is the work area to access?',
    type: 'select' as const,
    options: ['Easy access', 'Some obstacles', 'Tight or difficult access', 'Not sure'],
    required: true,
  },
  materials: {
    id: 'materials',
    label: 'How will materials be handled?',
    type: 'select' as const,
    options: ['Materials are already on site', 'I need help selecting materials', 'Not sure yet'],
    required: true,
  },
};

export const estimatorServices: EstimatorService[] = [
  {
    id: 'installations',
    label: 'Installations',
    summary: 'Small installations that improve how a home or property works.',
    questions: [
      { id: 'installationType', label: 'What needs to be installed?', type: 'text', placeholder: 'For example: shelving, hardware, or a wall-mounted item', required: true },
      { id: 'itemCount', label: 'How many items are involved?', type: 'number', min: 1, placeholder: 'Number of items', required: true },
      sharedProjectQuestions.access,
      sharedProjectQuestions.materials,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'fixtures',
    label: 'Fixtures',
    summary: 'Fixture installation and related finish-minded updates.',
    questions: [
      { id: 'fixtureType', label: 'What type of fixture is involved?', type: 'select', options: ['Light fixture', 'Plumbing fixture', 'Cabinet or hardware fixture', 'Other fixture'], required: true },
      { id: 'fixtureCount', label: 'How many fixtures?', type: 'number', min: 1, placeholder: 'Number of fixtures', required: true },
      { id: 'existingConnections', label: 'Are existing connections already in place?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'drywall-trim-caulk',
    label: 'Drywall, Trim & Caulking',
    summary: 'Touch-ups and finish work that help a space feel complete.',
    questions: [
      { id: 'finishWorkType', label: 'What kind of finish work is needed?', type: 'select', options: ['Drywall repair', 'Trim repair or installation', 'Caulking', 'A combination'], required: true },
      { id: 'affectedArea', label: 'What area is affected?', type: 'text', placeholder: 'Room, wall, trim run, or other location', required: true },
      { id: 'finishCondition', label: 'What condition is the surface in?', type: 'select', options: ['Light touch-up', 'Visible damage', 'Needs preparation', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'fence-deck-work',
    label: 'Fence & Deck Work',
    summary: 'Repairs and improvements for fences, decks, porches, and related outdoor structures.',
    questions: [
      { id: 'outdoorStructure', label: 'What kind of work is needed?', type: 'select', options: ['Fence repair', 'Deck repair', 'Deck or fence improvement', 'Other outdoor structure'], required: true },
      { id: 'linearFeet', label: 'Approximate length involved', type: 'number', min: 1, placeholder: 'Linear feet, if known', helper: 'An approximate measurement is helpful but not required.', required: false },
      { id: 'structureCondition', label: 'What is the current condition?', type: 'select', options: ['Routine wear', 'Some damaged sections', 'Significant damage', 'Not sure'], required: true },
      sharedProjectQuestions.materials,
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'flooring',
    label: 'Flooring',
    summary: 'Certain flooring, transitions, and related finish work.',
    questions: [
      { id: 'flooringType', label: 'What type of flooring is involved?', type: 'select', options: ['LVP or laminate', 'Tile', 'Wood', 'Transitions or trim only', 'Not sure'], required: true },
      { id: 'floorArea', label: 'Approximate floor area', type: 'number', min: 1, placeholder: 'Square feet, if known', required: true },
      { id: 'removeExisting', label: 'Does existing flooring need to be removed?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      sharedProjectQuestions.access,
      sharedProjectQuestions.materials,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'mailbox-installation',
    label: 'Mailbox Installation',
    summary: 'Mailbox installation and related small exterior work.',
    questions: [
      { id: 'mailboxType', label: 'What kind of mailbox project is this?', type: 'select', options: ['New mailbox installation', 'Replace existing mailbox', 'Post or support repair', 'Not sure'], required: true },
      { id: 'existingPost', label: 'Is an existing post or support available?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      { id: 'groundCondition', label: 'What is the ground or mounting surface like?', type: 'select', options: ['Accessible soil', 'Concrete or hard surface', 'Sloped or difficult', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'gutter-cleaning',
    label: 'Gutter Cleaning',
    summary: 'Routine gutter cleaning and related exterior maintenance.',
    questions: [
      { id: 'linearFeet', label: 'Approximate gutter length', type: 'number', min: 1, placeholder: 'Linear feet, if known', required: true },
      { id: 'stories', label: 'How many stories?', type: 'select', options: ['One story', 'Two stories', 'More than two stories', 'Not sure'], required: true },
      { id: 'gutterGuards', label: 'Are gutter guards present?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      { id: 'downspoutCondition', label: 'Any known downspout concerns?', type: 'select', options: ['No known concerns', 'Some blockage or damage', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'pressure-washing',
    label: 'Pressure Washing',
    summary: 'Exterior cleaning where the surface and conditions are appropriate.',
    questions: [
      { id: 'washSurface', label: 'What surface needs cleaning?', type: 'select', options: ['Driveway or concrete', 'Siding', 'Deck or fence', 'Patio or walkway', 'Other exterior surface'], required: true },
      { id: 'washArea', label: 'Approximate area', type: 'number', min: 1, placeholder: 'Square feet, if known', required: true },
      { id: 'surfaceCondition', label: 'What condition is the surface in?', type: 'select', options: ['Routine dirt', 'Heavy buildup', 'Staining or discoloration', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'yard-tree-cleanup',
    label: 'Yard & Tree Cleanup',
    summary: 'Yard cleanup, light tree cleanup, debris removal, and property refreshes.',
    questions: [
      { id: 'cleanupType', label: 'What kind of cleanup is needed?', type: 'select', options: ['Yard cleanup', 'Storm or branch cleanup', 'Light tree cleanup', 'Seasonal property cleanup'], required: true },
      { id: 'debrisVolume', label: 'Approximate amount of debris', type: 'select', options: ['A few bags', 'Small pickup load', 'Several loads', 'Not sure'], required: true },
      { id: 'siteCondition', label: 'What is the site condition?', type: 'select', options: ['Open and accessible', 'Overgrown or obstructed', 'Steep or difficult', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'property-cleanouts',
    label: 'Property Cleanouts',
    summary: 'Cleanouts, hauling preparation, and general property resets.',
    questions: [
      { id: 'propertyType', label: 'What kind of property is involved?', type: 'select', options: ['Home', 'Apartment or rental', 'Garage or outbuilding', 'Commercial or other property'], required: true },
      { id: 'cleanoutVolume', label: 'Approximate cleanout volume', type: 'select', options: ['A few items', 'One room or small area', 'Several rooms', 'Whole property', 'Not sure'], required: true },
      { id: 'heavyItems', label: 'Are there heavy or unusual items?', type: 'select', options: ['No', 'Yes', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'hauling',
    label: 'Hauling',
    summary: 'Hauling and debris removal for appropriate property projects.',
    questions: [
      { id: 'loadSize', label: 'Approximate load size', type: 'select', options: ['A few items', 'Small load', 'Large load', 'Multiple loads', 'Not sure'], required: true },
      { id: 'materialType', label: 'What is being hauled?', type: 'text', placeholder: 'For example: yard debris, furniture, or construction debris', required: true },
      { id: 'loadingNeeded', label: 'Is loading help needed?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'outdoor-living-curb-appeal',
    label: 'Outdoor Living & Curb Appeal',
    summary: 'Outdoor improvements and related curb appeal projects.',
    questions: [
      { id: 'outdoorProjectType', label: 'What are you hoping to improve?', type: 'text', placeholder: 'Describe the outdoor living or curb appeal project', required: true },
      { id: 'projectArea', label: 'Approximate area involved', type: 'number', min: 1, placeholder: 'Square feet, if known', required: false },
      { id: 'materials', label: 'Are materials selected?', type: 'select', options: ['Yes', 'No', 'I need help choosing', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'realtor-punch-list',
    label: 'Realtor Punch List',
    summary: 'Punch lists, property preparation, and turnover tasks.',
    questions: [
      { id: 'propertyType', label: 'What kind of property is this?', type: 'select', options: ['Single-family home', 'Condo or apartment', 'Rental property', 'Other property'], required: true },
      { id: 'taskCount', label: 'Approximate number of items', type: 'number', min: 1, placeholder: 'Number of punch-list items', required: true },
      { id: 'punchListDetails', label: 'What are the main items?', type: 'textarea', placeholder: 'List the most important items or summarize the inspection list', required: true },
      { id: 'targetTiming', label: 'Is there a target timing?', type: 'select', options: ['No specific timing', 'Within two weeks', 'Within one month', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'inspection-repairs',
    label: 'Inspection Repairs',
    summary: 'Repairs and task lists related to property inspections.',
    questions: [
      { id: 'inspectionDetails', label: 'What repairs were identified?', type: 'textarea', placeholder: 'Summarize the inspection items or paste the relevant list', required: true },
      { id: 'reportAvailable', label: 'Do you have the inspection report?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      { id: 'inspectionTiming', label: 'Is there a timing consideration?', type: 'select', options: ['No specific timing', 'Time-sensitive', 'Not sure'], required: true },
    ],
    pricing: inactivePricing,
  },
  {
    id: 'egress-related-work',
    label: 'Egress-Related Work',
    summary: 'Egress-related work where appropriate and subject to review.',
    questions: [
      { id: 'egressProjectType', label: 'What kind of egress-related work is being considered?', type: 'textarea', placeholder: 'Describe the opening, access, or related project', required: true },
      { id: 'existingOpening', label: 'Is there an existing opening?', type: 'select', options: ['Yes', 'No', 'Not sure'], required: true },
      { id: 'openingMeasurement', label: 'Known opening measurements', type: 'text', placeholder: 'Share measurements if known', required: false },
      { id: 'siteAccess', label: 'How is the area accessed?', type: 'select', options: ['Interior access', 'Exterior access', 'Both', 'Not sure'], required: true },
    ],
    pricing: {
      ...inactivePricing,
      manualReviewConditions: [
        ...inactivePricing.manualReviewConditions,
        'Egress-related work may require project-specific review and applicable local requirements.',
      ],
    },
  },
  {
    id: 'custom-projects',
    label: 'Custom Projects',
    summary: 'Projects that do not fit a standard category can be reviewed individually.',
    questions: [
      { id: 'customSummary', label: 'What are you hoping to accomplish?', type: 'textarea', placeholder: 'Describe the project, property, and desired result', required: true },
      { id: 'customMeasurements', label: 'Known measurements or quantities', type: 'text', placeholder: 'Add any measurements or quantities you know', required: false },
      { id: 'customMaterials', label: 'How will materials be handled?', type: 'select', options: ['Materials are already on site', 'I need help selecting materials', 'Not sure yet'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
  {
    id: 'general-maintenance-punch-list',
    label: 'General Maintenance & Punch List',
    summary: 'General maintenance and practical punch-list work.',
    questions: [
      { id: 'taskCount', label: 'Approximate number of tasks', type: 'number', min: 1, placeholder: 'Number of tasks', required: true },
      { id: 'taskSummary', label: 'What needs to be done?', type: 'textarea', placeholder: 'List the maintenance or punch-list items', required: true },
      { id: 'recurringNeeds', label: 'Is this a recurring need?', type: 'select', options: ['One-time list', 'May recur seasonally', 'Ongoing need', 'Not sure'], required: true },
      sharedProjectQuestions.access,
    ],
    pricing: inactivePricing,
  },
];

export function getEstimatorService(serviceId: string) {
  return estimatorServices.find((service) => service.id === serviceId);
}

export function isQuestionVisible(
  question: EstimatorQuestion,
  answers: Record<string, string>,
) {
  if (!question.visibleWhen) return true;
  return answers[question.visibleWhen.questionId] === question.visibleWhen.value;
}