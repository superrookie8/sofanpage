# Claude용 크롤러 코드리뷰 프롬프트

아래 내용을 Claude에 그대로 붙여넣어 사용하세요.

---

당신은 Python 크롤러, 증분 데이터 파이프라인, Spring API 계약, 정규식 기반 entity disambiguation을 검토하는 시니어 코드리뷰어입니다.

저장소 루트는 다음입니다.

```text
/Users/superrookie/Development/supersohee
```

주 작업 경로는 `admin/`입니다. 먼저 코드를 수정하지 말고 읽기 전용으로 리뷰하세요. 제가 별도로 수정 승인을 하기 전에는 파일을 편집하거나 dependency를 추가하거나 commit/push하지 마세요.

반드시 먼저 읽을 파일:

```text
admin/docs/CRAWLER_INCREMENTAL_IDENTITY_POLICY.md
admin/docs/CRAWLING.md
admin/crawlers/README.md
admin/crawlers/config/player_identity_policies.json
admin/crawlers/supersohee_crawlers/models.py
admin/crawlers/supersohee_crawlers/cli.py
admin/crawlers/supersohee_crawlers/http.py
admin/crawlers/supersohee_crawlers/sources.py
admin/crawlers/supersohee_crawlers/parsers.py
admin/crawlers/supersohee_crawlers/normalize.py
admin/crawlers/supersohee_crawlers/policy.py
admin/crawlers/supersohee_crawlers/classify.py
admin/crawlers/supersohee_crawlers/pipeline.py
admin/crawlers/supersohee_crawlers/review.py
admin/crawlers/supersohee_crawlers/import_client.py
admin/crawlers/tests/test_incremental.py
admin/crawlers/tests/test_parsers.py
admin/crawlers/tests/test_pipeline.py
admin/crawlers/tests/fixtures/
```

backend 계약 검증에 필요한 파일은 repository 안에서 직접 찾아 읽으세요. 특히 다음 계약의 controller, service, repository, DTO, validation, security 구현을 확인하세요.

```text
GET /api/articles/{source}?page=0&limit=1
POST /api/admin/articles/import
```

안전 제한:

- 라이브 Jumpball/Rookie 크롤링을 실행하지 마세요.
- backend import를 호출하지 마세요.
- MongoDB나 운영 데이터에 쓰지 마세요.
- 실제 환경변수 값, import key, 관리자 token, cookie, header 등 secret을 출력하지 마세요.
- `.env` 실제 값을 읽거나 수정하지 마세요.
- 네트워크 요청 없이 fixture와 mock 기반 테스트만 사용할 수 있습니다.

사용자 사실과 의도:

