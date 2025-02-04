// data/lotteryData.ts

export interface LotteryResult {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  totalPrize: number;
}

export const recentWinningNumbers: LotteryResult[] = [
  {
    round: 1102,
    date: '2024-02-03',
    numbers: [2, 4, 15, 23, 29, 38],
    bonus: 39,
    totalPrize: 2364851750,
  },
  {
    round: 1101,
    date: '2024-01-27',
    numbers: [3, 11, 13, 19, 36, 42],
    bonus: 8,
    totalPrize: 3187651250,
  },
  {
    round: 1100,
    date: '2024-01-20',
    numbers: [7, 12, 15, 24, 37, 45],
    bonus: 16,
    totalPrize: 2854123600,
  },
  {
    round: 1099,
    date: '2024-01-13',
    numbers: [4, 8, 18, 25, 27, 32],
    bonus: 42,
    totalPrize: 2741256300,
  },
  {
    round: 1098,
    date: '2024-01-06',
    numbers: [1, 6, 13, 37, 38, 40],
    bonus: 9,
    totalPrize: 2965147800,
  },
];

export const getNumberFrequency = () => {
  const frequency: { [key: number]: number } = {};

  // Initialize frequency count for all numbers (1-45)
  for (let i = 1; i <= 45; i++) {
    frequency[i] = 0;
  }

  // Count frequency of each number
  recentWinningNumbers.forEach((result) => {
    result.numbers.forEach((num) => {
      frequency[num]++;
    });
  });

  return frequency;
};

export const analyzeNumbers = (numbers: number[]) => {
  const results = recentWinningNumbers.map((winning) => {
    const matched = numbers.filter((num) => winning.numbers.includes(num));
    const hasBonus = numbers.includes(winning.bonus);

    return {
      round: winning.round,
      date: winning.date,
      matched: matched.length,
      matchedNumbers: matched,
      hasBonus,
      prize: getPrize(matched.length, hasBonus),
    };
  });

  return results;
};

const getPrize = (matchCount: number, hasBonus: boolean) => {
  switch (matchCount) {
    case 6:
      return '1등';
    case 5:
      return hasBonus ? '2등' : '3등';
    case 4:
      return '4등';
    case 3:
      return '5등';
    default:
      return '낙첨';
  }
};
