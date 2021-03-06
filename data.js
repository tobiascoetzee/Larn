'use strict';


/************************************************/
/* never, ever, never use a code formatter here */
/************************************************/


const MAXLEVEL = 11;      /* max # levels in the dungeon  */
const MAXVLEVEL = 3;      /* max # of levels in the temple of the luran */
const LOG_SIZE = 5;       /* number of log lines to show */
const LOG_SAVE_SIZE = 20; /* number of log lines to save */
const MAXINVEN = 26;      /* max number of items a player can carry */
const MAXX = 67;          /* maze width */
const MAXY = 17;          /* maze height */
const TAXRATE = 1 / 20;   /* amount of taxes owed after winning */
const MAXPLEVEL = 100;    /* maximum player level allowed  */
const TIMELIMIT = 30000;  /* maximum number of moves before the game is called */



const LEVELNAMES = [];



/*
    table of experience needed to be a certain level of player
    SKILL[c[LEVEL]] is the experience required to attain the next level
 */
const MEG = 1000000;

const SKILL = [
  0,         10,        20,        40,        80,
  160,       320,       640,       1280,      2560,
  5120,      10240,     20480,     40960,     100000,
  200000,    400000,    700000,    1 * MEG,   2 * MEG,
  3 * MEG,   4 * MEG,   5 * MEG,   6 * MEG,   8 * MEG,
  10 * MEG,  12 * MEG,  14 * MEG,  16 * MEG,  18 * MEG,
  20 * MEG,  22 * MEG,  24 * MEG,  26 * MEG,  28 * MEG,
  30 * MEG,  32 * MEG,  34 * MEG,  36 * MEG,  38 * MEG,
  40 * MEG,  42 * MEG,  44 * MEG,  46 * MEG,  48 * MEG,
  50 * MEG,  52 * MEG,  54 * MEG,  56 * MEG,  58 * MEG,
  60 * MEG,  62 * MEG,  64 * MEG,  66 * MEG,  68 * MEG,
  70 * MEG,  72 * MEG,  74 * MEG,  76 * MEG,  78 * MEG,
  80 * MEG,  82 * MEG,  84 * MEG,  86 * MEG,  88 * MEG,
  90 * MEG,  92 * MEG,  94 * MEG,  96 * MEG,  98 * MEG,
  100 * MEG, 105 * MEG, 110 * MEG, 115 * MEG, 120 * MEG,
  125 * MEG, 130 * MEG, 135 * MEG, 140 * MEG, 145 * MEG,
  150 * MEG, 155 * MEG, 160 * MEG, 165 * MEG, 170 * MEG,
  175 * MEG, 180 * MEG, 185 * MEG, 190 * MEG, 195 * MEG,
  200 * MEG, 210 * MEG, 220 * MEG, 230 * MEG, 240 * MEG,
  250 * MEG, 260 * MEG, 270 * MEG, 280 * MEG, 290 * MEG,
  300 * MEG
];



