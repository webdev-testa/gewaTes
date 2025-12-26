const productSizes = {
  bouquet: ["Petite", "Midi", "Largo", "Grande", "Human size"],
  vase: ["Petite", "Midi", "Largo", "Grande", "Gardenia"],
  signature: ["Yoona", "Marii", "Bomi", "Bloom box", "Acrylic Bloom box"],
  "hand-bouquet": ["Petite", "Midi", "Largo"],
  decoration: ["Table Decoration"],
};

const productEmojis = {
  bouquet: "💐",
  vase: "🏺",
  signature: "✨",
  "hand-bouquet": "🌹",
  decoration: "🎀",
};

const wrapOptions = ["Black", "White"];

const vaseFlowers = ["Lily", "Anthurium", "Orchid", "Hydrangea"];

const vaseLimits = {
  "Petite": { maxTotal: 1, maxPerType: 1, allowHydrangea: false },
  "Midi": { maxTotal: 2, maxPerType: 2, allowHydrangea: false },
  "Largo": { maxTotal: 3, maxPerType: 3, allowHydrangea: false },
  "Grande": { maxTotal: 4, maxPerType: 2, allowHydrangea: true },
  "Gardenia": { maxTotal: 5, maxPerType: 3, allowHydrangea: true }
};

const buyRentOptions = ["Beli", "Sewa"];

const eventOptions = [
  "Ulang tahun", 
  "Bridal Proposal/Party", 
  "Workshop/Seminar", 
  "Lamaran", 
  "Gathering", 
  "Other"
];