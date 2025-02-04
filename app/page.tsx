'use client';

import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

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

const generateLottoNumbers = () => {
  const numbers = new Set();
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

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation({
            lat: 37.5665,
            lng: 126.978,
          });
        }
      );
    }
  };

  useEffect(() => {
    if (showMap && mapRef.current && currentLocation) {
      const mapOption = {
        center: new window.kakao.maps.LatLng(
          currentLocation.lat,
          currentLocation.lng
        ),
        level: 3,
      };
      const map = new window.kakao.maps.Map(mapRef.current, mapOption);

      new window.kakao.maps.Marker({
        map: map,
        position: new window.kakao.maps.LatLng(
          currentLocation.lat,
          currentLocation.lng
        ),
      });

      const places = new window.kakao.maps.services.Places();
      places.keywordSearch('로또 판매점', (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          result.forEach((place: any) => {
            const marker = new window.kakao.maps.Marker({
              map: map,
              position: new window.kakao.maps.LatLng(place.y, place.x),
            });

            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:5px;font-size:12px;">
                  ${place.place_name}<br>
                  ${place.road_address_name}
                </div>
              `,
            });

            window.kakao.maps.event.addListener(marker, 'click', function () {
              infowindow.open(map, marker);
            });
          });
        }
      });
    }
  }, [showMap, currentLocation]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setNumbers([]);

    const newNumbers = generateLottoNumbers();

    newNumbers.forEach((number, index) => {
      setTimeout(() => {
        setNumbers((prev) => [...prev, number]);
        if (index === 5) setIsGenerating(false);
      }, index * 500);
    });
  };

  const handleFindStore = () => {
    getCurrentLocation();
    setShowMap(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4">
      {/* 최신 당첨 정보 섹션 */}
      <div className="max-w-md mx-auto mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
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
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          로또 번호 생성기
        </h1>
        <p className="text-gray-600 text-center mb-6">
          행운의 번호를 뽑아보세요!
        </p>

        <div className="flex justify-center mb-6 min-h-20">
          <div className="inline-flex gap-3 justify-center">
            {numbers.map((number, index) => (
              <div
                key={index}
                className={`${getBallColor(
                  number
                )} w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg animate-pop-in`}
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '번호 생성중...' : '번호 뽑기'}
          </button>

          <button
            onClick={handleFindStore}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            가까운 판매점 찾기
          </button>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <h3 className="font-semibold mb-2">✨ 번호 생성 방식</h3>
          <p className="text-sm">
            1부터 45까지의 숫자 중에서 무작위로 6개의 번호를 선택합니다. 모든
            번호는 공정한 난수 생성 방식으로 선택됩니다.
          </p>
        </div>
      </div>

      {/* 지도 모달 */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">주변 로또 판매점</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div ref={mapRef} className="w-full h-[400px]" />
            <div className="p-4 text-sm text-gray-500">
              * 실제 판매점과 위치가 다를 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