const CLASSES = [
`novice explorer`,      `apprentice explorer`,  `practiced explorer`,   /*  -3*/
`expert explorer`,      `novice adventurer`,    `adventurer`,           /*  -6*/
`apprentice conjurer`,  `conjurer`,             `master conjurer`,      /*  -9*/
`apprentice mage`,      `mage`,                 `experienced mage`,     /* -12*/
`master mage`,          `apprentice warlord`,   `novice warlord`,       /* -15*/
`expert warlord`,       `master warlord`,       `apprentice gorgon`,    /* -18*/
`gorgon`,               `practiced gorgon`,     `master gorgon`,        /* -21*/
`demi-gorgon`,          `evil master`,          `great evil master`,    /* -24*/
`great evil master`,    `mighty evil master`,   `mighty evil master`,   /* -27*/
`mighty evil master`,   `mighty evil master`,   `mighty evil master`,   /* -30*/
`mighty evil master`,   `mighty evil master`,   `mighty evil master`,   /* -33*/
`mighty evil master`,   `mighty evil master`,   `mighty evil master`,   /* -36*/
`mighty evil master`,   `mighty evil master`,   `mighty evil master`,   /* -39*/
`apprentice demi-god`,  `apprentice demi-god`,  `apprentice demi-god`,  /* -42*/
`apprentice demi-god`,  `apprentice demi-god`,  `apprentice demi-god`,  /* -45*/
`apprentice demi-god`,  `apprentice demi-god`,  `apprentice demi-god`,  /* -48*/
`minor demi-god`,       `minor demi-god`,       `minor demi-god`,       /* -51*/
`minor demi-god`,       `minor demi-god`,       `minor demi-god`,       /* -54*/
`minor demi-god`,       `minor demi-god`,       `minor demi-god`,       /* -57*/
`major demi-god`,       `major demi-god`,       `major demi-god`,       /* -60*/
`major demi-god`,       `major demi-god`,       `major demi-god`,       /* -63*/
`major demi-god`,       `major demi-god`,       `major demi-god`,       /* -66*/
`minor deity`,          `minor deity`,          `minor deity`,          /* -69*/
`minor deity`,          `minor deity`,          `minor deity`,          /* -72*/
`minor deity`,          `minor deity`,          `minor deity`,          /* -75*/
`major deity`,          `major deity`,          `major deity`,          /* -78*/
`major deity`,          `major deity`,          `major deity`,          /* -81*/
`major deity`,          `major deity`,          `major deity`,          /* -84*/
`novice guardian`,      `novice guardian`,      `novice guardian`,      /* -87*/
`apprentice guardian`,  `apprentice guardian`,  `apprentice guardian`,  /* -90*/
`apprentice guardian`,  `apprentice guardian`,  `apprentice guardian`,  /* -93*/
`earth guardian`,       `air guardian`,         `fire guardian`,        /* -96*/
`water guardian`,       `time guardian`,        `ethereal guardian`,    /* -99*/
`The Creator`,          `The Creator`,          `The Creator`,         /* -102*/
];



const DEATH_REASONS = [
  ``,
  ``,
  `self - annihilated`,
  `shot by an arrow`,
  `hit by a dart`,
  `fell into a pit`,
  `fell into a bottomless pit`,
  `a winner`,
  `trapped in solid rock`,
  ``,
  ``,
  ``,
  ``,
  `failed`,
  `erased by a wayward finger`,
  `fell through a bottomless trap door`,
  `fell through a trap door`,
  `drank some poisonous water`,
  `fried by an electric shock`,
  `slipped on a volcano shaft`,
  ``,
  `attacked by a revolting demon`,
  `hit by own magic`,
  `demolished by an unseen attacker`,
  `fell into the dreadful sleep`,
  `killed by an exploding chest`,
  ``,
  `annihilated in a sphere`,
  ``,
  ``,
  `a quitter`,
];



/*
 *  to create scroll numbers with appropriate probability of occurrence
 *
 *  0 - armor               1 - weapon              2 - enlightenment
 *  3 - paper               4 - create monster      5 - create item
 *  6 - aggravate           7 - time warp           8 - teleportation
 *  9 - expanded awareness  10 - haste monst        11 - heal monster
 *  12 - spirit protection  13 - undead protection  14 - stealth
 *  15 - magic mapping      16 - hold monster       17 - gem perfection
 *  18 - spell extension    19 - identify           20 - remove curse
 *  21 - annihilation       22 - pulverization      23 - life protection
 */
const SCROLL_PROBABILITY = [
  0, 0, 0, 0, 1, 1, 1, 1, 1, 2,
  2, 2, 2, 2, 2, 3, 3, 3, 3, 3,
  4, 4, 4, 5, 5, 5, 5, 5, 6, 6,
  6, 6, 6, 7, 7, 7, 7, 8, 8, 8,
  9, 9, 9, 9, 10, 10, 10, 10, 11, 11,
  11, 12, 12, 12, 13, 13, 13, 13, 14, 14,
  15, 15, 16, 16, 16, 17, 17, 18, 18, 19,
  19, 19, 20, 20, 20, 20, 21, 22, 22, 22,
  23
];



