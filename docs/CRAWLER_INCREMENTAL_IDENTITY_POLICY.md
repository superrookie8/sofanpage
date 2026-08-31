# 증분 기사 크롤러와 선수 식별 정책 검토 문서

## 1. 문서 목적

이 문서는 `supersohee/admin/crawlers`에 구현된 기사 크롤러를 운영하거나 코드 리뷰할 때 필요한 핵심 설계와 안전 조건을 독립적으로 설명한다. 대상 독자는 구현을 처음 보는 개발자와 운영 검토자다.

크롤러의 목적은 Jumpball과 Rookie에서 이소희 선수 관련 기사 메타데이터를 수집하고, 기존 Spring 기사 데이터 이후의 항목만 안전하게 정규화·검토·전송하는 것이다. 검색 결과 검증을 위해 상세 본문은 메모리에서 읽지만 원문 전체의 영속 저장·로그·출력, 자동 요약, 관리자 웹 화면에서의 실행, 예약 실행은 현재 범위가 아니다.

최신 구현 기준 admin fixture/mock 테스트 56개와 backend 전체 테스트 105개가 통과했다. selector 계약 갱신에는 별도로 제공된 실사이트 검색·상세 HTML 캡처를 오프라인으로 사용했으며, 이 검증에서 새 라이브 크롤링, Spring import 호출, MongoDB 쓰기는 실행하지 않았다.

## 2. 증분 수집 기준

현재 DB에는 2026-01-23 게시 기사까지 저장되어 있다는 운영 정보를 출발점으로 삼는다. 실제 실행에서는 날짜를 명령행에 고정하지 않고 소스별로 다음 공개 API를 호출해 가장 최신 `publishedAt`을 watermark로 얻는다.

```text
GET /api/articles/{source}?page=0&limit=1
```

Jumpball과 Rookie는 서로 독립된 watermark를 갖는다. 한 소스의 최신 날짜를 다른 소스에 적용하지 않는다. 이 조회에는 관리자 JWT나 기사 import key를 보내지 않는다.

backend 공개 source API는 지원 source와 `page`, `limit`을 validation하고 DTO의 `publishedAt`을 명시적 서울 offset(`+09:00`) 문자열로 반환한다. Python은 호환성을 위해 `Z` 또는 다른 offset도 `Asia/Seoul` local datetime으로 변환한다. 이후 source가 실제 제공하는 정밀도에 맞춰 Jumpball은 초, Rookie는 분 단위로 내림한다. 이 정규화 뒤에도 같은 시각을 포함하는 `>=` 비교를 유지한다.

후보 조건은 `publishedAt > watermark`가 아니라 다음과 같다.

```text
publishedAt >= source watermark
```

같은 분·초에 게시된 여러 기사가 페이지 경계에 나뉘거나 이전 실행의 일부 batch만 성공했을 수 있으므로 watermark와 같은 시각을 의도적으로 다시 포함한다. 이미 저장된 경계 기사는 백엔드의 `(source, url)` idempotency로 `existing` 처리된다.

## 3. 페이지 경계와 submit 차단

검색 결과는 최신 페이지부터 읽는다. 기존 watermark가 검색 결과에 나타났다는 이유만으로 즉시 중단하지 않는다. 다음 중 하나를 확인해야 해당 소스의 경계에 도달한 것으로 인정한다.

- watermark보다 오래된 게시 시각을 확인했다.
- watermark와 같은 시각의 항목까지 포함한 검색 결과의 실제 끝에 도달했다.

`--max-pages` 한도에서 이 조건을 증명하지 못하면 `watermark_reached=false`이며 submit을 차단한다. 일부 최신 기사만 먼저 저장하면 DB의 최신 날짜가 앞으로 이동해 중간 페이지가 영구 누락될 수 있기 때문이다.

검색 끝은 명시적 마지막 링크, 비활성 다음 버튼, 또는 정상 목록 컨테이너가 존재하는 실제 빈 결과로만 증명한다. pagination markup 없음, window에 현재 보이는 최대 숫자, 목록 item selector가 깨진 페이지는 terminal로 인정하지 않는다.

