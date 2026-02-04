export interface Game4Level {
  id: number;
  image: string;
  hint: string;
  bagOfWords: string[];
}
export const game4Levels: Game4Level[] = [
  {
    id: 1,
    image: "/images/level1_jon.jpg",
    hint: "The Bastard of Winterfell faces the charge.",
    bagOfWords: [
      "jon", "snow", "man", "warrior", "standing", "stands", "alone", "battlefield", "mud", "muddy", "ground",
      "drawing", "sword", "weapon", "charging", "cavalry", "horses", "soldiers",
      "dark", "cloak", "leather", "armor", "brave", "facing", "enemy", "army",
      "dramatic", "dramatically", "cinematic", "battle", "war", "courage", "showing",
      "against", "while", "his", "in", "on", "the", "a", "as", "of", "this"
    ]
  },
  {
    id: 2,
    image: "/images/level2_dany.jpg",
    hint: "The Queen of Ashes surveys her forces.",
    bagOfWords: [
      "daenerys", "targaryen", "woman", "queen", "silver", "blonde", "hair", "overlooking", "viewing", "watching",
      "army", "massive", "soldiers", "troops", "helmets", "spears", "formation", "unsullied",
      "snow", "snowy", "winter", "white", "ruins", "ruined", "city", "destroyed",
      "buildings", "architecture", "leader", "commander", "regal", "powerful",
      "a", "of", "in"
    ]
  },
  {
    id: 3,
    image: "/images/level3_throne.jpg",
    hint: "The most dangerous seat in the realm.",
    bagOfWords: [
      "throne", "chair", "seat", "iron", "metal", "swords", "blades", "melted",
      "forged", "twisted", "sharp", "dangerous", "hall", "great", "chamber",
      "dark", "darkness", "shadows", "light", "shafts", "beams", "rays", "sunlight",
      "stone", "pillars", "columns", "majestic", "imposing", "power", "empty",
      "the", "made", "of", "sitting", "in", "a", "with"
    ]
  },
  {
    id: 4,
    image: "/images/level4_dragon.jpg",
    hint: "Mother and Child.",
    bagOfWords: [
      "close", "up", "daenerys", "targaryen", "woman", "face", "close-up", "closeup", "portrait", "dragon", "creature",
      "beast", "black", "dark", "scales", "reptile", "giant", "large", "massive",
      "eye", "eyes", "staring", "gazing", "looking", "contact", "intense", "connection",
      "bond", "touching", "hand", "skin", "fantasy", "mythical", "powerful",
      "to", "with", "a", "of"
    ]
  },
  {
    id: 5,
    image: "/images/level5_hall.jpg",
    hint: "The ancestral seat of House Targaryen.",
    bagOfWords: [
      "geometric", "hall", "room", "chamber", "dining", "table", "symmetrical",
      "stone", "rock", "carved", "architecture", "castle", "fortress", "medieval",
      "wall", "sigil", "emblem", "symbol", "dragon", "three-headed", "targaryen",
      "design", "pattern", "map", "floor", "empty", "grand", "imposing", "dark",
      "dragonstone", "in", "with", "a", "large", "on", "the"
    ]
  }
];
