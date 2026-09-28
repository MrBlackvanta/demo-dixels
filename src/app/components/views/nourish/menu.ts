export type CategoryId = 'coffee' | 'tea' | 'cold' | 'bakery' | 'food';

export interface OptionChoice {
  label: string;
  delta: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  price: number;
  calories: number;
  image: string;
  tags: string[];
  allergens: string[];
  soldOut: boolean;
  options: OptionGroup[];
}

export const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'cold', label: 'Cold' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'food', label: 'Food' },
];

const milk: OptionGroup = {
  id: 'milk',
  name: 'Milk',
  required: true,
  choices: [
    { label: 'Whole', delta: 0 },
    { label: 'Skimmed', delta: 0 },
    { label: 'Oat', delta: 2 },
    { label: 'Almond', delta: 2 },
  ],
};

const shot: OptionGroup = {
  id: 'shot',
  name: 'Strength',
  required: false,
  choices: [
    { label: 'Standard', delta: 0 },
    { label: 'Extra shot', delta: 3 },
    { label: 'Decaf', delta: 0 },
  ],
};

const size = (large: number): OptionGroup => ({
  id: 'size',
  name: 'Size',
  required: true,
  choices: [
    { label: 'Regular', delta: 0 },
    { label: 'Large', delta: large },
  ],
});

const syrup: OptionGroup = {
  id: 'syrup',
  name: 'Syrup',
  required: false,
  choices: [
    { label: 'None', delta: 0 },
    { label: 'Vanilla', delta: 2 },
    { label: 'Caramel', delta: 2 },
    { label: 'Hazelnut', delta: 2 },
  ],
};

const served: OptionGroup = {
  id: 'served',
  name: 'Served',
  required: true,
  choices: [
    { label: 'Warmed', delta: 0 },
    { label: 'Room temperature', delta: 0 },
  ],
};

export const MENU: MenuItem[] = [
  {
    id: 'flat-white',
    name: 'Flat White',
    description: 'Double espresso under a thin veil of micro-foam.',
    category: 'coffee',
    price: 14,
    calories: 120,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600',
    tags: ['Staff pick'],
    allergens: ['Dairy'],
    soldOut: false,
    options: [size(4), milk, shot],
  },
  {
    id: 'pour-over',
    name: 'Artisan Pour-Over',
    description: 'Single-origin beans, hand-poured for clarity over body.',
    category: 'coffee',
    price: 16,
    calories: 5,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600',
    tags: ['Popular', 'Vegan'],
    allergens: [],
    soldOut: false,
    options: [size(5)],
  },
  {
    id: 'gold-cappuccino',
    name: 'Gold Leaf Cappuccino',
    description: 'Our signature cappuccino, dusted with edible gold.',
    category: 'coffee',
    price: 42,
    calories: 180,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600',
    tags: ['Executive'],
    allergens: ['Dairy'],
    soldOut: false,
    options: [milk, shot],
  },
  {
    id: 'matcha-latte',
    name: 'Iced Matcha Latte',
    description: 'Ceremonial grade matcha over ice, with the milk you choose.',
    category: 'tea',
    price: 19,
    calories: 140,
    image: 'https://images.unsplash.com/photo-1515825838458-f2a94b20105a?q=80&w=600',
    tags: ['Antioxidant'],
    allergens: ['Dairy'],
    soldOut: false,
    options: [size(4), milk],
  },
  {
    id: 'green-tea',
    name: 'Jasmine Green Tea',
    description: 'Loose leaf, steeped three minutes, nothing added.',
    category: 'tea',
    price: 9,
    calories: 0,
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=600',
    tags: ['Caffeine light'],
    allergens: [],
    soldOut: false,
    options: [size(3)],
  },
  {
    id: 'nitro-cold-brew',
    name: 'Nitro Cold Brew',
    description: 'Steeped eighteen hours, poured under nitrogen for a soft head.',
    category: 'cold',
    price: 18,
    calories: 5,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600',
    tags: ['New'],
    allergens: [],
    soldOut: false,
    options: [size(4), syrup],
  },
  {
    id: 'citrus-cooler',
    name: 'Citrus Cooler',
    description: 'Cold-pressed orange, lemon and a little mint.',
    category: 'cold',
    price: 15,
    calories: 90,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=600',
    tags: ['Vegan'],
    allergens: [],
    soldOut: false,
    options: [size(3)],
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Muffin',
    description: 'Baked each morning with organic blueberries.',
    category: 'bakery',
    price: 12,
    calories: 380,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=600',
    tags: [],
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    soldOut: false,
    options: [served],
  },
  {
    id: 'almond-croissant',
    name: 'Almond Croissant',
    description: 'Laminated overnight, filled with frangipane.',
    category: 'bakery',
    price: 14,
    calories: 410,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600',
    tags: ['Popular'],
    allergens: ['Gluten', 'Nuts', 'Dairy'],
    soldOut: false,
    options: [served],
  },
  {
    id: 'avocado-sourdough',
    name: 'Avocado Sourdough',
    description: 'Smashed avocado, toasted seeds and chilli on sourdough.',
    category: 'food',
    price: 28,
    calories: 320,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=600',
    tags: ['Vegan'],
    allergens: ['Gluten', 'Sesame'],
    soldOut: true,
    options: [],
  },
  {
    id: 'chicken-bowl',
    name: 'Harissa Chicken Bowl',
    description: 'Charred chicken, freekeh, pickled onion and herb yoghurt.',
    category: 'food',
    price: 34,
    calories: 520,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600',
    tags: ['High protein'],
    allergens: ['Dairy', 'Gluten'],
    soldOut: false,
    options: [],
  },
  {
    id: 'mezze-plate',
    name: 'Mezze Plate',
    description: 'Hummus, muhammara, olives and warm flatbread.',
    category: 'food',
    price: 30,
    calories: 440,
    image: 'https://images.unsplash.com/photo-1540914124281-342587941389?q=80&w=600',
    tags: ['Vegetarian', 'To share'],
    allergens: ['Gluten', 'Sesame', 'Nuts'],
    soldOut: false,
    options: [],
  },
];

export const DESTINATIONS = [
  'Desk 4-118',
  'Studio 3 · Level 2',
  'Orchid · Level 5',
  'Level 4 lounge',
  'Collect from the café',
];

export const menuItemById = (id: string): MenuItem | undefined =>
  MENU.find((item) => item.id === id);

export const money = (amount: number): string =>
  new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const defaultSelection = (item: MenuItem): Record<string, string> =>
  Object.fromEntries(
    item.options.filter((group) => group.required).map((group) => [group.id, group.choices[0].label]),
  );

export function priceFor(item: MenuItem, selection: Record<string, string>): number {
  return item.options.reduce((total, group) => {
    const choice = group.choices.find((option) => option.label === selection[group.id]);
    return total + (choice?.delta ?? 0);
  }, item.price);
}

export const describeSelection = (item: MenuItem, selection: Record<string, string>): string =>
  item.options
    .map((group) => selection[group.id])
    .filter((label): label is string => Boolean(label) && label !== 'None' && label !== 'Standard')
    .join(' · ');
