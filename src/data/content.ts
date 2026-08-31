/**
 * Data-driven learning content. Games read from here so new lessons can be
 * added (or generated) without touching game code.
 */

import type { CharacterId } from "@/components/characters/Character";
import type { SkillKey } from "@/services/progress";

export type ColorItem = { color: string; label: string; token: string; objects: { emoji: string; name: string }[] };

export const COLORS: ColorItem[] = [
  { color: "red", label: "Red", token: "oklch(0.68 0.19 25)", objects: [{ emoji: "🍎", name: "apple" }, { emoji: "🍓", name: "strawberry" }, { emoji: "🚗", name: "car" }] },
  { color: "yellow", label: "Yellow", token: "oklch(0.9 0.14 95)", objects: [{ emoji: "🍌", name: "banana" }, { emoji: "🌻", name: "sunflower" }, { emoji: "🧀", name: "cheese" }] },
  { color: "green", label: "Green", token: "oklch(0.78 0.14 145)", objects: [{ emoji: "🍃", name: "leaf" }, { emoji: "🥦", name: "broccoli" }, { emoji: "🐢", name: "turtle" }] },
  { color: "blue", label: "Blue", token: "oklch(0.7 0.13 240)", objects: [{ emoji: "🫐", name: "berry" }, { emoji: "🐳", name: "whale" }, { emoji: "💧", name: "drop" }] },
  { color: "purple", label: "Purple", token: "oklch(0.65 0.15 300)", objects: [{ emoji: "🍇", name: "grapes" }, { emoji: "🔮", name: "orb" }, { emoji: "🪻", name: "flower" }] },
  { color: "orange", label: "Orange", token: "oklch(0.78 0.15 55)", objects: [{ emoji: "🍊", name: "orange" }, { emoji: "🥕", name: "carrot" }, { emoji: "🦊", name: "fox" }] },
  { color: "pink", label: "Pink", token: "oklch(0.82 0.11 350)", objects: [{ emoji: "🌸", name: "blossom" }, { emoji: "🐷", name: "pig" }, { emoji: "🎀", name: "bow" }] },
  { color: "brown", label: "Brown", token: "oklch(0.55 0.07 60)", objects: [{ emoji: "🐻", name: "teddy" }, { emoji: "🍪", name: "cookie" }, { emoji: "🌰", name: "nut" }] },
];

export type ShapeKey = "circle" | "square" | "triangle" | "rectangle" | "star" | "heart" | "oval";

export const SHAPES: { key: ShapeKey; label: string; token: string }[] = [
  { key: "circle", label: "Circle", token: "var(--sky)" },
  { key: "square", label: "Square", token: "var(--peach)" },
  { key: "triangle", label: "Triangle", token: "var(--mint)" },
  { key: "rectangle", label: "Rectangle", token: "var(--lavender)" },
  { key: "star", label: "Star", token: "var(--sunshine)" },
  { key: "heart", label: "Heart", token: "var(--coral)" },
  { key: "oval", label: "Oval", token: "var(--leaf)" },
];

export type LetterItem = { letter: string; sound: string; word: string; emoji: string };

