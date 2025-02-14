'use client';

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

const latestLottoResult = {
 round: 1158,
 date: '2025-02-08',
 numbers: [21, 25, 27, 32, 37, 38],
 bonus: 20,
 winners: {
   first: 21,
   firstPrize: '1,394,358,197원',
   second: 86,
   secondPrize: '56,747,136원',
   third: 3032,
   thirdPrize: '1,609,583원',
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
  const balls = Array(6).fill(null).map((_, i) => {
    const number = Math.floor(Math.random() * 45) + 1;
    return {
      number,
      color: getBallColor(number),
      animationConfig: {
        x: Math.random() * 30 + 20,
        y: Math.random() * 30 + 20,
        duration: 2 + Math.random(),
      }
    };
  });

  // 여기에 useEffect 추가
  useEffect(() => {
    const style = document.createElement('style');
    const animations = balls.map((ball, i) => `
      @keyframes floatX${i} {
        0% { transform: translate(calc(-50% - ${ball.animationConfig.x}px), -50%); }
        100% { transform: translate(calc(-50% + ${ball.animationConfig.x}px), -50%); }
      }
      @keyframes floatY${i} {
        0% { transform: translate(-50%, calc(-50% - ${ball.animationConfig.y}px)); }
        100% { transform: translate(-50%, calc(-50% + ${ball.animationConfig.y}px)); }
      }
    `).join('\n');
    
    style.textContent = animations;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 relative" style={{ height: '400px' }}>
        <img
          src="/loading.jpg"
          alt="Loading"
          className="w-40 h-40 mx-auto mb-4"
        />
        {balls.map((ball, i) => (
          <div
            key={i}
            className={`absolute ${ball.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
            style={{
              width: '32px',
              height: '32px',
              left: '50%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              animation: `
                floatX${i} ${ball.animationConfig.duration}s infinite ease-in-out alternate,
                floatY${i} ${ball.animationConfig.duration * 1.3}s infinite ease-in-out alternate
              `,
            }}
          >
            {ball.number}
          </div>
        ))}
        <p className="text-center mt-4 text-gray-600 absolute bottom-8 left-0 right-0">
          행운의 번호를 뽑는 중...
        </p>
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
   
   nextDrawTime.setDate(now.getDate() + (6 - now.getDay() + 7) % 7);
   nextDrawTime.setHours(20, 35, 0, 0);

   if (nextDrawTime <= now) {
     nextDrawTime.setDate(nextDrawTime.getDate() + 7);
   }

   const difference = nextDrawTime.getTime() - now.getTime();
   
   const days = Math.floor(difference / (1000 * 60 * 60 * 24));
   const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
   const minutes = Math.floor((difference / 1000 / 60) % 60);
   const seconds = Math.floor((difference / 1000) % 60);

   return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
 };

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
  }, 3000);  // 3초로 변경
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