/*
 *  function to return a potion number created with appropriate probability
 *  of occurrence
 *
 *  0 - sleep               1 - healing                 2 - raise level
 *  3 - increase ability    4 - gain wisdom             5 - gain strength
 *  6 - increase charisma   7 - dizziness               8 - learning
 *  9 - object detection    10 - monster detection      11 - forgetfulness
 *  12 - water              13 - blindness              14 - confusion
 *  15 - heroism            16 - sturdiness             17 - giant strength
 *  18 - fire resistance    19 - treasure finding       20 - instant healing
 *  21 - cure dianthroritis 22 - poison                 23 - see invisible
 */
const POTION_PROBABILITY = [
  0, 0, 1, 1, 1, 2, 3, 3, 4, 4,
  5, 5, 6, 6, 7, 7, 8, 9, 9, 9,
  10, 10, 10, 11, 11, 12, 12, 13, 14, 15,
  16, 17, 18, 19, 19, 19, 20, 20, 22, 22,
  23, 23
];



/*  name array for magic scrolls */
const SCROLL_NAMES = [
  `enchant armor`, `enchant weapon`, `enlightenment`,
  `blank paper`, `create monster`, `create artifact`,
  `aggravate monsters`, `time warp`, `teleportation`,
  `expanded awareness`, `haste monsters`, `monster healing`,
  `spirit protection`, `undead protection`, `stealth`,
  `magic mapping`, `hold monsters`, `gem perfection`,
  `spell extension`, `identify`, `remove curse`,
  `annihilation`, `pulverization`, `life protection`
];



/*  name array for magic potions */
const POTION_NAMES = [
  `sleep`, `healing`, `raise level`,
  `increase ability`, `wisdom`, `strength`,
  `raise charisma`, `dizziness`, `learning`,
  `object detection`, `monster detection`, `forgetfulness`,
  `water`, `blindness`, `confusion`,
  `heroism`, `sturdiness`, `giant strength`,
  `fire resistance`, `treasure finding`, `instant healing`,
  `cure dianthroritis`, `poison`, `see invisible`
];



const FORTUNES = [
  `Gem value = gem * 2 ^ perfection`,
  `Sitting down can have unexpected results`,
  `Don't pry into the affairs of others`,
  `Drinking can be hazardous to your health`,
  `Beware of the gusher!`,
  `Some monsters are greedy`,
  `Nymphs have light fingers`,
  `Try kissing a disenchantress!`,
  `The Eye of Larn improves with time`,
  `Hammers and brains don't mix`,
  `What does a potion of cure dianthroritis taste like?`,
  `Hit point gain/loss when raising a level depends on constitution`,
  `Healing a mighty wizard can be exhilarating`,
  `Be sure to pay your taxes`,
  `Are Vampires afraid of something?`,
  `Some dragons can fly`,
  `Dost thou strive for perfection?`,
  `Patience is a virtue, unless your daughter dies`,
  `What does the Eye of Larn see in its guardian?`,
  `A level 25 player casts like crazy!`,
  `Energy rings affect spell regeneration`,
  `My, aren't you clever!`,
  `Difficulty affects regeneration`,
  `Control of the pesty spirits is most helpful`,
  `Don't fall into a bottomless pit`,
  `Dexterity allows you to carry more`,
  `You can get 2 points of WC for the price of one`,
  `Never enter the dungeon naked! The monsters will laugh at you!`,
  `Did someone put itching powder in your armor?`,
  `You klutz!`,
  `Avoid opening doors. You never know whats on the other side.`,
  `Infinite regeneration ---> temptation`,
  `The greatest weapon in the game has not the highest Weapon Class`,
  `You can't buy the most powerful scroll`,
  `Identify things before you use them`,
  `There's more than one way through a wall`,
];
