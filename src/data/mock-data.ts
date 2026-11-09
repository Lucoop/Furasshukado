export type Deck = {
  id: string;
  title: string;
  subject: string;
  cards: number;
  due: number;
  lastReviewed: string;
  cover: string;
  tone: "rose" | "blue" | "green" | "amber";
};

export const decks: Deck[] = [
  { id: "japanese", title: "Japonais — Vocabulaire", subject: "Langues", cards: 52, due: 18, lastReviewed: "Aujourd'hui", cover: "あ", tone: "rose" },
  { id: "astronomy", title: "Astronomie", subject: "Sciences", cards: 34, due: 12, lastReviewed: "Hier", cover: "✦", tone: "blue" },
  { id: "french", title: "Français — Grammaire", subject: "Langues", cards: 48, due: 7, lastReviewed: "Il y a 3 jours", cover: "Aa", tone: "green" },
];

export const sampleCards = [
  { front: "桜 (sakura)", back: "Cerisier / fleur de cerisier" },
  { front: "東京 (Tōkyō)", back: "Tokyo" },
  { front: "ありがとう (arigatō)", back: "Merci" },
];