export const LETTERS: LetterItem[] = [
  { letter: "A", sound: "ah", word: "Apple", emoji: "🍎" },
  { letter: "B", sound: "buh", word: "Ball", emoji: "⚽" },
  { letter: "C", sound: "kuh", word: "Cat", emoji: "🐱" },
  { letter: "D", sound: "duh", word: "Dog", emoji: "🐶" },
  { letter: "E", sound: "eh", word: "Egg", emoji: "🥚" },
  { letter: "F", sound: "fff", word: "Fish", emoji: "🐟" },
  { letter: "G", sound: "guh", word: "Grapes", emoji: "🍇" },
  { letter: "H", sound: "huh", word: "Hat", emoji: "🎩" },
  { letter: "I", sound: "ih", word: "Igloo", emoji: "🧊" },
  { letter: "J", sound: "juh", word: "Jam", emoji: "🍯" },
  { letter: "K", sound: "kuh", word: "Kite", emoji: "🪁" },
  { letter: "L", sound: "lll", word: "Leaf", emoji: "🍃" },
  { letter: "M", sound: "mmm", word: "Moon", emoji: "🌙" },
  { letter: "N", sound: "nnn", word: "Nest", emoji: "🪹" },
  { letter: "O", sound: "oh", word: "Owl", emoji: "🦉" },
  { letter: "P", sound: "puh", word: "Pear", emoji: "🍐" },
  { letter: "Q", sound: "kwuh", word: "Queen", emoji: "👑" },
  { letter: "R", sound: "rrr", word: "Rocket", emoji: "🚀" },
  { letter: "S", sound: "sss", word: "Sun", emoji: "☀️" },
  { letter: "T", sound: "tuh", word: "Tree", emoji: "🌳" },
  { letter: "U", sound: "uh", word: "Umbrella", emoji: "☂️" },
  { letter: "V", sound: "vvv", word: "Van", emoji: "🚐" },
  { letter: "W", sound: "wuh", word: "Whale", emoji: "🐳" },
  { letter: "X", sound: "ks", word: "Box", emoji: "📦" },
  { letter: "Y", sound: "yuh", word: "Yarn", emoji: "🧶" },
  { letter: "Z", sound: "zzz", word: "Zebra", emoji: "🦓" },
];

export const COUNT_OBJECTS = [
  { emoji: "🌷", name: "flowers" },
  { emoji: "🐝", name: "bees" },
  { emoji: "🍓", name: "strawberries" },
  { emoji: "🦋", name: "butterflies" },
  { emoji: "🌟", name: "stars" },
  { emoji: "🍄", name: "mushrooms" },
];

export const ANIMALS = [
  { key: "lion", emoji: "🦁", name: "Lion", sound: "Roar!", home: "Savanna" },
  { key: "elephant", emoji: "🐘", name: "Elephant", sound: "Toot!", home: "Savanna" },
  { key: "giraffe", emoji: "🦒", name: "Giraffe", sound: "Hum!", home: "Savanna" },
  { key: "monkey", emoji: "🐵", name: "Monkey", sound: "Ooh ooh!", home: "Jungle" },
  { key: "penguin", emoji: "🐧", name: "Penguin", sound: "Squawk!", home: "Ice" },
  { key: "panda", emoji: "🐼", name: "Panda", sound: "Squeak!", home: "Forest" },
  { key: "frog", emoji: "🐸", name: "Frog", sound: "Ribbit!", home: "Pond" },
  { key: "cat", emoji: "🐱", name: "Cat", sound: "Meow!", home: "Home" },
  { key: "dog", emoji: "🐶", name: "Dog", sound: "Woof!", home: "Home" },
  { key: "duck", emoji: "🦆", name: "Duck", sound: "Quack!", home: "Pond" },
  { key: "butterfly", emoji: "🦋", name: "Butterfly", sound: "Flutter!", home: "Garden" },
  { key: "rabbit", emoji: "🐰", name: "Rabbit", sound: "Sniff!", home: "Garden" },
];

export type PuzzleTheme = { key: string; title: string; emoji: string; bg: string };

export const PUZZLES: PuzzleTheme[] = [
  { key: "farm", title: "Farm Friend", emoji: "🐄", bg: "var(--mint)" },
  { key: "space", title: "Space Rocket", emoji: "🚀", bg: "var(--lavender)" },
  { key: "ocean", title: "Ocean Whale", emoji: "🐳", bg: "var(--sky)" },
  { key: "dino", title: "Dino Friend", emoji: "🦕", bg: "var(--leaf)" },
  { key: "garden", title: "Garden Flower", emoji: "🌻", bg: "var(--sunshine)" },
  { key: "vehicle", title: "Little Bus", emoji: "🚌", bg: "var(--peach)" },
];

