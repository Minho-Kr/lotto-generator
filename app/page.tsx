'use client';

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

// 로또 당첨 결과 타입 정의
type LottoResult = {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
};

// 최근 로또 당첨 번호 히스토리
const lottoHistory: LottoResult[] = [
  { round: 1159, date: '2025-02-22', numbers: [7, 13, 18, 36, 39, 45], bonus: 19 },
  { round: 1158, date: '2025-02-08', numbers: [21, 25, 27, 32, 37, 38], bonus: 20 }
];

// 번호 통계 계산 함수
const calculateNumberStatistics = (history: LottoResult[]) => {
  const numberFrequency = new Array(45).fill(0);
  
  history.forEach(draw => {
    draw.numbers.forEach(number => {
      numberFrequency[number - 1]++;
    });
  });

  return {
    topNumbers: numberFrequency
      .map((freq, index) => ({ number: index + 1, frequency: freq }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
  };
};

// 당첨 확률 계산 함수
const calculateWinningProbability = (selectedNumbers: number[]) => {
  const totalCombinations = 45;
  const selectedCount = selectedNumbers.length;

  const firstPrizeProbability = 1 / Math.pow(totalCombinations, selectedCount);
  const secondPrizeProbability = firstPrizeProbability * 2;
  const thirdPrizeProbability = firstPrizeProbability * 10;

  return {
    firstPrize: (firstPrizeProbability * 100).toFixed(6),
    secondPrize: (secondPrizeProbability * 100).toFixed(6),
    thirdPrize: (thirdPrizeProbability * 100).toFixed(6)
  };
};

// 번호 생성 및 색상 함수
const generateLottoNumbers = (): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
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

// 로딩 오버레이 컴포넌트
const LoadingOverlay = () => {
  const loadingBalls = [
    { color: 'bg-yellow-500' }, { color: 'bg-blue-500' }, 
    { color: 'bg-red-500' }, { color: 'bg-gray-500' }, 
    { color: 'bg-green-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 relative flex flex-col items-center">
        <div className="flex gap-2 justify-center mb-3">
          {loadingBalls.map((ball, index) => (
            <div
              key={index}
              className={`${ball.color} rounded-full shadow-lg`}
              style={{
                width: '30px',
                height: '30px',
                animation: `bounce 0.5s ease-in-out ${index * 0.1}s infinite alternate`
              }}
            />
          ))}
        </div>
        <p className="text-gray-600 mt-2">행운의 번호를 뽑는 중...</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [numberStats, setNumberStats] = useState<ReturnType<typeof calculateNumberStatistics> | null>(null);
  const [winningProbability, setWinningProbability] = useState<ReturnType<typeof calculateWinningProbability> | null>(null);

  // 남은 시간 계산 함수
  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextDrawTime = new Date(now);
    
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
    nextDrawTime.setDate(now.getDate() + daysUntilSaturday);
    nextDrawTime.setHours(20, 35, 0, 0);

    if (nextDrawTime < now) {
      nextDrawTime.setDate(nextDrawTime.getDate() + 7);
    }

    const difference = nextDrawTime.getTime() - now.getTime();
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
  };

  // 타이머 설정
  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 번호 생성 핸들러
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
              setWinningProbability(calculateWinningProbability(updatedNumbers));
            }
            return updatedNumbers;
          });
        }, index * 500);
      });
    }, 3000);
  };

  // 번호 복사 핸들러
  const copyNumbers = () => {
    const numbersText = numbers.join(', ');
    navigator.clipboard.writeText(`로또 번호: ${numbersText}`)
      .then(() => alert('번호가 클립보드에 복사되었습니다!'))
      .catch(() => alert('클립보드 복사에 실패했습니다.'));
  };

  // 통계 토글 핸들러
  const toggleStatistics = () => {
    if (!showStatistics) {
      setNumberStats(calculateNumberStatistics(lottoHistory));
    }
    setShowStatistics(!showStatistics);
  };

  // UI 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col pb-4">
      <div className="container mx-auto max-w-md px-4 py-4 space-y-4">
        {/* 최신 당첨 정보 섹션 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-3">
            <h2 className="text-base font-bold">
              {lottoHistory[0].round}회 당첨결과
            </h2>
            <p className="text-xs">{lottoHistory[0].date}</p>
          </div>
          <div className="p-3">
            {/* 당첨 번호 디스플레이 */}
            <div className="flex items-center justify-center gap-1 mb-3">
              {lottoHistory[0].numbers.map((number, index) => (
                <div
                  key={index}
                  className={`${getBallColor(number)} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                >
                  {number}
                </div>
              ))}
              <div className="text-gray-600 text-xl font-bold mx-1">+</div>
              <div
                className={`${getBallColor(lottoHistory[0].bonus)} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
              >
                {lottoHistory[0].bonus}
              </div>
            </div>
            {/* 당첨금 정보 */}
            <div className="space-y-1 text-xs px-2">
              <p className="flex justify-between items-center">
                <span className="text-gray-700">1등 (6개 번호 일치)</span>
                <span className="font-bold text-blue-600">2,509,359,875원</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-gray-700">2등 (5개 + 보너스)</span>
                <span className="text-blue-500">59,746,664원</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="text-gray-700">3등 (5개 번호 일치)</span>
                <span className="text-blue-500">1,580,202원</span>
              </p>
            </div>
          </div>
        </div>

        {/* 다음 추첨 시간 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-3 text-center">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            다음 로또 추첨까지
          </h3>
          <div className="text-xl font-bold text-blue-600">
            {timeRemaining}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            (매주 토요일 오후 8시 35분)
          </p>
        </div>

        {/* 번호 생성기 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-3">
          <h1 className="text-base font-bold text-center mb-1">로또 번호 생성기</h1>
          <p className="text-gray-600 text-center mb-2 text-xs">
            행운의 번호를 뽑아보세요!
          </p>

          {/* 생성된 번호 디스플레이 */}
          <div className="flex justify-center mb-3 min-h-[60px]">
            <div className="inline-flex gap-1 justify-center flex-wrap">
              {numbers.map((number, index) => (
                <div
                  key={`${number}-${index}`}
                  className={`${getBallColor(number)} w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shadow-lg animate-pop-in`}
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
                {Object.entries(winningProbability).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-600">
                      {key === 'firstPrize' ? '1등' : 
                       key === 'secondPrize' ? '2등' : '3등'}
                    </p>
                    <p className="font-bold text-blue-600">{value}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 버튼 섹션 */}
          <div className="space-y-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGenerating ? '번호 생성중...' : '번호 뽑기'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={copyNumbers}
              disabled={numbers.length !== 6}
              className="flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              번호 복사하기
            </button>
          
            <button 
              onClick={toggleStatistics}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            >
              {showStatistics ? '통계 닫기' : '통계'}
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
                    {stat.number}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showLoadingOverlay && <LoadingOverlay />}
      <Analytics />
    </div>
  );
}
