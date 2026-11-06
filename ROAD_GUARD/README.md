# ROAD GUARD · 로드킬 기록 지도 + 엣지 AI 기술 체험

AX Challenge 콘텐츠형 프로젝트를 위한 **정적 웹사이트 프로토타입**입니다.

## 1. 프로젝트 폴더

```
ROAD_GUARD/
├── website/
│   ├── index.html                         # 메인 웹페이지
│   ├── css/style.css                      # 반응형 디자인
│   ├── js/app.js                          # 데이터 로딩·필터·통계·교육 콘텐츠
│   ├── js/map.js                          # Leaflet 지도·마커·상세 팝업
│   ├── js/simulation.js                   # 가상 AI 센서 감지 시뮬레이션
│   ├── data/roadguard_sites.geojson       # 95개 기록 좌표 요약
│   ├── data/roadguard_records.json        # 3,183개 기록·필터용
│   ├── data/sensors.json                  # 가상 센서 3개 (실제 장치 아님)
│   └── assets/
│       ├── video/                         # 영상 완성 시 MP4 추가
│       ├── cardnews/                      # 카드뉴스 완성 시 PNG 추가
│       └── images/                        # 추후 이미지
├── source_data/                           # 원본·전처리 데이터, 웹에 비공개
├── presentation/                          # 발표 PPT 보관
├── submission/                            # 최종 제출물 보관
├── 실행하기.bat                            # 윈도우 간편 실행 (Python 설치 필요)
└── README.md
```

## 2. 실행 방법 (반드시 서버 사용)

**추천: VS Code에서 실행**

1. VS Code로 `ROAD_GUARD` 폴더를 엽니다.
2. Live Server 확장을 설치한 경우 `website/index.html`을 우클릭하고 **Open with Live Server**를 누릅니다.
3. 브라우저에서 지도가 뜨고 사고 기록 `3,183건`, 좌표 `95곳`이 보이면 정상입니다.

**터미널로 실행 (Python이 설치된 경우)**

```bash
cd ROAD_GUARD/website
python -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다.

윈도우에서 `ROAD_GUARD/실행하기.bat`을 더블클릭해도 됩니다.

**주의**: `index.html`을 파일 탐색기에서 더블클릭하는 `file://` 방식은 JSON/GeoJSON 로딩이 실패할 수 있습니다. 지도의 배경 타일, Leaflet 라이브러리, Google Fonts는 인터넷 연결을 사용합니다.

## 3. 구현된 기능

- 국립공원 로드킬 공개 기록 **3,183건** / **95개 기록 좌표** 지도 시각화
- 국립공원·동물 종류·조사 연도별 다중 필터
- 필터와 연동되는 기록 건수·좌표 수·공원 수·동물 종류 수·공원 TOP 5 통계
- 과거 사고 기록 지점 클릭 → 집계 날짜·주요 동물·건수
- **가상 센서 3개** 지도 별도 표시
- 가상 감지: 센서 수집 → 엣지 AI 분석 → 위험 판단 → 전광판 경고
- 웹페이지 내 전공 지식 교육 7장, 영상 삽입 영역

## 4. 기능 확인 테스트

1. 사이트 최초 화면에서 **3,183건 / 95지점**을 확인합니다.
2. `국립공원`을 **오대산**으로 변경합니다. **549건 / 4지점**이 보이면 정상입니다.
3. 파란색 지점 원을 클릭해 기록 팝업과 선택 지점 상세 정보를 확인합니다.
4. `필터 초기화`를 눌러 전체 데이터를 다시 표시합니다.
5. 오른쪽에서 가상 센서를 선택하고 `감지 시뮬레이션 시작`을 클릭합니다.
6. 단계별 설명과 지도 센서 표시가 변하는지 확인합니다.
7. 아래 교육 카드뉴스의 이전·다음 버튼을 눌러봅니다.

## 5. 나중에 영상 넣기

완성된 영상 MP4를 아래 위치에 저장합니다.

```
website/assets/video/roadguard_campaign.mp4
```

웹페이지의 `<video>`가 해당 파일을 읽으면 영상 재생 영역이 나타납니다. 일반적인 H.264 MP4를 권장합니다.

## 6. 나중에 카드뉴스 넣기

PNG 7장을 아래 경로에 저장합니다.

```
website/assets/cardnews/card_01.png
website/assets/cardnews/card_02.png
website/assets/cardnews/card_03.png
website/assets/cardnews/card_04.png
website/assets/cardnews/card_05.png
website/assets/cardnews/card_06.png
website/assets/cardnews/card_07.png
```

그다음 `website/js/app.js`에서 다음 한 줄을 변경합니다.

```js
const USE_CARD_IMAGES = true;
```

이미지가 완성되지 않은 상태에서도 웹페이지는 7장 교육 문구를 자체 표시합니다.

## 7. 가상 센서 시나리오 수정하기

`website/data/sensors.json`에서 센서 이름, 설명, 위도(`latitude`), 경도(`longitude`)를 수정할 수 있습니다. 이 위치는 **교육용으로 만든 가상 위치이며 실제 센서 설치 정보가 아닙니다.**

## 8. 데이터 출처 및 신뢰성 주의사항

- 출처: 공공데이터포털 / 국립공원공단 / 국립공원 로드킬 정보 (2023-12-20 제공 자료)
- 기간: 2011-01-10 ~ 2023-11-20 (원본 자료 기준)
- 원본 3,183행 유지 (중복 후보 307행은 삭제하지 않음)
- 좌표 고유 값 95곳; 동일 좌표에 여러 기록이 연결됨
- 현재 웹은 과거 기록의 분포를 보여줄 뿐, **실시간 사고 발생**이나 **검증된 현재 위험도**를 표시하지 않음
- 가상 AI 감지 화면의 동물·상태·경고는 사전 정의된 시뮬레이션이며 실제 추론 결과가 아님
- 지도 좌표는 원본 출처 수준의 공간 정보이며 개별 사고 정확 위치로 단정할 수 없음

원본 파일과 가공 데이터에 대한 자세한 사항은 `source_data/ROAD_GUARD_데이터_가이드.md`를 확인하세요.

## 9. 배포 가이드

GitHub Pages를 사용한다면 배포될 브랜치의 루트에 `website` 폴더 내부 파일을 놓거나, GitHub Actions로 `website` 디렉터리를 아티팩트로 배포하세요. `source_data` 폴더는 공개 웹 배포에 포함하지 않아도 됩니다.

## 10. 담당 파일 분담 추천

- 웹 지도 및 필터 개발: `js/map.js`, `js/app.js`, `data/`
- AI 감지 시연: `js/simulation.js`, `data/sensors.json`
- 디자인: `css/style.css`, `index.html`
- 영상/교육 콘텐츠: `assets/video/`, `assets/cardnews/`

전체 제작 과정은 AI 도구, 프롬프트와 변경 내역을 따로 기록해 발표에 활용하세요.
