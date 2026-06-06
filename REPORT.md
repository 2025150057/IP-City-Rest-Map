# 실시간 도심 쉼표 지도 (IP-City-Rest-Map) — 보고서 초안

> 주의: 표지의 학번/이름(팀원 전체)과 제출일은 아래 자리표시자([팀원1], [학번])을 실제 정보로 교체해주세요.

---

## 표지
- 과목: Internet Programming (또는 수업명)
- 프로젝트명: 실시간 도심 쉼표 지도 (IP-City-Rest-Map)
- 팀명: [팀명]
- 팀원(학번/이름):
  - [학번] / [이름] (팀장)
  - [학번] / [이름]
  - [학번] / [이름]
- 제출일: [YYYY-MM-DD]

---

## 1. 요약 (Abstract)
본 프로젝트는 사용자가 현재 위치 주변에서 한적하고 쾌적한 '쉼표(휴식) 스팟'(카페, 공원, 산책로 등)을 실시간으로 추천하는 웹 매시업 서비스입니다. 입력으로는 사용자의 실시간 GPS와 선호 가중치(예: 거리, 혼잡도, 대기질 우선순위)를 받고, 외부 API(서울시 실시간 혼잡도, 대기질, 카카오 로컬)를 결합하여 '실시간 쉼표 지수'를 계산한 후 지도 기반 인터페이스와 시각화(혼잡도 추이, 대안 네트워크)를 통해 결과를 제공합니다.

제안서 대비 변경/추가된 주요 내용:
- 데이터 전처리 파이프라인(Excel→JSON 변환) 구현 설명 추가
- 서버 사이드에서의 엔드포인트 설계 예시 및 로컬/클라우드 배포 정보(Cloudflare Workers) 반영

---

## 2. 아키텍처 및 사용 기술
### 개요
- 클라이언트: HTML5, CSS3, Vanilla JavaScript, Geolocation API, d3.js (혼잡도 추이 그래프), sigma.js (대안 장소 네트워크)
- 서버: Node.js (Express 기반), Cloudflare Workers(배포), wrangler 사용
- 데이터: 카카오 로컬 API(POI), 서울시 실시간 도시데이터(혼잡도·대기질), 전처리용 XLSX 입력
- 저장소/중간파일: datas/output.json (XLSX → JSON), 캐시(권장: Redis)

### 주요 라이브러리(프로젝트 현재 구성)
- express (package.json)
- dotenv, xlsx
- wrangler (Cloudflare 배포에 사용)

### 배포
- 현재 데모 배포 URL: https://ip-city-rest-map-revive.dhs2025.workers.dev/ (README 참조)

### 아키텍처 흐름
1. 클라이언트가 Geolocation API로 위치를 획득하고 서버에 요청
2. 서버는 카카오 로컬 API로 근처 POI를 조회하고, 서울시 실시간 API에서 해당 구획의 혼잡도/대기질을 조회
3. 서버에서 '실시간 쉼표 지수' 계산 후 상위 후보(1~3위)와 시계열 데이터를 반환
4. 클라이언트는 d3.js와 sigma.js로 시각화하여 사용자에게 제공

---

## 3. 데이터 출처 및 가공
- 원천 데이터
  - 서울시 실시간 도시데이터: https://data.seoul.go.kr/SeoulRtd/list
  - 카카오 로컬 API: https://developers.kakao.com/docs/ko/local/common
- 전처리 파이프라인
  - 원본 Excel 파일(datas/서울시 주요 121장소 목록.xlsx)을 beforeruntime.js로 읽어 카카오로부터 좌표(위도/경도) 조회 후 datas/output.xlsx로 저장
  - beforeruntime2.js는 output.xlsx를 JSON으로 변환하여 datas/output.json으로 저장
- 개인정보/윤리
  - 위치 정보는 요청 단위로 처리하며 서버에서 익명화(세션 식별자 사용) 권장
  - 로컬 스토리지에는 사용자 가중치만 저장(식별자 최소화)

---