- 현재 DB에는 source별로 2026-01-23 기사까지 저장되어 있다고 봅니다. 코드는 실제 실행 시 public source API에서 source별 최신 `publishedAt`을 조회해야 합니다.
- 최근 12개월을 다시 긁는 방식이 아니라 source별 DB watermark 이후를 증분 수집해야 합니다.
- 같은 timestamp 경계 누락을 막기 위해 후보 조건은 `publishedAt >= watermark`입니다.
- backend watermark의 `Z`/offset은 서울 시각으로 변환하고 Jumpball 초·Rookie 분 정밀도로 내린 뒤 비교해야 합니다.
- 경계까지 도달하지 못한 일부 최신 기사만 저장해 DB watermark가 앞으로 이동하는 상황을 반드시 막아야 합니다.
- pagination markup 없음, window의 최대 숫자, selector drift는 terminal 증거가 아닙니다. 명시적 last/비활성 next/정상 빈 목록만 종료로 인정해야 합니다.
- Jumpball은 `sfld=all`, `period=MONTH|12`이며 첫 페이지는 `pagenum`을 생략하고 다음 페이지부터 zero-based 값을 사용합니다.
- Rookie는 GET query나 pagination href GET으로 검색이 유지되지 않습니다. 동일 Session에서 최초 `sc_area=A/sc_word/view_type=sm` form POST 후, 다음 page도 `page`, 최초 응답의 동적 `total`, 빈 `box_idxno`, `sc_area=A`, `sc_word`, `view_type=sm` form POST로 요청해야 합니다. 동적 `total`은 관측값을 하드코딩하면 안 됩니다. 후속 응답에서는 `sc_word` 표기가 사라질 수 있으므로 최초 `total`·last page와 현재 page marker의 일관성으로 검색 context를 검증해야 합니다. 첫 페이지로 돌아가거나 전체기사 `total=103022/page=5152`로 바뀌는 응답은 fail-closed여야 합니다.
- 제목+내용 검색 결과는 목록 snippet에 keyword가 없을 수 있습니다. 목록 parser는 유효 링크가 있는 모든 결과를 유지하고, Jumpball `#viewConts`와 Rookie `#article-view-content-div.article-veiw-body` 상세 본문을 확인한 뒤 keyword/entity filter를 적용해야 합니다. 상세 본문 전체는 저장·로그하지 않고 keyword 앞뒤 최대 600자 문맥, 전체 4,000자 이내의 summary만 사용합니다. 상세 selector가 사라지면 fail-closed여야 합니다.
- source별 후보는 오래된 기사부터 최대 200개 batch로 import해야 합니다.
- URL 영속 중복 기준은 `(source, url)`이며 backend는 Mongo atomic upsert와 `upsertedId`로 created/existing을 집계합니다. 경계 overlap 재실행이 안전해야 합니다.
- backend는 전역 auto-index가 아니라 Article 전용 startup initializer로 `(source,url)` unique index를 생성·검증하고, 불일치·생성 실패 시 fail-closed로 기동을 실패시킵니다.
- public source API는 source/page/limit을 validation하고 시각을 명시적 `+09:00` DTO로 반환하는 계약입니다.
- 이소희 선수의 소속을 코드에 영구 hardcode하면 안 됩니다. 시즌, FA, 해외 진출, 시즌 중 이적에 대응할 수 있는 기간별 외부 정책이어야 합니다.
- 기본 정책은 2025-26과 2026-27 구간을 분리합니다. 2026-01-23 이후 backfill은 두 구간의 경계를 지날 수 있습니다.
- 2025-26에는 해당 시즌 목표팀·성인대표팀·보조 신호와 당시 이미 확인 가능한 숙명여고/U18·청소년/180·181cm 동명이인 신호를 적용하되, 다음 시즌의 프로팀·드래프트 결과를 소급하지 않습니다.
- 2026-27에는 목표 선수와 같은 이름의 여자농구 선수가 있습니다. 농구/WKBL/여자농구 문맥만으로 목표 선수라고 accept하면 안 되고 소속팀 귀속을 확인해야 합니다.
- 국가대표라는 표현 자체가 문제인 것은 아닙니다. 기간 정책의 성인 여자농구 대표팀 phrase가 이름에 직접 연결되면 target 신호이며, U18·청소년·학교·180/181cm known namesake 신호와 구분해야 합니다. 비농구 종목이 이름에 직접 귀속되면 reject하고, 단순 근접이나 농구와 타종목 신호 충돌은 ambiguous여야 합니다.
- 신장 170/171cm, 26세, 등번호 6/9가 이름에 직접 연결되고 농구 문맥이 함께 있으면 target으로 accept할 수 있습니다. 보조 신호 단독은 ambiguous이고, 명시적인 known namesake 신호를 뒤집으면 안 됩니다.
- 제목의 목표팀 주어와 상세 본문의 이름을 연결하는 완화 규칙은 기간 정책으로 켜야 하며, 목표팀이 `잡아낸/꺾고/추격 뿌리치고` 등의 목적어이거나 `vs` 상대팀이면 accept하면 안 됩니다. 제목에 known namesake 팀이 함께 있어도 ambiguous여야 합니다.
- `전체 6순위` 같은 드래프트 순위를 `6번` 등번호로 오인하면 안 됩니다.
- 정책이 없는 날짜는 ambiguous로 submit을 막아야 합니다. 정책 기간 중복은 실행 전에 validation 실패해야 합니다.
- ambiguous 후보는 사람의 검토 전 자동 import하면 안 됩니다.

비목표:

- 새 기사 소스 추가
- 기사 본문 원문 전체의 영속 저장·로그·출력 또는 생성형 요약
- 관리자 UI의 크롤링 실행 버튼
- scheduler와 주기 실행
- CAPTCHA, robots, 403, 429 우회
- 현재 리뷰 단계에서의 코드 수정

