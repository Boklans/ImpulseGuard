export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://stage-api.impulseguard.app";

export type StatMetadata = {
  title: string;
  icon: any;
};

export const statsMetadata: Map<string, StatMetadata> = new Map([
  [
    "successfulSessions",
    {
      title: "Successful Sessions",
      icon: require("@/assets/images/stats/successfulSessions.png"),
    },
  ],
  [
    "longestStreak",
    {
      title: "Longest Streak",
      icon: require("@/assets/images/stats/longestStreak.png"),
    },
  ],
  [
    "currentStreak",
    {
      title: "Current Streak",
      icon: require("@/assets/images/stats/currentStreak.png"),
    },
  ],
  [
    "eggsHatched",
    {
      title: "Eggs Hatched",
      icon: require("@/assets/images/stats/eggsHatched.png"),
    },
  ],
]);

export const SessionDialogues = [
  {
    prompt: ["I’m glad you’re back.", "Tell me, how did your moment go?"],
    success: "Today, I chose peace over impulse.",
    failure: "Not this time… but I’m learning.",
  },
  {
    prompt: [
      "Hey! You did the thing, right?",
      "C’mon, tell me — did we crush that impulse?!",
    ],
    success: "Yes! I stayed strong! 🎉",
    failure: "Aww, not this time... but next round’s ours!",
  },
  {
    prompt: ["How did your heroic battle go?", "No judgment. Just curious."],
    success: "I resisted. Not bad, huh?",
    failure: "Impulse got me today. But I’m not done yet.",
  },
  {
    prompt: [
      "Hey, how are you feeling?",
      "Were you able to resist the impulse?",
    ],
    success: "I resisted — I’m proud of myself!",
    failure: "It was hard, but I’ll try again.",
  },
];

export const RewardIcons: Map<string, any> = new Map([
  ["food", require("@/assets/images/rewardIcons/food.png")],
  ["potion", require("@/assets/images/rewardIcons/potion.png")],
  ["toy", require("@/assets/images/rewardIcons/toy.png")],
  ["egg", require("@/assets/images/rewardIcons/egg.png")],
  ["special", require("@/assets/images/rewardIcons/special.png")],
  ["glims", require("@/assets/icons/glim.png")],
]);

export const ShopImages: Map<string, any> = new Map([
  ["1", require("@/assets/images/shopOptions/1.png")],
  ["2", require("@/assets/images/shopOptions/2.png")],
  ["3", require("@/assets/images/shopOptions/3.png")],
  ["4", require("@/assets/images/shopOptions/4.png")],
  ["5", require("@/assets/images/shopOptions/5.png")],
  ["6", require("@/assets/images/shopOptions/6.png")],
]);

export const NotificationSettings = [
  {
    group: "Progress",
    settings: [
      {
        icon: require("@/assets/images/notifications/levelUp.png"),
        tag: "onLevelUp",
        name: "Level Up",
        description: "You reached a new level!",
        premium: false,
      },
      {
        icon: require("@/assets/images/notifications/achievementUnlocked.png"),
        tag: "onAchievement",
        name: "Achievement Unlocked",
        description: "Get a badge? We'll let you know",
        premium: false,
      },
    ],
  },
  {
    group: "Pets and Eggs",
    settings: [
      {
        icon: require("@/assets/images/notifications/eggReady.png"),
        tag: "onEggReady",
        name: "Egg Ready",
        description: "Time to hatch your egg!",
        premium: false,
      },
      {
        icon: require("@/assets/images/notifications/newPetHatchet.png"),
        tag: "onPetHatched",
        name: "New Pet Hatched",
        description: "Say hi to your newest companion",
        premium: false,
      },
      {
        icon: require("@/assets/images/notifications/petNeedsYou.png"),
        tag: "onPetNeeds",
        name: "Pet Needs You",
        description: "One of pets feels lonely or hungry",
        premium: false,
      },
    ],
  },
  {
    group: "Streak & Motivation",
    settings: [
      {
        icon: require("@/assets/images/notifications/streakAtRisk.png"),
        tag: "onStreakWarning",
        name: "Streak at Risk",
        description: "Save your streak today!",
        premium: false,
      },
      {
        icon: require("@/assets/images/notifications/missedFirstSession.png"),
        tag: "onMissedFirstSession",
        name: "Missed First Session",
        description: "Get started today and hatch first pet",
        premium: false,
      },
    ],
  },
  {
    group: "Journal & Tasks",
    settings: [
      {
        icon: require("@/assets/images/notifications/noteReminder.png"),
        tag: "onNoteReminder",
        name: "Note Reminder",
        description: "Reflect on your session with a note",
        premium: true,
      },
      {
        icon: require("@/assets/images/notifications/taskReminder.png"),
        tag: "onTaskReminder",
        name: "Task Reminder",
        description: "One of your tasks is due today",
        premium: true,
      },
      {
        icon: require("@/assets/images/notifications/noteMilestone.png"),
        tag: "onNoteMilestone",
        name: "Note Milestone",
        description: "You're building great habits",
        premium: true,
      },
      {
        icon: require("@/assets/images/notifications/taskMilestone.png"),
        tag: "onTaskMilestone",
        name: "Task Milestone",
        description: "Your productivity just leveled up!",
        premium: true,
      },
    ],
  },
];