## 4. 핵심 알고리즘: "실시간 쉼표 지수"
### 목표
거리, 혼잡도, 대기질, 카테고리 선호 등 여러 요소를 통합하여 0~100 스케일의 점수로 계산.

### 변수
- d: 사용자와 장소 간 거리 (m)
- pop: 혼잡도 지표(정규화 0~1; 1=매우 혼잡)
- pm: 대기질 지표(정규화 0~1; 1=매우 나쁨)
- category_match: 선호 카테고리 일치 여부(1 또는 0)
- w_d, w_pop, w_pm, w_cat: 가중치(합 = 1)

### 수식(예시)
- distance_score = 1 - sigmoid(d / D0)
- crowd_score = 1 - pop
- air_score = 1 - pm
- S = 100 * (w_d * distance_score + w_pop * crowd_score + w_pm * air_score + w_cat * category_match)

(설명: D0는 사용자가 허용 가능한 거리 기준, 기본값 예: 1000m. sigmoid(x)=1/(1+exp(-x)) 사용하여 완만한 감쇠 적용)

### 의사코드
```pseudo
입력: user(lat,lon), prefs {w_d,w_pop,w_pm,w_cat,D0, preferred_categories}
POIs = callKakaoLocal(user, radius)
For each poi in POIs:
  pop = lookupSeoulCrowd(poi)
  pm = lookupAirQuality(poi)
  d = haversine(user, poi)
  distance_score = 1 - sigmoid(d / D0)
  crowd_score = 1 - normalize(pop)
  air_score = 1 - normalize(pm)
  category_match = prefs.preferred_categories.contains(poi.category) ? 1 : 0
  S = 100 * (w_d*distance_score + w_pop*crowd_score + w_pm*air_score + w_cat*category_match)
Return top3 POIs sorted by S
```

### 핵심 소스코드 스니펫(보고서 포함용)
아래는 저장소에 포함된 전처리 코드 일부로, 카카오 로컬 API를 호출해 장소 좌표를 얻는 함수 예시입니다.

