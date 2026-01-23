export type HouseTheme = 
  | 'stark' 
  | 'lannister' 
  | 'targaryen' 
  | 'baratheon' 
  | 'greyjoy' 
  | 'tyrell' 
  | 'martell' 
  | 'tully';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Challenge {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

export interface Player {
  id: string;
  username: string;
  roomCode: string;
  progress: number; // 0-100
  currentChallenge: number; // 1-5
  completedChallenges: number[];
  joinedAt: number;
  isOnline: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  description: string;
  houseTheme: HouseTheme;
  timerDuration: number; // in seconds
  timerRemaining: number; // in seconds
  status: RoomStatus;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  winnerId: string | null;
  adminId: string;
}

export interface Admin {
  id: string;
  email: string;
  displayName: string;
}

export interface GameSession {
  room: Room;
  players: Player[];
  isTimerRunning: boolean;
}

export const CHALLENGES: Omit<Challenge, 'completed'>[] = [
  {
    id: 1,
    name: "Trial of the First Men",
    description: "Prove your worth by completing the ancient trial that separates the worthy from the fallen."
  },
  {
    id: 2,
    name: "Riddle of the Maester",
    description: "Solve the cryptic riddle passed down through generations of the Citadel's wisest scholars."
  },
  {
    id: 3,
    name: "Path Through the Kingswood",
    description: "Navigate the treacherous forest where many have lost their way... and their lives."
  },
  {
    id: 4,
    name: "Secrets of the Citadel",
    description: "Uncover the hidden knowledge that lies within the ancient halls of learning."
  },
  {
    id: 5,
    name: "Iron Throne Ascension",
    description: "Complete the final challenge and claim your right to rule the Seven Kingdoms."
  }
];

export const HOUSE_NAMES: Record<HouseTheme, string> = {
  stark: 'House Stark',
  lannister: 'House Lannister',
  targaryen: 'House Targaryen',
  baratheon: 'House Baratheon',
  greyjoy: 'House Greyjoy',
  tyrell: 'House Tyrell',
  martell: 'House Martell',
  tully: 'House Tully',
};

export const HOUSE_MOTTOS: Record<HouseTheme, string> = {
  stark: 'Winter is Coming',
  lannister: 'Hear Me Roar',
  targaryen: 'Fire and Blood',
  baratheon: 'Ours is the Fury',
  greyjoy: 'We Do Not Sow',
  tyrell: 'Growing Strong',
  martell: 'Unbowed, Unbent, Unbroken',
  tully: 'Family, Duty, Honor',
};
