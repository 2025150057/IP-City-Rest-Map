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
      latitude: 37.5659,
      longitude: 127.0089,
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
      latitude: 37.5669,
      longitude: 127.0037,
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
      latitude: 37.5665,
      longitude: 127.0095,
      reason: "거리는 가깝지만 혼잡도가 다소 높습니다.",
      congestionTrend: [
        { time: "10:00", value: 55 },
        { time: "11:00", value: 62 },
        { time: "12:00", value: 70 },
        { time: "13:00", value: 66 },
        { time: "14:00", value: 58 }
      ]
    },
    {
      id: "place-4",
      name: "청계천 산책로",
      category: "산책로",
      distance: 650,
      crowdLevel: "여유",
      pm10: 29,
      pm25: 15,
      restScore: 79,
      latitude: 37.5691,
      longitude: 127.0092,
      reason: "도보 이동이 가능하고 비교적 한적합니다.",
      congestionTrend: [
        { time: "10:00", value: 38 },
        { time: "11:00", value: 41 },
        { time: "12:00", value: 46 },
        { time: "13:00", value: 43 },
        { time: "14:00", value: 39 }
      ]
    },
    {
      id: "place-5",
      name: "을지로 조용한 카페",
      category: "카페",
      distance: 820,
      crowdLevel: "보통",
      pm10: 34,
      pm25: 19,
      restScore: 76,
      latitude: 37.5664,
      longitude: 126.9918,
      reason: "실내 휴식에 적합하고 접근성이 좋습니다.",
      congestionTrend: [
        { time: "10:00", value: 44 },
        { time: "11:00", value: 48 },
        { time: "12:00", value: 57 },
        { time: "13:00", value: 52 },
        { time: "14:00", value: 47 }
      ]
    },
    {
      id: "place-6",
      name: "종로 휴식 공간",
      category: "공원",
      distance: 1100,
      crowdLevel: "약간 붐빔",
      pm10: 36,
      pm25: 21,
      restScore: 71,
      latitude: 37.5708,
      longitude: 126.9995,
      reason: "거리는 조금 있지만 주변 대안 장소로 적합합니다.",
      congestionTrend: [
        { time: "10:00", value: 52 },
        { time: "11:00", value: 58 },
        { time: "12:00", value: 65 },
        { time: "13:00", value: 61 },
        { time: "14:00", value: 55 }
      ]
    }
  ]
};