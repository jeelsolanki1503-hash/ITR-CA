// All dummy data and copy for the CA flow. Shapes live here and nowhere else.

export const APP = {
  name: 'ITR',
  role: 'Chartered Accountant',
  tagline: 'For every client, one place',
  pitch: 'Run your practice, stress-free. Collect client documents, track status, and get them filed on time.',
  supportEmail: 'help@itr.app',
};

export const CA = {
  name: 'Deepak Mehta',
  first: 'Deepak',
  initials: 'DM',
  firm: 'Deepak Mehta & Associates',
  title: 'Chartered Accountant',
  email: 'deepak@deepakmehta.in',
  mobile: '98210 44321',
  membershipNo: 'ICAI 441209',
  deadlineLabel: '20 June 2026',
  deadlineDaysLeft: 10,
  taxYear: 'AY 2026-27',
  password: 'password',
};

export const SOFTWARE_OPTIONS = [
  { id: 'winman', label: 'Winman' },
  { id: 'genius', label: 'Genius / CompuTax' },
];

export const softwareLabel = (id) => (SOFTWARE_OPTIONS.find((o) => o.id === id) || SOFTWARE_OPTIONS[0]).label;

export const PRACTICE_OPTIONS = [
  { id: 'solo', title: 'Solo practice', desc: 'Just you, handling clients directly' },
  { id: 'team', title: 'Team practice', desc: 'You and one or more assistants' },
];

export const NEWS = [
  { id: 'n1', title: 'CBDT extends ITR filing deadline for AY 2026-27 by two weeks', source: 'Income Tax Department', when: '2 days ago' },
  { id: 'n2', title: 'New TDS reporting format effective this filing season', source: 'CAclubindia', when: '5 days ago' },
  { id: 'n3', title: 'AIS now reflects crypto transactions: what CAs need to check', source: 'Economic Times', when: '1 week ago' },
];

