'use client';

import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

const latestLottoResult = {
 round: 1159,
 date: '2025-02-15',
 numbers: [3, 9, 27, 28, 38, 39],
 bonus: 7,
 winners: {
   first: 23,
   firstPrize: '1,284,854,250원',
   second: 110,
   secondPrize: '44,775,224원',
   third: 3742,
   thirdPrize: '1,316,215원',
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

const LoadingOverlay = () => {
  // 6개의 대표 색상 볼 생성
  const loadingBalls = [
    { number: 1, color: 'bg-yellow-500' },  // 1-10 대표
    { number: 15, color: 'bg-blue-500' },   // 11-20 대표
    { number: 25, color: 'bg-red-500' },    // 21-30 대표
    { number: 35, color: 'bg-gray-500' },   // 31-40 대표
    { number: 42, color: 'bg-green-500' },  // 41-45 대표
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 relative flex flex-col items-center">
        <div className="flex gap-2 justify-center mb-4">
          {loadingBalls.map((ball, index) => (
            <div
              key={index}
              className={`${ball.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
              style={{
                width: '40px',
                height: '40px',
                animation: `bounce 0.5s ease-in-out ${index * 0.1}s infinite alternate`
              }}
            >
              {ball.number}
            </div>
          ))}
        </div>
        <p className="text-gray-600 mt-4">행운의 번호를 뽑는 중...</p>
      </div>
    </div>
  );
};

export default function Home() {
 const [numbers, setNumbers] = useState<number[]>([]);
 const [isGenerating, setIsGenerating] = useState(false);
 const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
 const [timeRemaining, setTimeRemaining] = useState('');

 const calculateTimeRemaining = () => {
  const now = new Date();
  const nextDrawTime = new Date(now);
  
  // 토요일(6)까지 남은 날짜 계산
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  nextDrawTime.setDate(now.getDate() + daysUntilSaturday);
  nextDrawTime.setHours(20, 35, 0, 0);

  // 만약 현재 시간이 이번주 토요일 추첨시간을 지났다면 다음주 토요일로
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

   useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          }
          return updatedNumbers;
        });
      }, index * 500);
    });
  }, 3000);
};

 const copyNumbers = () => {
   const numbersText = numbers.join(', ');
   navigator.clipboard.writeText(`로또 번호: ${numbersText}`)
     .then(() => {
       alert('번호가 클립보드에 복사되었습니다!');
     })
     .catch(err => {
       console.error('클립보드 복사 실패:', err);
       alert('클립보드 복사에 실패했습니다. 수동으로 번호를 복사해주세요.');
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
           <div className="flex items-center justify-center gap-2 mb-4">
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
             <div className="text-gray-600 text-2xl font-bold mx-2">+</div>
             <div
               className={`${getBallColor(
                 latestLottoResult.bonus
               )} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold`}
             >
               {latestLottoResult.bonus}
             </div>
           </div>
           <div className="space-y-2 text-sm px-4">
             <p className="flex justify-between items-center">
               <span className="text-gray-700">1등 (6개 번호 일치)</span>
               <span className="font-bold text-blue-600">
                 {latestLottoResult.winners.firstPrize}
               </span>
             </p>
             <p className="flex justify-between items-center">
               <span className="text-gray-700">2등 (5개 + 보너스)</span>
               <span className="text-blue-500">
                 {latestLottoResult.winners.secondPrize}
               </span>
             </p>
             <p className="flex justify-between items-center">
               <span className="text-gray-700">3등 (5개 번호 일치)</span>
               <span className="text-blue-500">
                 {latestLottoResult.winners.thirdPrize}
               </span>
             </p>
           </div>
         </div>
       </div>

       {/* 다음 추첨 시간 섹션 */}
       <div className="bg-white rounded-xl shadow-lg p-4 text-center">
         <h3 className="text-lg font-semibold text-gray-700 mb-2">
           다음 로또 추첨까지
         </h3>
         <div className="text-2xl font-bold text-blue-600">
           {timeRemaining}
         </div>
         <p className="text-sm text-gray-500 mt-2">
           (매주 토요일 오후 8시 35분)
         </p>
       </div>

       {/* 번호 생성기 섹션 */}
       <div className="bg-white rounded-xl shadow-lg p-4">
         <h1 className="text-xl font-bold text-center mb-1">로또 번호 생성기</h1>
         <p className="text-gray-600 text-center mb-3 text-sm">
           행운의 번호를 뽑아보세요!
         </p>

         <div className="flex justify-center mb-4 min-h-[80px]">
           <div className="inline-flex gap-2 justify-center flex-wrap">
             {numbers.map((number, index) => (
               <div
                 key={`${number}-${index}`}
                 className={`${getBallColor(
                   number
                 )} w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg animate-pop-in`}
               >
                 {number}
               </div>
             ))}
           </div>
         </div>

         <div className="space-y-2">
           <button
             onClick={handleGenerate}
             disabled={isGenerating}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
           >
             {isGenerating ? '번호 생성중...' : '번호 뽑기'}
           </button>

           <button 
             onClick={copyNumbers}
             disabled={numbers.length !== 6}
             className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
           >
             번호 복사하기
           </button>
         </div>

         <div className="mt-4 text-center text-gray-600">
           <h3 className="font-semibold mb-1 text-sm">✨ 번호 생성 방식</h3>
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