Rookie는 최초 검색 form POST에서 keyword context와 서버가 만든 동적 `total`·마지막 page를 검색 identity로 고정한다. pagination href의 GET은 검색 상태를 잃으므로 같은 Session에서 다음 page, 동적 `total`, `sc_area=A`, `sc_word`, `view_type=sm`을 form POST하고 빈 `box_idxno`를 함께 보낸다. 후속 응답의 `sc_word` 표기는 비어도 되지만 `total`·마지막 page가 바뀌거나 현재 page를 확인할 수 없으면 첫 페이지/전체기사 목록으로 이탈한 것으로 보고 실패한다. `total` 값은 코드나 문서의 관측값으로 하드코딩하지 않는다. 두 소스 모두 제목+내용 검색 결과를 목록 snippet만으로 버리지 않으며 상세 본문을 확인한 다음 keyword/entity filter를 적용한다.

다음 조건도 fail-closed로 submit을 차단한다.

- 게시 시각을 파싱하지 못한 검색 후보가 하나라도 있음
- 검색 결과의 게시 시각이 최신순이라는 가정이 깨짐
- 사람 확인이 필요한 `ambiguous` 선수 판정이 하나라도 있음
- 기사 날짜에 대응하는 선수 식별 정책이 없음

모든 선택 소스를 먼저 수집하고 안전 검사를 마친 뒤에만 전송을 시작한다.

## 4. 전송 순서와 부분 성공 복구

전송 후보는 소스별로 `publishedAt`, URL 오름차순으로 정렬해 오래된 기사부터 보낸다. 한 import 요청의 최대 크기는 200개다.

```text
source candidates
  -> oldest first
  -> batches of at most 200
  -> POST /api/admin/articles/import
```

최신 항목부터 저장하지 않는 이유는 중간 batch가 실패하더라도 다음 실행의 source watermark가 아직 저장하지 못한 중간 구간을 건너뛰지 않게 하기 위해서다. import client에는 자동 POST retry가 없다. 실패 후에는 원인을 확인하고 동일 구간을 다시 실행한다. 이미 저장된 URL은 `(source, url)` 기준으로 중복 생성되지 않아야 한다.

백엔드는 각 item을 `(source,url)` 기준 Mongo atomic upsert하며 `upsertedId` 유무로 `created`와 `existing`을 집계한다. Article 전용 startup initializer가 필요한 unique compound index를 생성·검증하며, 전역 auto-index를 켜지는 않는다. 다만 batch 전체가 하나의 transaction인 것은 아니다. 요청 중 일부 item upsert 후 실패했을 때의 구조화된 partial-success 응답과 resume receipt는 여전히 미구현이다.

## 5. 기간별 선수 식별 정책

2025-26의 실제 `[63춘계]` 제목은 숙명여고를 `숙명`으로 축약하므로 이 대회 표식 자체를 기간별 동명이인 이벤트로 사용한다. 일반 단어 `숙명`은 전역 신호로 추가하지 않으며, 직접 BNK·신장·나이·등번호 target 신호는 이 이벤트보다 우선한다.

현재 소속팀과 동명이인 특징은 Python 판정 코드에 영구 고정하지 않는다. `crawlers/config/player_identity_policies.json`의 기간별 정책에서 관리하며, classifier는 기사의 `publishedAt` 날짜를 포함하는 정책을 선택한다.

현재 기본 구간은 다음과 같다. 양 끝 날짜는 모두 포함한다.

| 정책 ID | 기간 | 의미 |
| --- | --- | --- |
| `2025-26-bnk` | 2025-07-01 ~ 2026-06-30 | 해당 기간의 목표 선수·동명이인 identity 신호를 사용한다. 농구 문서 fallback, 제목 팀 문맥, 넓은 대표팀 문맥은 모두 비활성화된다. |
| `2026-27-bnk` | 2026-07-01 ~ 2027-06-30 | 삼성생명/숙명여고/U18·청소년/180·181cm/드래프트 6순위 등 해당 기간의 동명이인 identity 신호를 추가한다. relevance fallback은 2025-26과 동일하게 비활성화된다. |

따라서 2026-01-23 이후 backfill은 2025-26 정책으로 시작하고, 2026-07-01 게시 기사부터 2026-27 정책으로 전환된다.

판정의 의미는 다음과 같다.

- `accept`: identity 안전성을 통과한 뒤, 제목에 선수 이름이 직접 있거나 제목·같은 문장에 최종 명단·직접 발언·강한 개인 기록 근거가 있어 선수에게 직접 발생한 소식으로 확인된다. `롤 모델은 이소희`처럼 다른 인물이 주인공인 간접 언급은 제외한다.
- `reject`: 해당 정책에 등록된 동명이인의 팀·학교·identity phrase·신장·드래프트 신호가 이름에 연결되거나, 정책의 청소년 제목/동명이인 이벤트 문맥이 확인되거나, 비농구 종목이 이름에 문법적으로 직접 귀속된다.
- `ambiguous`: 정책이 없거나, 농구 기사이지만 목표 소속을 확인하지 못했거나, 목표팀과 동명이인 신호가 충돌하거나, 양 팀 중 어느 팀이 이름에 귀속되는지 불명확하다.