export const ToysImages: Map<string, any> = new Map([
  ["1", require("@/assets/images/toys/1.png")],
  ["2", require("@/assets/images/toys/2.png")],
  ["3", require("@/assets/images/toys/3.png")],
  ["4", require("@/assets/images/toys/4.png")],
  ["5", require("@/assets/images/toys/5.png")],
  ["6", require("@/assets/images/toys/6.png")],
  ["7", require("@/assets/images/toys/7.png")],
  ["8", require("@/assets/images/toys/8.png")],
  ["9", require("@/assets/images/toys/9.png")],
  ["10", require("@/assets/images/toys/10.png")],
  ["11", require("@/assets/images/toys/11.png")],
  ["12", require("@/assets/images/toys/12.png")],
  ["13", require("@/assets/images/toys/13.png")],
  ["14", require("@/assets/images/toys/14.png")],
  ["15", require("@/assets/images/toys/15.png")],
  ["16", require("@/assets/images/toys/16.png")],
  ["17", require("@/assets/images/toys/17.png")],
  ["18", require("@/assets/images/toys/18.png")],
  ["19", require("@/assets/images/toys/19.png")],
  ["20", require("@/assets/images/toys/20.png")],
]);

export const FoodImages: Map<string, any> = new Map([
  ["1", require("@/assets/images/food/1.png")],
  ["2", require("@/assets/images/food/2.png")],
  ["3", require("@/assets/images/food/3.png")],
  ["4", require("@/assets/images/food/4.png")],
  ["5", require("@/assets/images/food/5.png")],
  ["6", require("@/assets/images/food/6.png")],
  ["7", require("@/assets/images/food/7.png")],
  ["8", require("@/assets/images/food/8.png")],
  ["9", require("@/assets/images/food/9.png")],
  ["10", require("@/assets/images/food/10.png")],
  ["11", require("@/assets/images/food/11.png")],
  ["12", require("@/assets/images/food/12.png")],
  ["13", require("@/assets/images/food/13.png")],
  ["14", require("@/assets/images/food/14.png")],
  ["15", require("@/assets/images/food/15.png")],
  ["16", require("@/assets/images/food/16.png")],
  ["17", require("@/assets/images/food/17.png")],
  ["18", require("@/assets/images/food/18.png")],
  ["19", require("@/assets/images/food/19.png")],
  ["20", require("@/assets/images/food/20.png")],
  ["21", require("@/assets/images/food/21.png")],
  ["22", require("@/assets/images/food/22.png")],
  ["23", require("@/assets/images/food/23.png")],
  ["24", require("@/assets/images/food/24.png")],
  ["25", require("@/assets/images/food/25.png")],
  ["26", require("@/assets/images/food/26.png")],
  ["27", require("@/assets/images/food/27.png")],
  ["28", require("@/assets/images/food/28.png")]
]);

export const PotionsImages: Map<string, any> = new Map([
  ["1", require("@/assets/images/potions/1.png")],
  ["2", require("@/assets/images/potions/2.png")],
  ["3", require("@/assets/images/potions/3.png")],
  ["4", require("@/assets/images/potions/4.png")],
  ["5", require("@/assets/images/potions/5.png")],
  ["6", require("@/assets/images/potions/6.png")],
  ["7", require("@/assets/images/potions/7.png")],
  ["8", require("@/assets/images/potions/8.png")],
]);

export const UnlockedIcons: Map<string, any> = new Map([
  ["🌱", require("@/assets/images/achievements/sprout.png")],
  ["🥇", require("@/assets/images/achievements/firstVictory.png")],
  ["🧱", require("@/assets/images/achievements/buildingTheHabit.png")],
  ["🌿", require("@/assets/images/achievements/zenMaster.png")],
  ["🔥", require("@/assets/images/achievements/smallFlame.png")],
  ["🔥7", require("@/assets/images/achievements/consistencyHero.png")],
  ["🧨", require("@/assets/images/achievements/legendaryStreak.png")],
  ["🧠", require("@/assets/images/achievements/memoryMaker.png")],
  ["📝", require("@/assets/images/achievements/reflectiveSoul.png")],
  ["✅", require("@/assets/images/achievements/thingsDone.png")],
  ["💼", require("@/assets/images/achievements/productivityMachine.png")],
  ["🥚", require("@/assets/images/achievements/firstEgg.png")],
  ["🐣", require("@/assets/images/achievements/firstPet.png")],
  ["🐾", require("@/assets/images/achievements/petCollector.png")],
  ["⭐", require("@/assets/images/achievements/levelUp.png")],
  ["🌟", require("@/assets/images/achievements/veteran.png")],
  ["💪", require("@/assets/images/achievements/comebackKid.png")],
]);

