export const mockRecommendation = {
  places: [
    {
      id: "place-1",
      name: "동대문 조용한 카페",
      category: "카페",
      distance: 280,
      crowdLevel: "여유",
      pm10: 31,
      pm25: 17,
      restScore: 88,
      reason: "현재 위치와 가깝고 혼잡도가 낮습니다.",
      congestionTrend: [
        { time: "10:00", value: 35 },
        { time: "11:00", value: 42 },
        { time: "12:00", value: 48 },
        { time: "13:00", value: 44 },
        { time: "14:00", value: 39 }
      ]
    },
    {
      id: "place-2",
      name: "훈련원공원 산책 구역",
      category: "공원",
      distance: 520,
      crowdLevel: "보통",
      pm10: 33,
      pm25: 19,
      restScore: 81,
      reason: "대기질이 양호하고 산책 목적에 적합합니다.",
      congestionTrend: [
        { time: "10:00", value: 45 },
        { time: "11:00", value: 49 },
        { time: "12:00", value: 55 },
        { time: "13:00", value: 50 },
        { time: "14:00", value: 46 }
      ]
    },
    {
      id: "place-3",
      name: "DDP 주변 휴식 공간",
      category: "산책로",
      distance: 410,
      crowdLevel: "약간 붐빔",
      pm10: 35,
      pm25: 20,
      restScore: 74,
      reason: "거리는 가깝지만 혼잡도가 다소 높습니다.",
      congestionTrend: [
        { time: "10:00", value: 55 },
        { time: "11:00", value: 62 },
        { time: "12:00", value: 70 },
        { time: "13:00", value: 66 },
        { time: "14:00", value: 58 }
      ]
    }
  ]
};