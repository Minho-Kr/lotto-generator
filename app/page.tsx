'use client';

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

// 최근 로또 당첨 번호 히스토리 (실제로는 API나 데이터베이스에서 가져올 수 있음)
const lottoHistory = [
  { round: 1159, date: '2025-02-22', numbers: [7, 13, 18, 36, 39, 45], bonus: 19 },
  { round: 1158, date: '2025-02-08', numbers: [21, 25, 27, 32, 37, 38], bonus: 20 },
  // 더 많은 과거 당첨 번호 추가 가능
];

// 번호 통계 계산 함수
const calculateNumberStatistics = (history) => {
  // 전체 번호 출현 횟수 계산
  const numberFrequency = new Array(45).fill(0);
  
  history.forEach(draw => {
    draw.numbers.forEach(number => {
      numberFrequency[number - 1]++;
    });
  });

  // 가장 많이 나온 번호 Top 10 추출
  const topNumbers = numberFrequency
    .map((freq, index) => ({ number: index + 1, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return {
    numberFrequency,
    topNumbers
  };
};

// 당첨 확률 계산 함수
const calculateWinningProbability = (selectedNumbers) => {
  // 단순화된 확률 계산 (실제 확률은 더 복잡함)
  const totalCombinations = 45;
  const selectedCount = selectedNumbers.length;

  // 6개 번호 일치 확률 (대략적인 근사치)
  const firstPrizeProbability = 1 / Math.pow(totalCombinations, selectedCount);
  
  // 5개 번호 + 보너스 번호 일치 확률
  const secondPrizeProbability = firstPrizeProbability * 2;
  
  // 5개 번호 일치 확률
  const thirdPrizeProbability = firstPrizeProbability * 10;

  return {
    firstPrize: (firstPrizeProbability * 100).toFixed(6),
    secondPrize: (secondPrizeProbability * 100).toFixed(6),
    thirdPrize: (thirdPrizeProbability * 100).toFixed(6)
  };
};

// 기존의 다른 함수들 (generateLottoNumbers, getBallColor 등) 그대로 유지

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [numberStats, setNumberStats] = useState(null);
  const [winningProbability, setWinningProbability] = useState(null);

  // 기존의 calculateTimeRemaining, useEffect 등 그대로 유지

  const handleGenerate = () => {
    setIsGenerating(true);
    setNumbers([]);
    setShowLoadingOverlay(true);

    setTimeout(() => {
      const newNumbers = generateLottoNumbers();
      setShowLoadingOverlay(false);
      
      newNumbers.forEach((number, index) => {
        setTimeout(() => {
          setNumbers(prev => {
            const updatedNumbers = [...prev, number];
            if (updatedNumbers.length === 6) {
              setIsGenerating(false);
              
              // 당첨 확률 계산
              const probability = calculateWinningProbability(updatedNumbers);
              setWinningProbability(probability);
            }
            return updatedNumbers;
          });
        }, index * 500);
      });
    }, 3000);
  };

  const toggleStatistics = () => {
    if (!showStatistics) {
      const stats = calculateNumberStatistics(lottoHistory);
      setNumberStats(stats);
    }
    setShowStatistics(!showStatistics);
  };

  // 나머지 기존 함수들 (copyNumbers 등) 그대로 유지

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col pb-4">
      <div className="container mx-auto max-w-md px-4 py-4 space-y-4">
        {/* 기존 컴포넌트들 그대로 유지 */}

        {/* 번호 생성기 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <h1 className="text-base font-bold text-center mb-1">로또 번호 생성기</h1>
          <p className="text-gray-600 text-center mb-2 text-xs">
            행운의 번호를 뽑아보세요!
          </p>

          <div className="flex justify-center mb-3 min-h-[60px]">
            <div className="inline-flex gap-1 justify-center flex-wrap">
              {numbers.map((number, index) => (
                <div
                  key={`${number}-${index}`}
                  className={`${getBallColor(
                    number
                  )} w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shadow-lg animate-pop-in`}
                >
                  {number}
                </div>
              ))}
            </div>
          </div>

          {/* 당첨 확률 표시 */}
          {winningProbability && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3 text-center">
              <h3 className="text-sm font-semibold mb-2">당첨 확률 예측</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-600">1등</p>
                  <p className="font-bold text-blue-600">{winningProbability.firstPrize}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">2등</p>
                  <p className="font-bold text-blue-600">{winningProbability.secondPrize}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">3등</p>
                  <p className="font-bold text-blue-600">{winningProbability.thirdPrize}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGenerating ? '번호 생성중...' : '번호 뽑기'}
            </button>

            <button 
              onClick={toggleStatistics}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg text-sm"
            >
              {showStatistics ? '통계 닫기' : '번호 통계'}
            </button>
          </div>

          {/* 번호 통계 모달 */}
          {showStatistics && numberStats && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-center">최근 당첨 번호 통계</h3>
              <div className="grid grid-cols-5 gap-1">
                {numberStats.topNumbers.map(stat => (
                  <div 
                    key={stat.number} 
                    className={`${getBallColor(stat.number)} text-white rounded-full flex items-center justify-center py-1`}
                  >
                    <span className="text-xs">{stat.number}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                최근 당첨 번호 중 가장 많이 나온 번호 Top 10
              </div>
            </div>
          )}

          <div className="mt-3 text-center text-gray-600">
            <h3 className="font-semibold mb-1 text-xs">✨ 번호 생성 방식</h3>
            <p className="text-xs text-gray-500">
              1부터 45까지의 숫자 중에서 무작위로 6개의 번호를 선택합니다.
            </p>
          </div>
        </div>
      </div>
      {showLoadingOverlay && <LoadingOverlay />}
      <Analytics />
    </div>
  );
}