export type ColoringPicture = {
  key: string;
  title: string;
  reward: "fly" | "launch" | "shine" | "swim";
  paths: { d: string; hint: string }[];
};

export const COLORING: ColoringPicture[] = [
  {
    key: "butterfly",
    title: "Butterfly",
    reward: "fly",
    paths: [
      { d: "M100 60 C60 10, 10 40, 40 90 C60 120, 90 100, 100 80 Z", hint: "wing" },
      { d: "M100 60 C140 10, 190 40, 160 90 C140 120, 110 100, 100 80 Z", hint: "wing" },
      { d: "M92 55 h16 a8 8 0 0 1 8 8 v60 a16 16 0 0 1 -32 0 v-60 a8 8 0 0 1 8 -8 Z", hint: "body" },
    ],
  },
  {
    key: "rocket",
    title: "Rocket",
    reward: "launch",
    paths: [
      { d: "M100 20 C130 55, 132 100, 128 130 h-56 C68 100, 70 55, 100 20 Z", hint: "body" },
      { d: "M72 100 L44 138 L72 132 Z", hint: "fin" },
      { d: "M128 100 L156 138 L128 132 Z", hint: "fin" },
      { d: "M84 150 q16 26 32 0 Z", hint: "flame" },
    ],
  },
  {
    key: "sun",
    title: "Sunny Day",
    reward: "shine",
    paths: [
      { d: "M100 100 m-46 0 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0", hint: "sun" },
      { d: "M100 20 l10 24 h-20 Z", hint: "ray" },
      { d: "M100 180 l10 -24 h-20 Z", hint: "ray" },
      { d: "M20 100 l24 10 v-20 Z", hint: "ray" },
      { d: "M180 100 l-24 10 v-20 Z", hint: "ray" },
    ],
  },
  {
    key: "fish",
    title: "Happy Fish",
    reward: "swim",
    paths: [
      { d: "M60 100 C80 55, 145 55, 165 100 C145 145, 80 145, 60 100 Z", hint: "body" },
      { d: "M60 100 L22 70 L30 100 L22 130 Z", hint: "tail" },
      { d: "M110 72 q18 12 0 24 Z", hint: "fin" },
    ],
  },
];

export type Story = {
  key: string;
  title: string;
  hero: CharacterId;
  pages: { text: string; emoji: string }[];
  question: { prompt: string; options: string[]; answer: string };
};

export const STORIES: Story[] = [
  {
    key: "shine",
    title: "The Little Star Who Was Afraid to Shine",
    hero: "mimi",
    pages: [
      { text: "High above the hills lived a tiny star named Mimi.", emoji: "🌌" },
      { text: "Mimi kept her light very, very small. 'What if nobody likes it?'", emoji: "🌟" },
      { text: "One night a lost bunny could not find the path home.", emoji: "🐰" },
      { text: "Mimi took a deep breath and shone her warmest yellow light.", emoji: "💛" },
      { text: "The bunny found home, and Mimi smiled. Shining felt wonderful.", emoji: "🏡" },
    ],
    question: { prompt: "What color did Mimi shine?", options: ["Yellow", "Blue", "Green"], answer: "Yellow" },
  },
  {
    key: "rainbow",
    title: "Pip Finds a Rainbow",
    hero: "pip",
    pages: [
      { text: "After the rain, Pip packed his little backpack.", emoji: "🎒" },
      { text: "He splashed through puddles, hop, hop, hop!", emoji: "💧" },
      { text: "Behind the big tree, colors curved across the sky.", emoji: "🌈" },
      { text: "Pip counted them: red, orange, yellow, green, blue, purple.", emoji: "🔢" },
      { text: "He waved goodbye and skipped home to tell his friends.", emoji: "👋" },
    ],
    question: { prompt: "What did Pip find?", options: ["A rainbow", "A rocket", "A whale"], answer: "A rainbow" },
  },
  {
    key: "share",
    title: "Tiko Learns to Share",
    hero: "tiko",
    pages: [
      { text: "Tiko the little robot built a tower of shiny blocks.", emoji: "🧱" },
      { text: "Bobo floated over. 'May I build too?' he asked softly.", emoji: "☁️" },
      { text: "Tiko held the blocks tight. Beep. Hmm.", emoji: "🤖" },
      { text: "Then Tiko gave Bobo half. Together the tower grew taller!", emoji: "🏗️" },
      { text: "Sharing made the game twice as fun.", emoji: "💫" },
    ],
    question: { prompt: "Who shared the blocks?", options: ["Tiko", "Lulu", "Mimi"], answer: "Tiko" },
  },
];