`국가대표` 단독은 relevance accept 근거가 아니다. 여자농구 최종 명단·엔트리·발탁처럼 선수 개인에게 직접 발생한 소식이고 이름이 근거 문장에 있어야 accept한다. U18·청소년·학교 신호와 비농구 종목은 identity 단계에서 우선 차단한다.

학교는 `숙명여고 이소희`, `이소희(숙명여고)`, `이소희[숙명여고]`처럼 제한된 직접 귀속 표기를 신뢰한다. 두 시즌 정책의 `knownNamesakes.eventIdentityPhrases`에는 고교대회 제목용 `숙명여고`·`여고부`가 있고, 2026-27에는 드래프트·트라이아웃도 있다. 이름에 직접 귀속된 목표팀·성인 대표팀 문구·신장·나이·등번호 보조 신호는 이벤트보다 먼저 accept한다. 반면 문서 전체의 넓은 대표팀 문맥은 이벤트보다 뒤에서 평가해 W드래프트·고교 문서를 목표 선수로 오인하지 않는다.

`target.documentIdentityPhrases`, `target.titleDocumentIdentityPhrases`, `target.allowTitleTeamContext`, `allowBasketballDocumentFallback`은 두 기간 모두 비활성화되어 있다. 단순 BNK 경기, 상대 감독 인터뷰, 팀 기사, 대표팀 경기, 팝업·중계·시상식은 자동 submit 대상이 아니다.

신장·나이·등번호는 정책상 보조 신호다. 이름에 직접 연결되고 같은 문장의 농구 문맥까지 확인되면 accept할 수 있지만, 보조 신호 단독은 ambiguous이며 명시적인 동명이인 신호를 뒤집지 않는다. 숫자 앞뒤 경계를 검사해 6/16, 181/1181, 26/126 substring 오인을 막고, 등번호는 숫자 뒤에 `번`이 붙은 표현만 사용한다.

식별(identity)과 직접 관련성(relevance)은 별도로 판정한다. 목표 선수로 식별되어도 기사의 주인공이 아니면 reject하며, 과수집보다 누락을 선택하는 보수적 기준이다.

정밀화 전 2026-08-31 live review count는 Jumpball `2 accept / 9 ambiguous / 9 reject`, Rookie `2 accept / 37 ambiguous / 1 reject`였다. 1차 정밀화 뒤에는 Jumpball `4/6/10`, Rookie `12/25/3`, 2차 뒤에는 Jumpball `7/0/13`, Rookie `23/8/9`(`accept/ambiguous/reject`)였다. 이번 3차 뒤 정확한 count는 summary를 저장하지 않는 기존 review 파일만으로 재계산할 수 없으며, 동일 page 범위의 submit 없는 bounded dry-run으로만 확정할 수 있다. 코드 검증은 대표 live 유형을 fixture/test로 재현하며 새 live crawl이나 import는 수행하지 않는다.

## 6. 정책 공백·중복 처리

게시일을 포함하는 정책이 없으면 classifier는 자동 accept/reject하지 않고 ambiguous를 반환한다. 이 후보가 존재하면 submit은 차단된다.

정책 기간이 하루라도 겹치면 설정 validation 실패다. CLI는 backend watermark 조회나 기사 사이트 요청 전에 종료해야 한다. 잘못된 날짜, 중복 정책 ID, 빈 목표팀 alias, 잘못된 필드 타입도 같은 방식으로 실패한다.

기간 공백은 설정 파일 자체로는 허용한다. 이는 사실을 확인하지 못한 기간을 억지로 추정하지 않기 위한 선택이지만, 해당 기간 기사 수집은 운영자가 새 정책을 추가할 때까지 진행할 수 없다.

## 7. 시즌·FA·해외 진출 갱신 절차

