'use client';

import React, { useState } from 'react';

const latestLottoResult = {
  round: 1102,
  date: '2024-02-03',
  numbers: [2, 4, 15, 23, 29, 38],
  bonus: 39,
  winners: {
    first: 12,
    firstPrize: '2,364,851,750원',
    second: 54,
    secondPrize: '62,421,052원',
    third: 2142,
    thirdPrize: '1,573,134원',
  },
};

const generateLottoNumbers = (): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < 6) {
    const number = Math.floor(Math.random() * 45) + 1;
    numbers.add(number);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const getBallColor = (number: number) => {
  if (number <= 10) return 'bg-yellow-500';
  if (number <= 20) return 'bg-blue-500';
  if (number <= 30) return 'bg-red-500';
  if (number <= 40) return 'bg-gray-500';
  return 'bg-green-500';
};

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setNumbers([]);

    const newNumbers = generateLottoNumbers();

    newNumbers.forEach((number, index) => {
      setTimeout(() => {
        setNumbers((prev) => {
          const updatedNumbers = [...prev, number];
          if (updatedNumbers.length === 6) {
            setIsGenerating(false);
          }
          return updatedNumbers;
        });
      }, index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <div className="container mx-auto max-w-md px-4 py-8 space-y-6">
        {/* 최신 당첨 정보 섹션 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-lg font-bold">
              {latestLottoResult.round}회 당첨결과
            </h2>
            <p className="text-sm">{latestLottoResult.date}</p>
          </div>
          <div className="p-4">
            <div className="flex gap-2 justify-center mb-4">
              {latestLottoResult.numbers.map((number, index) => (
                <div
                  key={index}
                  className={`${getBallColor(
                    number
                  )} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                >
                  {number}
                </div>
              ))}
              <div className="flex items-center mx-2">+</div>
              <div
                className={`${getBallColor(
                  latestLottoResult.bonus
                )} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold`}
              >
                {latestLottoResult.bonus}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>1등 (6개 번호 일치)</span>
                <span className="font-bold">
                  {latestLottoResult.winners.firstPrize}
                </span>
              </p>
              <p className="flex justify-between">
                <span>2등 (5개 + 보너스)</span>
                <span>{latestLottoResult.winners.secondPrize}</span>
              </p>
              <p className="flex justify-between">
                <span>3등 (5개 번호 일치)</span>
                <span>{latestLottoResult.winners.thirdPrize}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 번호 생성기 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-2">
            로또 번호 생성기
          </h1>
          <p className="text-gray-600 text-center mb-6">
            행운의 번호를 뽑아보세요!
          </p>

          <div className="flex justify-center mb-6 min-h-[100px]">
            <div className="inline-flex gap-3 justify-center flex-wrap">
              {numbers.map((number, index) => (
                <div
                  key={`${number}-${index}`}
                  className={`${getBallColor(
                    number
                  )} w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg animate-pop-in`}
                >
                  {number}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '번호 생성중...' : '번호 뽑기'}
          </button>

          <div className="mt-8 text-center text-gray-600">
            <h3 className="font-semibold mb-2">✨ 번호 생성 방식</h3>
            <p className="text-sm">
              1부터 45까지의 숫자 중에서 무작위로 6개의 번호를 선택합니다. 모든
              번호는 공정한 난수 생성 방식으로 선택됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
