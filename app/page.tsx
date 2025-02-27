'use client';

import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { QrCodeIcon } from 'lucide-react';

const latestLottoResult = {
 round: 1159,
 date: '2025-02-22',
 numbers: [7, 13, 18, 36, 39, 45],
 bonus: 19,
 winners: {
   first: 12,
   firstPrize: '2,509,359,875원',
   second: 84,
   secondPrize: '59,746,664원',
   third: 3176,
   thirdPrize: '1,580,202원',
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
  const loadingBalls = [
    { color: 'bg-yellow-500' },  
    { color: 'bg-blue-500' },  
    { color: 'bg-red-500' },  
    { color: 'bg-gray-500' },
    { color: 'bg-green-500' },  
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
 const [showQRScanner, setShowQRScanner] = useState(false);

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

 const handleQRScan = () => {
   setShowQRScanner(true);
 };

 const closeQRScanner = () => {
   setShowQRScanner(false);
 };

 return (
   <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col pb-4">
     <div className="container mx-auto max-w-md px-4 py-4 space-y-4">
       {/* 최신 당첨 정보 섹션 */}
       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
         <div className="bg-blue-600 text-white p-3">
           <h2 className="text-base font-bold">
             {latestLottoResult.round}회 당첨결과
           </h2>
           <p className="text-xs">{latestLottoResult.date}</p>
         </div>
         <div className="p-3">
           <div className="flex items-center justify-center gap-1 mb-3">
             {latestLottoResult.numbers.map((number, index) => (
               <div
                 key={index}
                 className={`${getBallColor(
                   number
                 )} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
               >
                 {number}
               </div>
             ))}
             <div className="text-gray-600 text-xl font-bold mx-1">+</div>
             <div
               className={`${getBallColor(
                 latestLottoResult.bonus
               )} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold`}
             >
               {latestLottoResult.bonus}
             </div>
           </div>
           <div className="space-y-1 text-xs px-2">
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

         <div className="space-y-2">
           <button
             onClick={handleGenerate}
             disabled={isGenerating}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
           >
             {isGenerating ? '번호 생성중...' : '번호 뽑기'}
           </button>

           <div className="flex gap-2">
             <button 
               onClick={copyNumbers}
               disabled={numbers.length !== 6}
               className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               번호 복사하기
             </button>
             <button 
               onClick={handleQRScan}
               className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg"
             >
               <QrCodeIcon size={20} />
             </button>
           </div>
         </div>

         <div className="mt-3 text-center text-gray-600">
           <h3 className="font-semibold mb-1 text-xs">✨ 번호 생성 방식</h3>
           <p className="text-xs text-gray-500">
             1부터 45까지의 숫자 중에서 무작위로 6개의 번호를 선택합니다.
           </p>
         </div>
       </div>

       {/* QR 스캐너 모달 */}
       {showQRScanner && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-md h-96 relative">
             <div className="p-4 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
               <h2 className="text-lg font-bold">당첨 번호 확인</h2>
               <button 
                 onClick={closeQRScanner}
                 className="text-white hover:text-gray-200"
               >
                 닫기
               </button>
             </div>
             <div className="p-4 flex-grow flex items-center justify-center">
               <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                 <p className="text-gray-500">QR 코드 스캔 영역</p>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
     {showLoadingOverlay && <LoadingOverlay />}
     <Analytics />
   </div>
 );
}
