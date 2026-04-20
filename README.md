# Dream Static Planner

정적 웹앱(`index.html + app.js + styles.css`)과 데이터 파일(`data/*.json`, `data/*.bin`)만으로 동작하는 수강 추천기입니다.

## 구조

- 런타임: 브라우저만 사용
- 서버/LLM 호출: 없음
- 배포: GitHub Pages, Netlify 같은 정적 호스팅
- 캐시: IndexedDB

## 입력

- 시간표 PDF: `data/` 또는 `data/pdfs/`
- 수업계획서 PDF: `data/` 또는 `data/pdfs/`
- 트랙 정의: `data/major_tracks.json`

시간표 PDF는 파일명에 `시간표`, 수업계획서는 `수업계획`, `강의계획`, `syllabus` 중 하나가 포함되면 자동 인식합니다.

## 전처리

```bash
pip install -r requirements.txt
python ingest.py
```

생성 파일:

- `data/courses.json`
- `data/prerequisites.json`
- `data/syllabus_chunks.json`
- `data/embeddings.bin`
- `data/rules.json`
- `data/manifest.json`
- `data/test_scenarios.json`
- `tmp/validation_report.json`

호환성 때문에 `data/timetable_courses.json`도 같이 갱신합니다.

## 로컬 실행

```bash
python app.py
```

브라우저에서 `http://127.0.0.1:8000/index.html` 접속.

## 검증

```bash
python validate.py
```

전공별 시나리오 20개 이상을 기준으로 추천 결과와 설명 슬롯 일관성을 점검합니다.

## 배포

정적 파일만 올리면 됩니다.

- GitHub Pages: 저장소 루트 배포
- Netlify: Publish directory를 저장소 루트로 지정

학기 교체 시에는 PDF와 `major_tracks.json`만 갱신한 뒤 `python ingest.py` 한 번 실행하면 됩니다.