1. 공식 발표를 통해 새 소속의 효력 시작일을 확인한다.
2. 기존 과거 정책의 사실을 새 값으로 덮어쓰지 않는다.
3. 시즌 중 이적이면 이전 정책의 `effectiveTo`를 이적 전날로 끝낸다.
4. 이적일부터 시작하는 새 정책을 추가하고 새 국내·해외 팀의 실제 기사 표기를 `target.teamAliases`에 넣는다.
5. 해당 기간에 확인된 동명이인과 보조 신호만 새 구간에 기록한다. 나이·등번호처럼 시점에 따라 불확실한 값은 빈 배열로 둔다.
6. 기간 공백과 중복, 경계일 선택, 이전 팀/새 팀 판정을 fixture 테스트로 검증한다.
7. 전송 없는 review 결과를 사람이 확인한 뒤 별도 승인이 있을 때만 submit한다.

## 8. 데이터 흐름

```text
CLI arguments
  -> identity policy JSON validation
  -> source별 public watermark GET
  -> offset을 Asia/Seoul로 변환 + source 정밀도 floor
  -> Jumpball GET (`sfld=all`, 최근 12개월) / Rookie 검색 form POST session
  -> source별 검색 page (Jumpball zero-based pagenum, Rookie dynamic-total form POST/context 확인)
  -> HTTPS/allowed-host/timeout/retry/pacing client
  -> 모든 목록 결과의 same-host 상세 page GET
  -> 상세 body 전체에서 keyword 문맥 추출(앞뒤 600자, summary 최대 4,000자)
  -> HTML parser
  -> RawArticle
  -> normalize + URL dedupe + date sort
  -> publishedAt >= source watermark
  -> publishedAt에 맞는 identity policy 선택
  -> accept / reject / ambiguous
  -> /private/tmp review JSON
  -> boundary/date/order/identity safety checks
  -> [승인된 --submit만] oldest-first, <=200 import batches
  -> backend Mongo atomic upsert (source, url)
  -> upsertedId 기반 created / existing 집계
```

검토 JSON에는 source, 제목, URL, 게시 시각, 판정과 짧은 근거만 기록한다. 상세 본문 전체, 전체 목록 요약, 인증 값은 기록하지 않는다. 상세 본문은 메모리에서 검사하며 정규화 대상에는 keyword 중심의 제한된 문맥만 전달한다.

## 9. 파일 지도

| 파일 | 검토 책임 |
| --- | --- |
| `admin/crawlers/supersohee_crawlers/cli.py` | 정책 로드 순서, CLI 제한, 전체 실행과 submit gate |
| `admin/crawlers/supersohee_crawlers/import_client.py` | public watermark 계약, import 인증·batch 순서 |
| `admin/crawlers/supersohee_crawlers/sources.py` | 페이지 순회, watermark 경계 도달 판정 |
| `admin/crawlers/supersohee_crawlers/parsers.py` | 소스별 selector와 게시 시각 파싱 |
| `admin/crawlers/supersohee_crawlers/normalize.py` | URL·필드·날짜 정규화와 실행 단위 dedupe |
| `admin/crawlers/supersohee_crawlers/pipeline.py` | inclusive watermark 후보와 submit 안전 조건 |
| `admin/crawlers/supersohee_crawlers/policy.py` | 정책 schema validation, 기간 정렬·중복 검사, 날짜 선택 |
| `admin/crawlers/supersohee_crawlers/classify.py` | 정책값을 사용하는 일반 문맥 판정 엔진 |
| `admin/crawlers/supersohee_crawlers/review.py` | 검토 파일 경로·내용 제한 |
| `admin/crawlers/config/player_identity_policies.json` | 현재 기간별 선수 사실 |
| `admin/crawlers/tests/test_incremental.py` | watermark, batch, 정책 경계, 이적, 동명이인 회귀 |
| `admin/crawlers/tests/test_parsers.py` | fixture 기반 selector·날짜 파싱 |
| `admin/crawlers/tests/test_pipeline.py` | HTTP 정책, 정규화, mock import |

관련 backend 계약도 함께 검토할 경우 public source 기사 조회와 admin article import controller/service/repository, Article index initializer를 찾아 `page=0&limit=1`, `+09:00` DTO, 정렬 방향, `(source,url)` atomic upsert와 unique index, 200개 제한이 Python 가정과 일치하는지 확인해야 한다.

## 10. 검증 상태