다음 항목을 집중적으로 검토하세요.

1. 페이지 경계 누락
   - `--max-pages` 도달 시 일부 최신 기사만 submit되는 fail-open 경로가 있는지
   - watermark와 같은 timestamp가 다음 페이지에도 이어질 때 너무 일찍 중단하는지
   - 검색 결과 끝과 watermark 도달을 잘못 동일시하는지
   - source별 watermark가 섞이거나 source 정렬 계약을 잘못 가정하는지
   - Rookie 후속 page를 GET으로 보내거나, 최초 응답의 동적 `total`이 아닌 값을 POST하거나, 후속 응답의 `sc_word` 공백을 잘못 거절하거나, `total`/last/current page drift를 놓치는지
   - pagination 현재 page marker가 불일치하는데도 경계 완료로 오인하는지

2. 시간과 정렬
   - timezone 없는 source datetime, Python datetime, Spring/Mongo datetime 비교가 일관적인지
   - 날짜 형식 변경, DST, offset 포함 값이 조용히 잘못 비교되는지
   - backend public API가 `publishedAt desc`의 최신 source 기사 하나를 보장하는지
   - 동일 timestamp의 stable ordering이 안전한지

3. 부분 batch와 resume
   - oldest-first와 최대 200개 분할이 실제로 보장되는지
   - batch N 성공 후 N+1 실패 시 다음 실행이 중간 구간을 건너뛰지 않는지
   - item 단위 atomic upsert 이후 batch 중간 실패가 발생할 수 있는지와 구조화된 resume/receipt 부재의 영향
   - `(source,url)` query, `setOnInsert`, `upsertedId` 집계와 Article 전용 unique index가 실제 idempotency를 보장하는지
   - 200개 요청은 성공하고 201개 요청은 validation 실패하는 backend 테스트가 실제 계약을 고정하는지
   - redirect, non-2xx, malformed response가 성공으로 오인되는지

4. 선수 분류 regex
   - 팀 이름이 상대팀으로만 등장했는데 선수 소속으로 오인하는지
   - 양 팀이 함께 나오는 경기 기사에서 이름-팀 귀속이 정확한지
   - 다른 선수의 신장·나이·등번호를 목표 이소희 신호로 오인하는지
   - 드래프트 순위를 등번호로 오인하는지
   - 긴 문장, 괄호, 조사, 영문 alias, 띄어쓰기 변형에서 오탐·누락이 있는지
   - 농구와 비농구 국가대표 문맥의 충돌 우선순위가 맞는지
   - identity 통과와 선수의 직접 relevance 판정이 분리되어 있는지
   - 제목의 이름을 다른 인물의 `롤 모델`·기대·평가 같은 간접 언급으로 쓴 경우가 accept되지 않는지
   - 제목에 이름이 없을 때 최종 명단·직접 발언·강한 개인 기록이 같은 문장에 있어야만 accept하는지
   - U18·청소년·숙명여고·비농구 대표팀 제목이 우선 차단되는지

5. 시즌·FA 정책
   - 기사 `publishedAt`에 맞는 정책을 정확히 선택하는지
   - effectiveFrom/effectiveTo 양 끝 포함 경계가 의도와 맞는지
   - 2025-26 정보를 2026-27 동명이인 신호로 소급 판정하지 않는지
   - 시즌 중 FA 이적과 해외팀 alias가 config 새 구간만으로 처리 가능한지
   - 정책 공백이 ambiguous인지, 중복 기간이 validation 실패인지
   - 팀·학교·신장·드래프트 값이 classifier 코드에 다시 hardcode되어 있지 않은지
   - `allowBasketballDocumentFallback`, `allowTitleTeamContext`, document/title-document identity phrase가 두 기간 모두 비활성화되어 일반 경기·팀·대표팀 문서를 accept하지 않는지
   - cleanup audit이 full summary가 없는 입력을 fail-closed하고 mutation 없이 `KEEP`/`DELETE_CANDIDATE`/`MANUAL_REVIEW`만 생성하는지