// Clients, as the CA sees them.
// status: 'not-started' | 'in-progress' | 'needs-correction' | 'complete'
export const CLIENTS = [
  {
    id: 'ritika',
    name: 'Ritika Shah',
    sources: 'Salaried · SIPs · FD · Freelance income',
    status: 'in-progress',
    stage: 'All 5 documents uploaded · ready for your review',
    pan: 'AFKPN7731Q',
    email: 'ritika.shah@gmail.com',
    mobile: '99887 76655',
    initials: 'RS',
    sinceLabel: 'Client since 2022',
    acceptedDays: 5,
    checklistSentDays: 5,
    note: null,
    checklist: [
      { id: 'bankInterest', title: 'Bank interest statement', state: 'uploaded', file: 'hdfc_interest_fy26.pdf', size: '214 KB · 3 pages', uploadedDays: 2 },
      { id: 'brokerPnl', title: 'Broker P&L statement', state: 'uploaded', file: 'broker_pnl_fy26.pdf', size: '1.2 MB · 4 pages', uploadedDays: 2 },
      { id: 'fd', title: 'FD certificate', state: 'uploaded', file: 'fd_certificate.heic', size: '2.4 MB · photo', uploadedDays: 2 },
      { id: 'form16', title: 'Form 16', state: 'uploaded', file: 'form16_fy26.pdf', size: '1.1 MB · 6 pages', uploadedDays: 3 },
      { id: 'foreign', title: 'Foreign investment proof', state: 'uploaded', file: 'foreign_broker.pdf', size: '860 KB · 5 pages', uploadedDays: 2 },
    ],
    flag: { kind: 'investment', what: 'New investment', detail: 'foreign equity', note: 'The system noticed a new foreign equity purchase on your AIS. We may need the broker statement and purchase date.' },
    history: [
      { ay: 'AY 2025-26', detail: '6 of 6 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '6 of 6 documents · Filed on time' },
    ],
  },
  {
    id: 'sanjay',
    name: 'Sanjay Gupta',
    sources: 'Salaried · Freelance',
    status: 'needs-correction',
    stage: '1 document needs a fix · waiting on Sanjay',
    pan: 'ANHPP4572J',
    email: 'sanjay.gupta@gmail.com',
    mobile: '98250 66992',
    initials: 'SG',
    sinceLabel: 'Client since 2021',
    acceptedDays: 12,
    checklistSentDays: 8,
    note: 'The PAN on page 2 doesn’t match. Please upload your latest Form 16.',
    checklist: [
      { id: 'form16', title: 'Form 16', state: 'flagged', file: null, size: null, flaggedDays: 4, note: 'The PAN on page 2 doesn’t match. Please upload your latest Form 16.' },
      { id: 'bankInterest', title: 'Bank interest statement', state: 'uploaded', file: 'bank_interest_fy26.pdf', size: '210 KB · 2 pages', uploadedDays: 5 },
      { id: 'freelance', title: 'Freelance income summary', state: 'uploaded', file: 'freelance_invoices.pdf', size: '480 KB · 7 pages', uploadedDays: 5 },
    ],
    flag: { kind: 'expenditure', what: 'New expenditure', detail: 'medical claim', note: 'Sanjay mentioned medical expenses that may be claimable under 80DDB.' },
    history: [
      { ay: 'AY 2025-26', detail: '5 of 5 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '5 of 5 documents · Filed on time' },
    ],
  },
  {
    id: 'neha',
    name: 'Neha Kapoor',
    sources: 'Business owner',
    status: 'needs-correction',
    stage: 'Bank statement was unreadable · waiting on Neha',
    pan: 'KPNPK3310M',
    email: 'neha.kapoor@gmail.com',
    mobile: '99820 11443',
    initials: 'NK',
    sinceLabel: 'Client since 2021',
    acceptedDays: 10,
    checklistSentDays: 6,
    note: 'The scan is blurry. Can you re-upload a clearer PDF?',
    checklist: [
      { id: 'bankStatement', title: 'Bank statement', state: 'flagged', file: null, size: null, flaggedDays: 2, note: 'The scan is blurry. Please re-upload a clearer PDF.' },
      { id: 'gstReturns', title: 'GST returns summary', state: 'uploaded', file: 'gst_summary_fy26.pdf', size: '680 KB · 8 pages', uploadedDays: 4 },
      { id: 'balanceSheet', title: 'Balance sheet', state: 'uploaded', file: 'balance_sheet_fy26.pdf', size: '420 KB · 3 pages', uploadedDays: 4 },
    ],
    flag: null,
    history: [
      { ay: 'AY 2025-26', detail: '7 of 7 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '6 of 6 documents · Filed on time' },
    ],
  },
  {
    id: 'amit',
    name: 'Amit Verma',
    sources: 'Business owner',
    status: 'in-progress',
    stage: '3 of 6 documents uploaded',
    pan: 'ARVPM9981K',
    email: 'amit.verma@gmail.com',
    mobile: '99887 11223',
    initials: 'AV',
    sinceLabel: 'Client since 2022',
    acceptedDays: 14,
    checklistSentDays: 10,
    note: null,
    checklist: [
      { id: 'pl', title: 'Profit & loss statement', state: 'uploaded', file: 'pl_fy26.pdf', size: '320 KB · 3 pages', uploadedDays: 2 },
      { id: 'balanceSheet', title: 'Balance sheet', state: 'uploaded', file: 'balance_sheet_fy26.pdf', size: '280 KB · 2 pages', uploadedDays: 3 },
      { id: 'gstReturns', title: 'GST returns summary', state: 'uploaded', file: 'gst_summary.pdf', size: '540 KB · 6 pages', uploadedDays: 2 },
      { id: 'bankStatements', title: 'Bank statements', state: 'todo' },
      { id: 'loanStatements', title: 'Loan statements', state: 'todo' },
      { id: 'form26AS', title: 'Form 26AS', state: 'todo' },
    ],
    flag: { kind: 'income', what: 'New income', detail: 'freelance project', note: 'Amit mentioned a side consulting engagement last month.' },
    history: [
      { ay: 'AY 2025-26', detail: '6 of 6 documents · Filed on time' },
    ],
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    sources: 'Self-employed',
    status: 'not-started',
    stage: 'Checklist sent 8 days ago, no reply yet',
    pan: 'IYRPM4420L',
    email: 'meera.iyer@gmail.com',
    mobile: '98111 55443',
    initials: 'MI',
    sinceLabel: 'Client since 2024',
    acceptedDays: 20,
    checklistSentDays: 8,
    note: null,
    checklist: [
      { id: 'form16', title: 'Form 16', state: 'todo' },
      { id: 'bankInterest', title: 'Bank interest statement', state: 'todo' },
      { id: 'profIncome', title: 'Professional income summary', state: 'todo' },
      { id: 'advanceTax', title: 'Advance tax challans', state: 'todo' },
    ],
    flag: null,
    history: [],
  },
  {
    id: 'kiran',
    name: 'Kiran Joshi',
    sources: 'Salaried · Rental income',
    status: 'not-started',
    stage: 'Checklist not sent yet',
    pan: 'JSHKR8810N',
    email: 'kiran.joshi@gmail.com',
    mobile: '98650 11223',
    initials: 'KJ',
    sinceLabel: 'Client since 2022',
    acceptedDays: 3,
    checklistSentDays: null,
    note: null,
    checklist: [],
    history: [
      { ay: 'AY 2025-26', detail: '5 of 5 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '5 of 5 documents · Filed on time' },
    ],
  },
  {
    id: 'rahul',
    name: 'Rahul Desai',
    sources: 'Salaried',
    status: 'not-started',
    stage: 'Asked for in-person help',
    pan: 'DSHRL2200F',
    email: 'rahul.desai@gmail.com',
    mobile: '98700 33210',
    initials: 'RD',
    sinceLabel: 'Client since 2021',
    acceptedDays: 7,
    checklistSentDays: null,
    note: null,
    assisted: true,
    checklist: [
      { id: 'bankInterest', title: 'Bank interest statement', state: 'collected', collectedBy: 'in-person' },
      { id: 'fd', title: 'FD certificate', state: 'collected', collectedBy: 'in-person' },
      { id: 'form16', title: 'Form 16', state: 'todo' },
    ],
    flag: null,
    history: [
      { ay: 'AY 2025-26', detail: '4 of 4 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '4 of 4 documents · Filed on time' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    sources: 'Salaried',
    status: 'complete',
    stage: 'All 4 documents received',
    pan: 'KRPNY8870H',
    email: 'priya.nair@gmail.com',
    mobile: '98230 55771',
    initials: 'PN',
    sinceLabel: 'Client since 2020',
    acceptedDays: 25,
    checklistSentDays: 12,
    note: null,
    checklist: [
      { id: 'form16', title: 'Form 16', state: 'approved', file: 'form16_fy26.pdf', size: '1.3 MB · 6 pages', uploadedDays: 8 },
      { id: 'bankInterest', title: 'Bank interest statement', state: 'approved', file: 'bank_interest.pdf', size: '220 KB · 2 pages', uploadedDays: 8 },
      { id: 'brokerPnl', title: 'Broker P&L statement', state: 'approved', file: 'broker_pnl.pdf', size: '1.1 MB · 4 pages', uploadedDays: 9 },
      { id: 'form26AS', title: 'Form 26AS', state: 'approved', file: 'form_26as.pdf', size: '320 KB · 5 pages', uploadedDays: 9 },
    ],
    flag: null,
    history: [
      { ay: 'AY 2025-26', detail: '4 of 4 documents · Filed on time' },
      { ay: 'AY 2024-25', detail: '4 of 4 documents · Filed on time' },
    ],
  },
];

// Add many filler clients so filter counts match the design (All 23)
const FILLER_SOURCES = ['Salaried', 'Salaried · FD', 'Business owner', 'Salaried · Rental income'];
const FILLER_NAMES = [
  'Kavita Rao', 'Rajesh Nambiar', 'Vikram Mehta', 'Divya Pillai', 'Rohan Mathews',
  'Zoya Khan', 'Nitin Bhat', 'Shruti Kulkarni', 'Mohan Reddy', 'Harsha Varma',
  'Lavanya Suresh', 'Deepa Krishnan', 'Isha Prasad', 'Suresh Hegde', 'Tara Menon',
];
for (let i = 0; i < 15 && i < FILLER_NAMES.length; i += 1) {
  const name = FILLER_NAMES[i];
  const parts = name.split(' ');
  const initials = parts[0][0] + parts[1][0];
  const status = i < 4 ? 'in-progress' : 'complete';
  const stage = status === 'not-started' ? 'Checklist not sent yet' : status === 'in-progress' ? '2 of 4 documents uploaded' : `Filed on ${8 + i} Jun 2026`;
  CLIENTS.push({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    sources: FILLER_SOURCES[i % FILLER_SOURCES.length],
    status,
    stage,
    pan: 'XXXPX' + (1000 + i),
    email: name.split(' ')[0].toLowerCase() + '@gmail.com',
    mobile: '98' + (100000000 + i * 123),
    initials,
    sinceLabel: 'Client since ' + (2019 + (i % 5)),
    acceptedDays: 20 + i,
    checklistSentDays: status === 'not-started' ? null : 10 + i,
    note: null,
    checklist: status === 'complete'
      ? [
          { id: 'form16', title: 'Form 16', state: 'approved', file: 'form16.pdf', size: '1.1 MB', uploadedDays: 10 },
          { id: 'bankInterest', title: 'Bank interest statement', state: 'approved', file: 'bank_interest.pdf', size: '200 KB', uploadedDays: 10 },
        ]
      : status === 'in-progress'
      ? [
          { id: 'form16', title: 'Form 16', state: 'uploaded', file: 'form16.pdf', size: '1.0 MB', uploadedDays: 3 },
          { id: 'bankInterest', title: 'Bank interest statement', state: 'uploaded', file: 'bank_interest.pdf', size: '200 KB', uploadedDays: 3 },
          { id: 'fd', title: 'FD certificate', state: 'todo' },
          { id: 'brokerPnl', title: 'Broker P&L statement', state: 'todo' },
        ]
      : [],
    flag: null,
    history: [{ ay: 'AY 2025-26', detail: '4 of 4 documents · Filed on time' }],
  });
}

// Values from the hi-fi frames, applied over the seeds above.
const NAMED = {
  ritika: { short: 'Salaried + investments', sinceLabel: 'Client since 2023' },
  sanjay: { short: 'Salaried + freelance', trackText: 'You flagged 1 document 4 days ago. He has not re-uploaded.', trackFor: 'needs-correction' },
  neha: { short: 'Business owner', flagStage: 'Bank statement was unreadable, waiting on Neha', trackText: 'You flagged 1 document 2 days ago. She has not re-uploaded.', trackFor: 'needs-correction' },
  amit: { short: 'Business owner', trackText: '3 of 6 documents uploaded, last upload 2 days ago', trackFor: 'in-progress' },
  meera: { short: 'Self-employed', trackText: 'Checklist sent 8 days ago, no reply yet. Last reminder: day 7', trackFor: 'not-started' },
  kiran: { short: 'Salaried + rental income' },
  rahul: { short: 'Salaried' },
  priya: { short: 'Salaried' },
};
CLIENTS.forEach((c) => {
  if (NAMED[c.id]) Object.assign(c, NAMED[c.id]);
  else c.filler = true;
});
CLIENTS.find((c) => c.id === 'ritika').checklist.find((d) => d.id === 'foreign').uploadedDays = 3;
CLIENTS.find((c) => c.id === 'sanjay').checklist[0].file = 'form16_fy26.pdf';
CLIENTS.find((c) => c.id === 'sanjay').checklist[0].size = '1.1 MB · 6 pages';
CLIENTS.find((c) => c.id === 'neha').checklist[0].file = 'bank_statement_scan.pdf';
CLIENTS.find((c) => c.id === 'neha').checklist[0].size = '2.1 MB · 9 pages';

export const REQUIREMENT_ITEMS = {
  investment: { items: ['Foreign brokerage account statement', 'Purchase date and cost basis'], where: 'Foreign broker’s statements section, usually under Tax Documents or Annual Statement.' },
  income: { items: ['Invoices for the freelance project', 'Bank credits for client payments'], where: 'Their invoicing tool, or the bank statement showing client payments.' },
  expenditure: { items: ['Medical bills and prescriptions', 'Form 10-I from a specialist'], where: 'The hospital billing desk, or the treating doctor for Form 10-I.' },
};

// Builds a fresh client from an invite: the CA types the name, plus an email or 10-digit mobile.
export function clientFromContact(contact, name) {
  const isEmail = contact.includes('@');
  const clean = name.trim().replace(/\s+/g, ' ');
  const words = clean.split(' ');
  const initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return {
    id: `c-${Date.now().toString(36)}`,
    name: clean,
    sources: 'Salaried + rental income',
    short: 'Salaried + rental income',
    status: 'invited',
    pan: '',
    email: isEmail ? contact : '',
    mobile: isEmail ? '' : contact,
    initials,
    sinceLabel: 'Linked just now',
    acceptedDays: null,
    checklistSentDays: null,
    note: null,
    demo: true,
    checklist: [],
    flag: null,
    history: [],
  };
}

export const DEMO_FILES = {
  form16: ['form16_fy26.pdf', '1.1 MB · 6 pages'],
  bankInterest: ['bank_interest_fy26.pdf', '214 KB · 3 pages'],
  fd: ['fd_certificate.pdf', '188 KB · 2 pages'],
  rent: ['rent_received_apr-mar.pdf', '342 KB · 4 pages'],
  propertyTax: ['property_tax_2025-26.pdf', '96 KB · 1 page'],
  homeLoan: ['home_loan_interest.pdf', '120 KB · 2 pages'],
  brokerPnl: ['broker_pnl_fy26.pdf', '1.2 MB · 4 pages'],
  freelance: ['freelance_summary.pdf', '520 KB · 6 pages'],
  foreign: ['foreign_broker.pdf', '860 KB · 5 pages'],
};

export const STATUS = {
  'invited': { label: 'Invite sent', pill: 'neutral', icon: 'mail', help: 'Waiting for them to accept' },
  'not-started': { label: 'Not started', pill: 'neutral', icon: 'ring', help: 'Checklist not sent yet, or nothing uploaded' },
  'in-progress': { label: 'In progress', pill: 'info', icon: 'info', help: 'Client is uploading documents' },
  'needs-correction': { label: 'Needs correction', pill: 'warning', icon: 'warning', help: 'You flagged a document, waiting on the client' },
  'complete': { label: 'Complete', pill: 'success', icon: 'check-circle', help: 'All received, nothing pending' },
};

export const STATUS_ORDER = ['all', 'not-started', 'in-progress', 'needs-correction', 'complete'];

export const CHECKLIST_LIBRARY = {
  form16: { title: 'Form 16', hint: 'From the employer’s HR or TRACES portal' },
  bankInterest: { title: 'Bank interest statement', hint: 'Net banking · Interest certificate' },
  fd: { title: 'FD certificate', hint: 'TDS / interest certificate from the bank' },
  brokerPnl: { title: 'Broker P&L statement', hint: 'Broker · Reports · Tax P&L' },
  rent: { title: 'Rent received details', hint: 'Receipts or bank credits' },
  propertyTax: { title: 'Property tax receipt', hint: 'Municipal corporation' },
  homeLoan: { title: 'Home loan interest certificate', hint: 'Lender’s net banking' },
  freelance: { title: 'Freelance income summary', hint: 'Invoices or payment statements' },
  foreign: { title: 'Foreign investment proof', hint: 'Year-end broker statement' },
};

export const SUGGESTED_FOR = {
  anita: ['form16', 'bankInterest', 'fd', 'rent', 'propertyTax', 'homeLoan'],
  kiran: ['form16', 'bankInterest', 'fd', 'rent', 'homeLoan'],
};

export const ACTIVITY_SEED = [
  { id: 'a1', text: 'Ritika Shah flagged for missing document', kind: 'warning', min: 12, client: 'ritika' },
];

export const TOASTS = {
  itemAdded: (title) => `Added “${title}” to the checklist.`,
  duplicate: (title) => `“${title}” is already on this checklist.`,
  flagged: (title, name) => `${name} has been asked to re-upload “${title}”.`,
  approved: (title) => `${title} marked as reviewed.`,
  reminderSent: (name) => `Reminder sent. We’ve notified ${name}.`,
  inviteSent: (name) => `Invite sent. ${name || 'They'}’ll appear here once they accept.`,
  inviteAlready: (first) => `Already invited · we’ll tell you when ${first} accepts.`,
  invitesBulk: (n) => `${n} invites sent.`,
  explainSent: 'Explanation sent to the client.',
  completed: (name) => `${name}’s file is marked complete.`,
  closed: 'Season closed. Your dashboard will reset for the next year.',
  saved: 'Settings saved.',
  exportSent: (soft) => `Export sent to ${soft}.`,
  downloading: (file) => `Downloading ${file}…`,
  loggedOut: 'You’re logged out.',
  recorded: (title, name) => `Recorded “${title}” as collected from ${name}.`,
  seasonReopened: 'Season reopened.',
  reviewed: 'All documents marked reviewed.',
  help: `Opening Help & support in a new tab…`,
};

export const DEMO = {
  wrongPassword: 'wrong',
  timers: { send: 1200, flag: 900, upload: 1800, invite: 900 },
};
