const productSizes = {
  bouquet: ["Petite", "Midi", "Largo", "Grande", "Human size"],
  vase: ["Petite", "Midi", "Largo", "Grande", "Gardenia"],
  signature: ["Yoona", "Marii", "Bomi", "Bloom box", "Acrylic Bloom box"],
  "hand-bouquet": ["Petite", "Midi", "Largo"],
  decoration: ["Table Decoration"],
};

const productEmojis = {
  bouquet: "\u{1F490}", // 💐
  vase: "\u{1F3FA}", // 🏺
  signature: "\u{2728}", // ✨
  "hand-bouquet": "\u{1F339}", // 🌹
  decoration: "\u{1F380}", // 🎀
};

const productImages = {
  bouquet: "Form Assets/Aset Foto Jenis Lini Produk/Bouquet By Gewa.png",
  vase: "Form Assets/Aset Foto Jenis Lini Produk/Vase by gewa.png",
  signature: "Form Assets/Aset Foto Jenis Lini Produk/Signature By Gewa.png",
  "hand-bouquet":
    "Form Assets/Aset Foto Jenis Lini Produk/Hand Bouquet By Gewa Cover.png",
  decoration: "Form Assets/Aset Foto Jenis Lini Produk/Decoration By Gewa.png",
};

function getSizeImage(type, size) {
  // Title Case helper
  const toTitleCase = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
  const safeSize = toTitleCase(size); 
  const basePath = "Form Assets/Each Product Assets/"; 
  if (type === "bouquet") return `${basePath}${safeSize} Buket.png`;
  if (type === "vase") return `${basePath}${safeSize} Vase.png`;
  if (type === "hand-bouquet") return `${basePath}${safeSize} Hand Bouquet.png`;
  if (type === "signature") return `${basePath}${safeSize}.png`;
  if (type === "decoration") return `${basePath}Table Decoration.png`;
  return "";
}

const wrapOptions = ["Black", "White"];

const vaseFlowers = ["Lily", "Anthurium", "Orchid", "Hydrangea"];

const vaseLimits = {
  Petite: { maxTotal: 1, maxPerType: 1, allowHydrangea: false },
  Midi: { maxTotal: 2, maxPerType: 2, allowHydrangea: false },
  Largo: { maxTotal: 3, maxPerType: 3, allowHydrangea: false },
  Grande: { maxTotal: 4, maxPerType: 2, allowHydrangea: true },
  Gardenia: { maxTotal: 5, maxPerType: 3, allowHydrangea: true },
};

const buyRentOptions = ["Beli", "Sewa"];

const eventOptions = [
  "Ulang tahun",
  "Bridal Proposal/Party",
  "Workshop/Seminar",
  "Lamaran",
  "Gathering",
  "Other",
];