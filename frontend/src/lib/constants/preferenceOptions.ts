// frontend/src/lib/constants/preferenceOptions.ts

export const options = {
  sleepTime: [
    { label: '22시 이전', value: 1 },
    { label: '22시~00시', value: 2 },
    { label: '00시~02시', value: 3 },
    { label: '02시~04시', value: 4 },
    { label: '04시 이후', value: 5 },
  ],
  cleaningFrequency: [
    { label: '거의 안 함', value: 1 },
    { label: '월 1~2회', value: 2 },
    { label: '주 1회', value: 3 },
    { label: '주 2~3회', value: 4 },
    { label: '매일', value: 5 },
  ],
  hygieneLevel: [
    { label: '매우 관대', value: 1 },
    { label: '관대', value: 2 },
    { label: '보통', value: 3 },
    { label: '예민', value: 4 },
    { label: '매우 예민', value: 5 },
  ],
  drinkingFrequency: [
    { label: '전혀 안 마심', value: 1 },
    { label: '밖에서만', value: 2 },
    { label: '집에서 가끔', value: 3 },
    { label: '주 1~2회', value: 4 },
    { label: '집이 주 장소', value: 5 },
  ],
  noiseSensitivity: [
    { label: '매우 둔감', value: 1 },
    { label: '둔감', value: 2 },
    { label: '보통', value: 3 },
    { label: '예민', value: 4 },
    { label: '매우 예민', value: 5 },
  ],
  guestFrequency: [
    { label: '절대 불가', value: 1 },
    { label: '월 1회 미만', value: 2 },
    { label: '월 1~2회', value: 3 },
    { label: '주 1회', value: 4 },
    { label: '매우 잦음', value: 5 },
  ],
  boolean: [
    { label: '예', value: true },
    { label: '아니오', value: false },
  ],
};