6. config validation과 fail-closed
   - JSON type, 빈 배열, 중복 ID, 역전 날짜, 기간 중복, 잘못된 draft 값 검사가 충분한지
   - invalid config가 기사 사이트 또는 backend 요청 전에 종료되는지
   - invalid `publishedAt`이나 예상 밖 API response가 accept 또는 submit으로 이어지는지
   - ambiguous, missing date, chronology invalid, boundary incomplete 중 하나라도 submit을 막는지
   - 여러 source 중 하나가 unsafe일 때 다른 source가 먼저 전송되는지

7. public watermark 계약
   - 인증 없는 public endpoint 사용이 의도된 계약인지
   - `page=0&limit=1` 응답 shape, source/page/limit validation, `+09:00` 시각과 Python parsing이 실제 backend DTO와 일치하는지
   - source lowercase, 빈 DB, 404/redirect/5xx 처리가 안전한지
   - import key가 watermark GET이나 로그로 노출되지 않는지

8. 테스트 공백
   - 현재 56개 fixture/mock 테스트가 위 실패 모드와 실제 source 검색·선수 식별 계약을 고정하는지
   - 목록 snippet에 이름이 없고 상세 본문에만 이름이 있는 결과, 동적 `total`을 사용한 Rookie page2 form POST, 상세 selector drift가 고정되는지
   - backend 전체 105개 테스트가 Article index startup fail-closed, atomic upsert, public source 계약, import 200/201 경계를 실제로 고정하는지
   - assertion이 너무 약해 잘못된 구현도 통과할 수 있는지
   - property/boundary 테스트가 필요한 날짜·페이지·batch·regex 사례가 무엇인지
   - 테스트가 라이브 network나 실제 DB에 우발적으로 접근할 가능성이 있는지

9. 운영 MongoDB 배포 전 점검
   - 실제 `articles.getIndexes()`가 backend가 기대하는 이름, `source/url`, `unique`, partial filter와 일치하는지 확인할 운영 절차가 있는지
   - 기존 `(source,url)` duplicate를 배포 전에 찾는 read-only 점검 절차가 있는지
   - duplicate 때문에 index를 생성할 수 없을 때 startup 실패가 의도된 fail-closed라는 점이 운영 문서에 명확한지
   - 실제 운영 DB는 이번 리뷰에서 접속하지 말고, 필요한 명령·승인·복구 계획만 제시하는지

현재도 미해결인 항목으로 URL canonicalization, 사람이 검토한 결과의 승인 receipt, batch partial failure의 구조화된 workflow를 별도로 평가하세요. atomic upsert나 unique index가 이 세 기능을 이미 해결했다고 간주하지 마세요.

가능하면 다음 안전한 명령만 사용해 현재 테스트를 확인하세요.

```bash
cd /Users/superrookie/Development/supersohee/admin
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s crawlers/tests -v
python3 -m crawlers.supersohee_crawlers.cli --help
```

두 번째 명령도 Python import cache를 만들 수 있으므로 작업 트리에 생성물이 남는지 확인하세요. live CLI 수집은 실행하지 마세요.

출력 형식:

먼저 발견 사항을 심각도 순으로 작성하세요. 요약보다 findings가 먼저 와야 합니다. 각 finding은 반드시 다음 형식을 지키세요.

```text
[Severity: Critical|High|Medium|Low] 짧은 제목
- 위치: relative/path:line
- 재현 시나리오:
- 영향:
- 근거:
- 권장 수정:
- 추가/수정할 테스트:
```

같은 원인의 문제는 하나로 묶고, 추측이면 추측이라고 표시하세요. 코드 근거가 없는 일반론은 제외하세요. 문제가 없다면 해당 영역에서 무엇을 확인했는지 적고 “발견 없음”이라고 명시하세요.

마지막에는 다음 순서로 결론을 주세요.

1. 최종 verdict: `승인 가능`, `수정 후 승인`, `운영 금지` 중 하나
2. submit 전 반드시 고쳐야 할 항목
3. fixture/mock만으로 추가 가능한 최소 테스트 목록
4. 사람의 정책 사실 확인이 필요한 항목
5. 실제 live dry-run을 승인하기 전에 확인할 체크리스트

리뷰가 끝날 때까지 파일은 수정하지 마세요.

---
