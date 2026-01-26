export interface Game4Level {
  id: number;
  image: string;
  target: string;
  hint: string;
}

// Note: Replace placeholder images with actual Game of Thrones images
// Images should be placed in /public/images/ directory
export const game4Levels: Game4Level[] = [
  {
    id: 1,
    image: "/images/level1_jon.jpg",
    target: "Jon Snow standing alone on a muddy battlefield drawing his sword against a charging cavalry",
    hint: "The Bastard of Winterfell faces the charge."
  },
  {
    id: 2,
    image: "/images/level2_dany.jpg",
    target: "Daenerys Targaryen overlooking a massive army of Unsullied soldiers in a snowy ruined city",
    hint: "The Queen of Ashes surveys her forces."
  },
  {
    id: 3,
    image: "/images/level3_throne.jpg",
    target: "The Iron Throne made of melted swords sitting in a dark Great Hall with shafts of light",
    hint: "The most dangerous seat in the realm."
  },
  {
    id: 4,
    image: "/images/level4_dragon.jpg",
    target: "Close up of Daenerys Targaryen face to face with a giant black dragon intense eye contact",
    hint: "Mother and Child."
  },
  {
    id: 5,
    image: "/images/level5_hall.jpg",
    target: "Geometric stone dining hall in Dragonstone with a large Targaryen sigil on the wall",
    hint: "The ancestral seat of House Targaryen."
  }
];