export type Activity = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  character: CharacterId;
  skill: SkillKey | "music" | "story" | "animals";
  blurb: string;
};

export const ACTIVITIES: Activity[] = [
  { id: "colors", title: "Colors", emoji: "🌈", color: "var(--coral)", character: "lulu", skill: "colors", blurb: "Find and match colors" },
  { id: "shapes", title: "Shapes", emoji: "🔷", color: "var(--sky)", character: "tiko", skill: "shapes", blurb: "Hunt, match, build" },
  { id: "abc", title: "ABC Adventure", emoji: "🔤", color: "var(--lavender)", character: "pip", skill: "letters", blurb: "Letters, sounds, tracing" },
  { id: "numbers", title: "Number Garden", emoji: "🔢", color: "var(--leaf)", character: "bobo", skill: "numbers", blurb: "Count the garden" },
  { id: "animals", title: "Animal Friends", emoji: "🐾", color: "var(--peach)", character: "pip", skill: "animals", blurb: "Meet and match animals" },
  { id: "puzzle", title: "Puzzle Planet", emoji: "🧩", color: "var(--mint)", character: "tiko", skill: "puzzle", blurb: "Drag pieces into place" },
  { id: "music", title: "Music Garden", emoji: "🎵", color: "var(--sunshine)", character: "mimi", skill: "music", blurb: "Play and repeat rhythms" },
  { id: "memory", title: "Memory Magic", emoji: "🧠", color: "var(--lavender)", character: "bobo", skill: "memory", blurb: "Find the pairs" },
  { id: "drawing", title: "Drawing Fun", emoji: "✏️", color: "var(--peach)", character: "lulu", skill: "drawing", blurb: "Color and watch it move" },
  { id: "story", title: "Story Time", emoji: "📚", color: "var(--cream)", character: "mimi", skill: "story", blurb: "Short gentle stories" },
];

export const WORLDS = [
  { key: "garden", name: "Learning Garden", emoji: "🌳", token: "var(--leaf)", character: "pip" as CharacterId },
  { key: "rainbow", name: "Rainbow Valley", emoji: "🌈", token: "var(--coral)", character: "lulu" as CharacterId },
  { key: "space", name: "Space Adventure", emoji: "🚀", token: "var(--lavender)", character: "tiko" as CharacterId },
  { key: "ocean", name: "Ocean World", emoji: "🌊", token: "var(--sky)", character: "bobo" as CharacterId },
  { key: "dino", name: "Dinosaur Valley", emoji: "🦖", token: "var(--mint)", character: "pip" as CharacterId },
  { key: "cloud", name: "Cloud Kingdom", emoji: "☁️", token: "var(--peach)", character: "mimi" as CharacterId },
];

export const DAILY_PATH = [
  { step: 1, label: "Learn a Color", gameId: "colors" },
  { step: 2, label: "Count to 5", gameId: "numbers" },
  { step: 3, label: "Match Shapes", gameId: "shapes" },
  { step: 4, label: "ABC Game", gameId: "abc" },
  { step: 5, label: "Memory Challenge", gameId: "memory" },
] as const;

export const AVATARS = ["🧒", "👧", "🧑", "🦊", "🐼", "🐨", "🐸", "🦄"];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