현재 확인한 명령은 다음과 같다.

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s crawlers/tests
python3 -m crawlers.supersohee_crawlers.cli --help
```

결과:

- Python 테스트 56개 통과
- backend 전체 테스트 105개 통과
- public source 200 응답과 `+09:00` DTO/validation 계약 확인
- import batch 200건의 200 성공 및 201건의 400 validation 실패 확인
- Article 전용 startup unique index 생성·검증·fail-closed와 atomic upsert `upsertedId` 집계 확인
- 시즌 경계, 정책 없는 날짜, 기간 중복, FA·해외팀 전환, 동명이인 사례 포함
- pagination terminal/DOM drift/window, watermark offset/정밀도, 숫자 경계, 비농구 귀속, CLI preflight 포함
- CLI의 `--identity-policy` 옵션 확인
- 기본 정책 JSON 파싱 확인
- fixture/mock 테스트와 이번 검증에서는 실제 기사 사이트 요청 미실행(제공된 캡처만 오프라인 파싱)
- 실제 Spring import와 MongoDB 쓰기 미실행

테스트 수는 이후 코드 변경으로 달라질 수 있으므로 리뷰 시 실제 실행 결과를 다시 확인해야 한다.

## 11. 알려진 한계와 검토 쟁점

- source 기사 시각은 timezone 없는 local datetime이고 backend offset watermark는 서울 시각으로 변환한다. Spring/Mongo에 저장된 legacy 값의 원래 timezone 의미가 서울 시각인지 운영 확인은 여전히 필요하다.
- public watermark API의 source/page/limit validation, source별 최신 `publishedAt` 정렬과 `+09:00` DTO 계약은 backend 테스트로 고정되어 있다. 운영 데이터의 source·날짜 품질은 별도 확인이 필요하다.
- 검색 사이트가 고정된 최신순을 보장하지 않거나 중간에 고정·광고 기사를 삽입할 경우 chronology 검사만으로 충분한지 검토가 필요하다.
- 2026-08-31 실HTML 기준 Jumpball `.pageindex`/zero-based `pagenum`/`#viewConts`와 Rookie `.pagination-end`/Session 검색 context/동적-total page POST/상세 body를 축약 fixture에 반영했다. Rookie 후속 응답의 `sc_word`는 비어도 되지만 최초 응답과 `total`·last page가 다르거나 현재 page를 검증할 수 없으면 안전하게 차단된다.
- URL query와 trailing slash는 현재 완전히 canonicalize하지 않아 동일 기사가 다른 URL로 저장될 수 있다.
- entity regex는 제목과 목록 요약에 상세 본문의 keyword 중심 문맥을 더한 최대 4,000자 summary를 사용한다. 본문 전체를 저장하지 않으므로 키워드에서 600자보다 멀리 떨어진 귀속 표현은 누락될 수 있고, 문장이 길거나 양 팀이 함께 등장하면 오탐·누락 가능성이 있다.
- 팀 alias가 다른 단어의 부분 문자열로 나타나는 경우, 조사·괄호·영문 표기 변형에서 직접 귀속 regex가 적절한지 검토가 필요하다.
- 정책 날짜는 양 끝 포함 날짜 단위다. 시즌 중 당일 이적 발표와 효력 시각이 다른 경우 일 단위 모델로 충분한지 결정해야 한다.
- 여러 source를 모두 안전 검사한 뒤 전송하지만, 첫 source 전송 후 두 번째 source가 실패하면 전체 실행은 부분 성공이다.
- item 단위 atomic upsert와 `upsertedId` 집계는 backend 테스트로 고정되어 있지만 batch 전체 transaction은 아니다. 중간 실패의 구조화된 응답, review 승인 receipt와 resume workflow는 미구현이다.
- URL query/trailing slash canonicalization은 미구현이라 논리적으로 같은 기사가 서로 다른 URL이면 unique identity가 달라질 수 있다.
- 운영 배포 전 실제 MongoDB의 `articles.getIndexes()`와 기존 `(source,url)` duplicate를 확인해야 한다. duplicate나 불일치 index가 있으면 Article initializer가 의도적으로 startup을 실패시킨다. 이를 전역 auto-index 동작으로 오해하거나 fail-open으로 우회하면 안 된다.
- 실제 사이트 DOM, robots/이용 정책, 403·429 대응은 fixture 테스트만으로 검증되지 않았다.
- 사람이 ambiguous를 검토한 뒤 특정 기사만 승인하는 별도 workflow는 미구현이다. 현재는 ambiguous가 하나라도 있으면 해당 실행 submit을 막는다.

리뷰의 최우선 질문은 “불확실할 때 저장하지 않는가”와 “일부 성공 후에도 다음 실행이 중간 구간을 건너뛰지 않는가”다.

운영 전 필수 확인은 실제 `articles` collection의 index 정의와 기존 duplicate 여부다. 코드와 테스트가 index 생성을 보장하더라도 현재 운영 DB 상태를 이 문서 검증에서 조회하지는 않았다.