export const LockedIcons: Map<string, any> = new Map([
  ["🌱", require("@/assets/images/achievements/locked/sprout.png")],
  ["🥇", require("@/assets/images/achievements/locked/firstVictory.png")],
  ["🧱", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  ["🌿", require("@/assets/images/achievements/locked/zenMaster.png")],
  ["🔥", require("@/assets/images/achievements/locked/smallFlame.png")],
  ["🔥7", require("@/assets/images/achievements/locked/consistencyHero.png")],
  ["🧨", require("@/assets/images/achievements/locked/legendaryStreak.png")],
  ["🧠", require("@/assets/images/achievements/locked/memoryMaker.png")],
  ["📝", require("@/assets/images/achievements/locked/reflectiveSoul.png")],
  ["✅", require("@/assets/images/achievements/locked/thingsDone.png")],
  [
    "💼",
    require("@/assets/images/achievements/locked/productivityMachine.png"),
  ],
  ["🥚", require("@/assets/images/achievements/locked/firstEgg.png")],
  ["🐣", require("@/assets/images/achievements/locked/firstPet.png")],
  ["🐾", require("@/assets/images/achievements/locked/petCollector.png")],
  ["⭐", require("@/assets/images/achievements/locked/levelUp.png")],
  ["🌟", require("@/assets/images/achievements/locked/veteran.png")],
  ["💪", require("@/assets/images/achievements/locked/comebackKid.png")],
]);

export const LvlRewardIcons: Map<string, any> = new Map([
  ["glims", require("@/assets/icons/glim.png")],
  ["egg", require("@/assets/images/eggs/warningEgg.png")],
  ["ball", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  ["doll", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  [
    "coffee",
    require("@/assets/images/achievements/locked/buildingTheHabit.png"),
  ],
  [
    "hamburger",
    require("@/assets/images/achievements/locked/buildingTheHabit.png"),
  ],
  ["toy", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  ["milk", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  ["pet", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  ["tea", require("@/assets/images/achievements/locked/buildingTheHabit.png")],
  [
    "pizza",
    require("@/assets/images/achievements/locked/buildingTheHabit.png"),
  ],
]);

type Egg = {
  id: number;
  image: any;
  isHatched: boolean;
  colors: [string, string];
};

export const eggsList: Egg[] = [
  {
    id: 1,
    image: require("@/assets/images/eggs/1.png"),
    isHatched: false,
    colors: ["#C4E050", "#FFFFFF"],
  },
  {
    id: 2,
    image: require("@/assets/images/eggs/2.png"),
    isHatched: false,
    colors: ["#B4CCDD", "#FFFFFF"],
  },
  {
    id: 3,
    image: require("@/assets/images/eggs/3.png"),
    isHatched: false,
    colors: ["#FFB293", "#FFFFFF"],
  },
  {
    id: 4,
    image: require("@/assets/images/eggs/4.png"),
    isHatched: false,
    colors: ["#FFE8C7", "#FFFFFF"],
  },
  {
    id: 5,
    image: require("@/assets/images/eggs/5.png"),
    isHatched: false,
    colors: ["#A5C5FF", "#FFFFFF"],
  },
  {
    id: 6,
    image: require("@/assets/images/eggs/6.png"),
    isHatched: false,
    colors: ["#9CA3BD", "#FFFFFF"],
  },
];

export const specialItemsList = [
  { id: 1, image: require("@/assets/images/special/1.png") },
];

export type AvatarData = {
  image: any;
  locked: boolean;
};

export const AvatarImages: Map<string, AvatarData> = new Map([
  ["1", { image: require("@/assets/images/avatars/1.png"), locked: false }],
  ["2", { image: require("@/assets/images/avatars/2.png"), locked: false }],
  ["3", { image: require("@/assets/images/avatars/3.png"), locked: false }],
  ["4", { image: require("@/assets/images/avatars/4.png"), locked: false }],
  ["5", { image: require("@/assets/images/avatars/5.png"), locked: false }],
  ["6", { image: require("@/assets/images/avatars/6.png"), locked: false }],
  ["7", { image: require("@/assets/images/avatars/7.png"), locked: false }],
  ["8", { image: require("@/assets/images/avatars/8.png"), locked: false }],
  ["9", { image: require("@/assets/images/avatars/9.png"), locked: true }],
  ["10", { image: require("@/assets/images/avatars/10.png"), locked: true }],
  ["11", { image: require("@/assets/images/avatars/11.png"), locked: true }],
  ["12", { image: require("@/assets/images/avatars/12.png"), locked: true }],
]);

export const DEFAULT_AVATAR = "1";