```javascript name=beforeruntime.js url=https://github.com/2025150057/IP-City-Rest-Map/blob/e5bb73b13f0a1599a29efee31d5c59113d20f1db/beforeruntime.js
async function getLocData(loc_name) {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword?query=${loc_name}&size=1`
    const data = await fetch(kakao_api_url, {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
    });
    const json = await data.json();
    // address, x(longitude), y(latitude)
    return {
        name: loc_name,
        address: json.documents[0]?.address_name || "",
        longitude: json.documents[0]?.x || "",
        latitude: json.documents[0]?.y || ""
    }
}
```

(원본 파일 전체는 repo의 beforeruntime.js를 참조)

---

## 5. 엔드포인트 및 API 설계(예시)
- GET /api/recommend?lat={lat}&lon={lon}&prefs={json}
  - 설명: 사용자 위치와 선호(prefs)를 받아 상위 추천 1~3개 및 시계열 데이터 반환
  - 응답 예:
```json
{
  "recommendations": [
    {"id":"","name":"","lat":,"lon":,"score":94.3,"reasons":["근접","미세먼지 양호"]},
    ...
  ]
}
```
- POST /api/feedback
  - 바디: {user_id(optional), poi_id, chosen_rank}
  - 설명: 사용자가 선택한 장소 정보를 받아 로컬 가중치 업데이트(간단한 손실함수로 학습)

(저장소 내 현재 서버 코드 엔드포인트는 확인되지 않음 — 필요 시 server 디렉토리의 구현을 포함하여 추후 업데이트 가능)

---

## 6. 서비스 시나리오 및 실행 결과
### 시나리오 예 (보고서에 포함 예정)
- 시나리오 A: 동대문역사문화공원역 1번 출구에서 페이지 접속
  1. 클라이언트가 GPS 전송
  2. 서버는 가장 가까운 서울시 구획의 혼잡도 데이터를 조회
  3. 카카오에서 근처 카페/공원/산책로 POI를 수집
  4. 각 후보에 대해 실시간 쉼표 지수를 계산하여 상위 3개를 반환
  5. 사용자가 한 곳을 선택하면 피드백을 받아 가중치가 조정됨

### 현재 구현/데이터 상태(저장소 기반)
- 전처리: beforeruntime.js, beforeruntime2.js로 Excel → output.json 생성 로직 존재
- 카카오 API 호출을 위한 테스트 코드: test.js
- 프론트엔드(시각화) 관련 파일은 public/ 또는 src/에 위치(현재 repo에 디렉토리 존재, 세부 구현은 src/ 확인 필요)
- 실제 시연 스크린샷은 저장소에 포함되어 있지 않으므로 보고서 초안에는 '실행 결과 스크린샷 자리표시'를 포함하였습니다. 가능하시면 직접 캡처한 화면을 보내주세요. 제가 받아서 최종 보고서에 삽입하겠습니다.

---

## 7. 전체 시스템 구성 및 주요 파일
- beforeruntime.js: Excel 파일의 장소명을 카카오 로컬로 조회하여 좌표를 채우고 output.xlsx 생성
- beforeruntime2.js: output.xlsx → output.json 변환
- test.js: 카카오 API 호출 테스트 스크립트
- package.json: wrangler 배포, express 의존성, dotenv 등
- datas/: 전처리용 Excel/JSON 파일 저장소 (output.json 등)
- public/, src/: 프론트엔드 정적 파일 및 소스 (시각화 구현 위치)

(보고서에는 각 파일의 역할과 핵심 코드 스니펫을 포함 — 전체 소스는 포함하지 않음)

---

## 8. 구현 완성도, 한계 및 향후 계획
### 현재 완성도
- 데이터 전처리 파이프라인(Excel→JSON): 구현됨
- 카카오 API 호출 테스트: 구현됨
- 서버 기본 구조(패키지 구성): 존재
- 프론트엔드 시각화: 요구사항에 맞는 라이브러리(d3/sigma) 사용 예정 — 구체적 화면 구현은 src/ 확인 필요

### 한계
- 서울시 실시간 API의 공간 해상도(구획 단위)를 장소 단위 좌표로 보정하는 로직 필요
- API 호출량 제한(카카오) 및 비용 고려
- 실시간성 개선을 위한 캐시 전략(예: Redis) 도입 권장

### 향후 계획
- 서버 엔드포인트 완성 및 응답 포맷 표준화
- 시각화(지도+DAG+시계열) 완성 후 시연 스크린샷 획득
- 사용자 피드백 루프(가중치 업데이트) тест 및 안정화

---

## 9. 참고문헌 / 링크
- 프로젝트 레포지토리: https://github.com/2025150057/IP-City-Rest-Map
- 서울시 실시간 데이터: https://data.seoul.go.kr/SeoulRtd/list
- 카카오 로컬 API: https://developers.kakao.com/docs/ko/local/common
- Geolocation API: https://www.w3schools.com/Html/html5_geolocation.asp

---

## 부록: 보고서 제출 체크리스트
- [ ] PDF/DOCX (A4, ≤7페이지) — 학번/이름(팀원 전원) 포함
- [ ] 제안서 대비 변경점 요약
- [ ] 아키텍처·API·데이터 소개 (엔드포인트/샘플 응답 포함)
- [ ] 핵심 알고리즘(주요 소스코드·수식) 포함
- [ ] 시나리오별 실행 결과(스크린샷) 포함
- [ ] 팀원별 역할 및 변경 사유
- [ ] 발표 영상 MP4(≤6분, DEMO 포함)


---

(이 파일은 보고서 초안 Markdown 버전입니다. DOCX로 변환을 원하시면 아래 명령으로 변환하거나 요청 주시면 제가 report.docx로 변환해 드리겠습니다.)

# 변환 예시 (사용자 환경에서)
- pandoc을 사용:
  - pandoc REPORT.md -o REPORT.docx
- 마이크로소프트 워드에서 Markdown 불러와서 저장: Word에서 열기 → .md 파일 선택 → 저장을 docx로 변경
