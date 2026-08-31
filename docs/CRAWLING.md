# 기사 크롤러 운영 가이드

이 문서는 `admin/crawlers/`에 있는 **현재 구현**을 기준으로 작성했다. 레거시 Flask 크롤러의 동작을 설명하는 문서가 아니며, 존재하지 않는 기능은 아래에서 명시적으로 `미구현`으로 표시한다.

## 1. 목적과 MVP 범위

크롤러의 목적은 이소희 선수 관련 기사를 Jumpball과 Rookie 검색 결과에서 수집하고, 안전한 공통 형식으로 정규화한 뒤 Spring 백엔드의 기사 import API로 전달하는 것이다.

현재 MVP 범위는 다음과 같다.

- 지원 소스: `jumpball`, `rookie`
- 기본 검색어: `이소희`
- 수집 대상: 제목, 원문 URL, 검색 목록 요약과 제한된 상세 keyword 문맥, 대표 이미지 URL, 게시 시각
- 저장 대상: Spring 백엔드의 단일 `articles` 컬렉션
- 실행 방식: 관리자가 터미널에서 실행하는 Python CLI
- 기본 동작: Spring 공개 기사 API에서 소스별 최신 `publishedAt` watermark를 읽고, 그 경계까지 증분 수집한 뒤 판정 결과를 화면과 `/private/tmp` JSON에 남긴다. `--submit`이 없으면 import API에는 전송하지 않는다.
- 증분 기준: 실행 시점의 DB 소스별 최신 게시 시각. 고정된 “최근 12개월” 기준을 사용하지 않는다.
- 동명이인 안전장치: `accept`, `reject`, `ambiguous`로 나누며 `ambiguous`가 있으면 자동 전송을 차단한다.

다음 항목은 현재 MVP에 포함되지 않는다.

- 기사 본문 원문 전체의 영속 저장·로그·출력 또는 생성형 자동 요약: **미구현**
- 관리자 웹 UI에서 크롤링 시작/중지: **미구현**
- 예약 실행, 주기 실행, 마지막 실행 시각 관리: **미구현**
- 기사 수정/삭제 또는 소스 관리 UI: **미구현**
- 단일 URL 지정 수집: **미구현**
- 사진·팬아트 수집: **미구현**
- 한 실행의 최대 기사 건수 옵션: **미구현**. `--max-pages`로만 요청 범위를 제한한다.
- CLI에서 allowed host를 추가·변경하는 옵션: **미구현**. 허용 호스트는 코드에 고정되어 있다.

> 주의: `--submit`을 생략한 실행도 외부 기사 사이트에 실제 요청을 보낸다. Jumpball은 GET, Rookie는 최초 검색과 후속 페이지 모두 같은 Session의 form POST를 사용한다. 여기서 “기본 실행” 또는 “전송 없는 실행”은 **백엔드 import만 하지 않는 것**이지, 네트워크 없는 시뮬레이션을 뜻하지 않는다. 네트워크 없는 검증은 fixture 테스트를 사용한다.

## 2. 디렉터리와 모듈

| 경로 | 책임 |
| --- | --- |
| `crawlers/supersohee_crawlers/cli.py` | CLI 옵션 파싱, 소스 선택, 전체 파이프라인 조립, 결과 출력 |
| `crawlers/supersohee_crawlers/sources.py` | Jumpball/Rookie별 요청 순서와 페이지 순회 |
| `crawlers/supersohee_crawlers/http.py` | HTTPS/호스트 제한, timeout, retry, pacing, redirect 검증 |
| `crawlers/supersohee_crawlers/parsers.py` | HTML selector 기반 목록·날짜·페이지 파싱 |
| `crawlers/supersohee_crawlers/models.py` | `RawArticle`, `NormalizedArticle`, API payload 변환 |
| `crawlers/supersohee_crawlers/normalize.py` | 필드 정규화, 키워드·URL·날짜 필터, 실행 단위 중복 제거 |
| `crawlers/supersohee_crawlers/policy.py` | 기간별 선수 식별 정책 JSON 로드·검증·게시일 정책 선택 |
| `crawlers/config/player_identity_policies.json` | 시즌/이적 구간별 목표팀·동명이인·보조 신호 설정 |
| `crawlers/supersohee_crawlers/classify.py` | 선택된 기간 정책과 이름 주변 문맥을 이용한 일반 판정 엔진 |
| `crawlers/supersohee_crawlers/pipeline.py` | watermark 경계 필터와 submit 안전 조건 계산 |
| `crawlers/supersohee_crawlers/review.py` | 제목·URL·날짜·판정 근거만 담은 `/private/tmp` 검토 JSON 생성 |
| `crawlers/supersohee_crawlers/import_client.py` | 공개 source watermark GET과 import key POST를 분리한 Spring client |
| `crawlers/tests/fixtures/` | 실사이트 대신 사용하는 고정 HTML |
| `crawlers/tests/test_parsers.py` | 소스 selector, 날짜, 페이지 파싱 검증 |
| `crawlers/tests/test_pipeline.py` | 정규화·중복·호스트 제한·mock import 검증 |
| `src/app/api/admin/articles/route.ts` | 관리자 UI의 수동 기사 목록/작성 BFF. Python 크롤러가 거치는 경로는 아님 |
| `src/components/admin/NewsInput.tsx` | 수동 기사 작성과 통합 기사 목록 UI |

필요한 Python 패키지는 `crawlers/requirements.txt`에 고정된 범위의 `beautifulsoup4`와 `requests`다.

## 3. 데이터 흐름

현재 파이프라인은 다음 순서로 동작한다.

```text
CLI 옵션 + SUPERSOHEE_BACKEND_URL
  -> 선수 식별 정책 JSON validation
  -> GET /api/articles/{source}?page=0&limit=1 (소스별 watermark)
  -> 소스 adapter (검색 URL, 페이지 순회)
  -> bounded HTTP client (HTTPS/host/timeout/retry/pacing)
  -> source parser (RawArticle)
  -> normalizer (NormalizedArticle 또는 탈락)
  -> 실행 단위 URL dedupe + 게시 시각 내림차순 정렬
  -> publishedAt >= watermark 경계 overlap
  -> entity classifier (accept / reject / ambiguous)
  -> /private/tmp 검토 JSON
  -> watermark 도달·날짜·정렬·ambiguous 안전 검사
  -> [--submit일 때만] Spring import client
  -> 소스별 오래된 순서, 최대 200개 batch로 POST /api/admin/articles/import
  -> 백엔드 Mongo atomic upsert (source, url)
  -> upsertedId 유무로 created / existing 집계
```

### RawArticle

소스 parser가 만드는 내부 데이터다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `source` | string | `jumpball` 또는 `rookie` |
| `title` | string | 검색 목록의 기사 제목 |
| `url` | string | 기사 원문 URL |
| `summary` | string | 검색 목록 요약 + 상세 본문의 keyword 주변 문맥. 생성형 자동 요약이 아님 |
| `image_url` | string/null | 검색 목록의 대표 이미지 URL |
| `published_at` | datetime/null | 기사 게시 시각 |

### NormalizedArticle와 API 필드

`NormalizedArticle.as_api_dict()`가 Python 이름을 Spring DTO의 camelCase로 변환한다.

| Python | API JSON | 필수 여부/제약 |
| --- | --- | --- |
| `source` | `source` | 필수, 정확히 lowercase `jumpball` 또는 `rookie` |
| `title` | `title` | 필수, 백엔드 최대 300자 |
| `url` | `url` | 필수, 백엔드 최대 2,000자 |
| `summary` | `summary` | 선택 가능, 백엔드 최대 20,000자 |
| `image_url` | `imageUrl` | 선택 가능, 백엔드 최대 2,000자 |
| `published_at` | `publishedAt` | 필수, timezone 없는 ISO local datetime |

한 번의 import 요청은 `{"articles": [...]}` 형태이며 백엔드는 최대 200개를 허용한다. backend 계약 테스트는 200건 요청의 200 성공 응답과 201건 요청의 400 validation 실패를 함께 고정한다. CLI는 소스별 후보를 `publishedAt`, URL 오름차순으로 정렬한 뒤 최대 200개씩 나누어 오래된 batch부터 전송한다. 중간 실패 후 다음 실행이 DB watermark에서 안전하게 이어지도록 최신 기사부터 보내지 않는다.

## 4. 소스별 수집 규칙

### Jumpball

- 검색 URL: `https://jumpball.co.kr/news/search.php`
- 검색 parameter: `q=<keyword>`, `sfld=all`, `period=MONTH|12`. 첫 화면은 `pagenum`을 생략하고, 표시 페이지 2부터 zero-based `pagenum=1`을 사용한다.
- 목록 item: `.listPhoto`
- 제목·링크: `dt a`
- 요약: `.conts`, 없으면 `.txt`
- 이미지: `.img a`의 inline `style` 안 `url(...)`
- 게시 시각: 각 기사 상세 페이지를 추가 요청한 뒤 `.viewTitle dl dd` 또는 `#main .viewTitle dd`에서 `YYYY-MM-DD HH:MM:SS`를 추출
- 상세 본문: `#viewConts`
- pagination: `.pageindex`. `pagenum` 값에 1을 더해 화면 page로 해석한다. 명시적 마지막 링크/비활성 다음 버튼 또는 정상 목록 컨테이너의 실제 빈 결과만 terminal로 인정하며 보이는 숫자 링크의 최댓값만으로 끝을 추정하지 않는다.

`sfld=all`은 제목+내용 검색이므로 목록 제목·snippet에 키워드가 없어도 정상 검색 결과일 수 있다. 따라서 목록 parser는 유효한 링크가 있는 모든 결과를 유지하고, 상세 본문 전체를 메모리에서 확인한 뒤 키워드 주변 문맥으로 summary를 보강한다. 상세 페이지에서 날짜를 얻지 못한 항목은 `published_at=None`이 되고 normalizer에서 제외된다. 이 항목이 하나라도 있으면 경계를 증명할 수 없으므로 `--submit`도 차단한다. 본문 selector를 찾지 못하면 parser drift로 보고 실행 자체를 실패시킨다.

요청 수는 “검색 목록 페이지 수 + 목록에 나온 모든 기사 수만큼의 상세 요청”이다. 첫 검색 페이지는 페이지 수 계산과 1페이지 파싱에 재사용한다.

### Rookie

- 검색 URL: `https://www.rookie.co.kr/news/articleList.html`
- 최초 검색: 같은 `requests.Session`에서 `POST /news/articleList.html`, form `sc_area=A`, `sc_word=<keyword>`, `view_type=sm`
- 후속 페이지: 같은 Session에서 `POST /news/articleList.html`을 반복한다. payload는 `page=<next page>`, `total=<최초 응답에서 파싱한 값>`, `box_idxno=`, `sc_area=A`, `sc_word=<keyword>`, `view_type=sm`이다. `total`은 관측값으로 하드코딩하지 않는다.
- 목록 item: `#section-list > ul > li`
- 제목·링크: `.titles a`
- 요약: `.lead a`
- 이미지: `.thumb img`
- 게시 시각: `.byline em:last-child`에서 `YYYY.MM.DD HH:MM`을 추출
- 상세 본문: `#article-view-content-div.article-veiw-body`
- 페이지 종료: `.pagination-end` 부모 class와 `title=끝`의 page를 명시적 마지막으로 읽는다. 비활성 다음 버튼 또는 `#section-list > ul`이 정상 존재하면서 실제로 빈 결과인 경우도 terminal로 인정한다.

Rookie는 pagination href를 GET하면 검색 상태를 잃고 첫 페이지나 전체기사 목록을 반환할 수 있으므로 form POST가 만든 Session에서 후속 page도 POST한다. 최초 POST 응답에서는 view-type link의 요청 keyword를 확인하고, pagination에서 동적으로 얻은 `total`과 마지막 page를 검색 identity로 고정한다. 후속 응답의 view-type `sc_word` 표기는 비어도 되지만, 동일 `total`·동일 마지막 page·요청한 현재 page marker를 모두 요구한다. 이 검증으로 첫 페이지로 되돌아가거나 전체기사 `total=103022/page=5152` 같은 응답으로 이탈하면 실행이 실패한다.

Rookie도 목록의 모든 검색 결과를 유지하고 각 상세 페이지를 요청한다. 상세 본문에서 키워드 문맥을 얻은 뒤 normalizer와 동명이인 classifier를 적용한다. 과거 parser의 `원조 머슬녀` 문자열 hardcode는 제거했으며, 이 문구는 기간 정책의 `knownNamesakes.identityPhrases`로 판정되어 review에 reject 근거가 남는다. 날짜 형식이 달라진 항목은 `published_at=None`으로 유지해 정규화 대상에서는 제외하면서 submit 안전 검사를 실패시킨다. 상세 본문 selector가 사라지면 실행을 실패시킨다.

두 소스의 상세 본문은 기사 전체를 저장하거나 출력하지 않는다. 메모리에서 keyword의 모든 위치를 찾고 각 위치 앞뒤 최대 600자 문맥을 목록 요약과 합친 뒤 4,000자로 자른다. 이 보강 summary만 `normalize`/`classify`와 import DTO에 사용한다.

## 5. 공통 정규화와 필터

`normalize.py`의 실제 처리 기준은 다음과 같다.

1. `source`를 trim 후 lowercase로 만든다.
2. 제목과 요약의 연속 공백·줄바꿈을 단일 공백으로 합친다.
3. URL의 scheme과 host를 lowercase로 만들고 fragment(`#...`)를 제거한다.
4. 기사 URL이 HTTPS가 아니거나 해당 source의 허용 호스트가 아니면 제외한다.
5. 정규화한 제목과 상세 keyword 문맥으로 보강된 요약을 합친 문자열에 키워드가 포함되지 않으면 제외한다.
6. 게시 시각이 없으면 제외한다.
7. source parser가 만든 게시 시각의 microsecond를 제거하고 ISO 문자열로 만든다. source 기사 시각 자체에는 timezone 변환을 적용하지 않는다. backend watermark의 offset 정규화는 다음 단계에서 별도로 수행한다.
8. 한 실행 안에서는 정규화된 **URL만** key로 삼아 먼저 나온 기사를 유지한다.
9. 결과를 `publishedAt` 내림차순으로 정렬한다.

그 다음 증분 파이프라인은 DB watermark와 같은 시각을 포함해 `publishedAt >= watermark`만 검토 후보로 유지한다. 경계 시각을 겹쳐 가져오는 이유는 같은 분·초에 게시된 별도 기사나 이전 batch의 부분 성공을 누락하지 않기 위해서다. 이미 저장된 경계 기사는 백엔드 `(source,url)` idempotency로 `existing` 처리된다.

backend watermark가 offset을 포함하면 먼저 `Asia/Seoul`로 변환해 timezone 없는 local datetime으로 만든다. 그 뒤 Jumpball은 초 단위, Rookie는 분 단위로 내림해 각 사이트 parser가 제공하는 정밀도와 맞춘다. `Z`도 UTC로 해석해 서울 시각으로 변환한다. 정밀도를 맞춘 뒤에도 경계 비교는 inclusive `>=`다.

### 기간별 이소희 선수 동명이인 판정

2025-26에는 숙명여고가 제목에서 `숙명`으로 축약된 실제 춘계 고교대회 사례를 전역 `숙명` 규칙으로 넓히지 않고, 대회 고유 표식 `[63춘계]`만 기간별 이벤트 문구로 등록한다. 이 표식도 직접 BNK·신장·나이·등번호 target 신호보다 뒤에서 평가된다.

소속팀과 동명이인 신호는 Python 코드에 고정하지 않고 `crawlers/config/player_identity_policies.json`에 기간별로 둔다. classifier는 기사의 `publishedAt` 날짜를 포함하는 정책 하나를 고른 다음, 제목과 상세 keyword 문맥으로 보강된 요약을 문장 단위로 나눠 선수 이름과 **같은 문장 또는 제한된 근접 거리**에 있는 신호만 사용한다. 정책이 없는 날짜는 자동 accept/reject하지 않고 `ambiguous`로 처리한다. 정책 기간이 하루라도 겹치면 CLI가 네트워크 요청 전에 설정 오류로 종료한다.

| 판정 | 기준 | 자동 submit |
| --- | --- | --- |
| `accept` | identity 안전장치를 통과하고 제목에 `이소희`가 직접 표기됨. 제목 미표기 시 제목 자체가 공식 최종명단·엔트리·발탁 소식이고 본문 같은 문장에 이름이 있거나, 직접 발언 또는 강한 개인기록 근거가 같은 문장에 있음 | 가능 |
| `reject` | 해당 날짜 정책의 `knownNamesakes` 팀·학교·identity phrase·신장·드래프트 지명 신호가 이름에 연결됨. 또는 정책의 청소년 제목/동명이인 이벤트 문맥이나 이름에 직접 귀속된 비농구 종목이 확인됨 | 제외 |
| `ambiguous` | 날짜 정책 없음, 이름만 일치, 농구지만 목표 소속팀 불명, 목표팀과 동명이인 신호가 모두 귀속됨, 비농구 단어가 근처에 있지만 이름 귀속은 불명, 또는 농구·비농구 신호 충돌 | 불가능. 사람 확인 필요 |

정책의 `auxiliarySignals`에 둔 신장·나이·등번호가 이름에 문법적으로 직접 연결되고 같은 문장에 농구 문맥이 있으면 target 증거로 accept할 수 있다. 보조 신호만 있거나 농구 문맥만 있으면 `ambiguous`다. known namesake의 팀·학교·U18/청소년 phrase·180/181cm·드래프트 지명처럼 더 구체적인 직접 신호가 있으면 보조 신호보다 우선해 reject하고, 목표팀/성인대표팀 직접 신호까지 함께 있으면 충돌로 `ambiguous`다. 모든 동적 숫자는 숫자 앞뒤 경계를 검사하므로 6과 16, 181과 1181, 26과 126을 같은 값으로 보지 않는다. 등번호는 숫자 뒤에 `번`이 붙어야 하므로 드래프트 `전체 N순위`를 등번호로 취급하지 않는다.

identity와 relevance는 분리한다. `classify.py`는 시즌별 소속·동명이인·종목 충돌을 판정하고, `relevance.py`는 선수가 기사의 직접 주제인지 판정한다. `국가대표`나 농구 문맥 자체는 relevance 근거가 아니다. 제목에 이름이 없으면 일반 대표팀 경기, 팀 승패, 감독·상대 인터뷰, 팝업, 중계, 시상식은 본문에 이름이 있어도 reject한다. U18·학교·비농구 등 기존 identity 차단은 relevance보다 우선한다.

학교 귀속 문법은 `숙명여고 이소희`, `이소희(숙명여고)`, `이소희[숙명여고]`처럼 이름 앞 소속과 이름 뒤 괄호·대괄호 표기를 제한적으로 지원한다. `knownNamesakes.eventIdentityPhrases`는 두 시즌의 `숙명여고`·`여고부` 고교대회 제목과 2026-27 드래프트·트라이아웃처럼 기간상 동명이인을 가리키는 이벤트에만 사용한다. 제목이 이벤트 문맥이거나 이름이 제목에 있고 문서에 이벤트 문맥이 있을 때 적용한다. 이름에 직접 귀속된 목표팀·성인 대표팀 문구·신장·나이·등번호 보조 신호는 이벤트보다 먼저 accept하므로, 고교대회 현장을 찾은 BNK 이소희처럼 명확한 목표 선수 기사를 보존한다. 반대로 문서 전체의 넓은 성인 대표팀 문맥과 이벤트가 충돌하면 더 구체적인 드래프트·고교 이벤트가 먼저 reject된다.

제목에 이름이 있으면 기본적으로 relevant지만 `롤 모델은 이소희`, `이소희를 롤 모델로`, 감독의 `이소희에게 기대·평가·조언`처럼 다른 사람이 주인공인 간접 언급은 reject한다. 제목 미표기 본문 기록은 팀 내 최다·커리어 하이·폭발·맹활약·분전·존재감·결승골·쐐기처럼 강한 qualifier가 이름과 기록의 같은 문장에 있어야 하며, 여러 선수의 괄호형 box score를 나열한 문장은 제외한다.

`allowBasketballDocumentFallback`, `target.allowTitleTeamContext`, `target.documentIdentityPhrases`, `target.titleDocumentIdentityPhrases`는 두 시즌 모두 비활성화하거나 빈 배열이다. 따라서 농구 문서, BNK 제목, 대표팀 문서라는 이유만으로 자동 accept되지 않는다.

제목 미표기 공식 명단은 제목과 본문 모두에 최종명단·최종엔트리·엔트리·발탁·소집명단 같은 정책 문구가 있어야 한다. 직접 인용은 같은 문장의 `이소희는/가 ... 말했다·밝혔다·전했다·강조했다` 형태만 허용한다. `분전했다`나 `관전했다` 속의 `전했다`를 발언으로 오인하지 않도록 한글 경계를 검사한다.

`ambiguous` 후보가 하나라도 있으면 안전한 검토가 끝나기 전 DB watermark가 앞으로 이동하지 않도록 해당 실행의 전체 submit을 차단한다. 검토 JSON에는 본문이나 전체 요약을 넣지 않고 source, 제목, URL, 게시 시각, 판정, 짧은 판정 근거만 기록한다.

2026-08-31 정책 정밀화 전 live review 기준은 Jumpball `accept=2, ambiguous=9, reject=9`, Rookie `accept=2, ambiguous=37, reject=1`이었다. 1차 정밀화 뒤 submit 없는 live review는 Jumpball `accept=4, ambiguous=6, reject=10`, Rookie `accept=12, ambiguous=25, reject=3`이었고, 2차 뒤에는 Jumpball `accept=7, ambiguous=0, reject=13`, Rookie `accept=23, ambiguous=8, reject=9`였다. 이번 3차 규칙은 Rookie에 남은 2025-26 안전 농구 문서와 2026-27 제목 대표팀 문맥을 기간 정책으로 보완한다. review JSON은 의도적으로 summary를 저장하지 않으므로 3차 변경 후 정확한 count는 기존 JSON만으로 재계산할 수 없다. 새 count가 필요하면 같은 page 범위의 **submit 없는** bounded dry-run을 다시 실행해야 하며, 이 구현 검증에서는 새 live crawl을 실행하지 않았다.

현재 기본 설정은 별도 구간 두 개다.

| 정책 ID | 적용일(양 끝 포함) | 설정 의미 |
| --- | --- | --- |
| `2025-26-bnk` | 2025-07-01 ~ 2026-06-30 | 해당 시즌 identity 신호만 사용. relevance 문서 fallback과 제목 팀 문맥은 비활성화 |
| `2026-27-bnk` | 2026-07-01 ~ 2027-06-30 | 삼성생명/숙명여고/U18·청소년/180·181cm/드래프트 identity 신호를 추가. relevance 문서 fallback과 대표팀 문맥은 비활성화 |

따라서 현재 DB watermark인 2026-01-23 이후 backfill은 2025-26 정책으로 시작해 2026-07-01부터 다음 정책으로 자동 전환된다. 2025-07-01 이전이나 2027-06-30 이후처럼 설정되지 않은 날짜는 의도적으로 `ambiguous`가 되어 submit을 차단한다.

### 시즌 시작·FA·해외 진출 시 정책 갱신

1. 이적 또는 새 소속의 **효력 시작일과 종료일을 공식 정보로 확인**한다.
2. 기존 정책을 덮어쓰지 않고 새 `id`의 기간 항목을 추가한다. 시즌 중 이적이면 이전 구간의 `effectiveTo`를 이적 전날로 끝내고 새 구간을 이적 당일부터 시작한다.
3. 새 구간의 `target.teamAliases`에 기사에서 실제 쓰는 새 국내/해외 팀 표기를 적는다. 이전 팀 alias는 새 구간에 자동 상속되지 않는다.
4. 그 구간에 사실이 확인된 `knownNamesakes`, `auxiliarySignals`, 종목 단어만 기록한다. 나이·등번호처럼 시점에 따라 바뀌는 값은 불확실하면 빈 배열로 둔다.
5. 기간 공백은 허용되지만 그 날짜 기사는 모두 `ambiguous`다. 기간 중복, 잘못된 날짜, 빈 목표팀은 validation 오류다.
6. fixture 테스트와 dry-run review를 먼저 확인한 후에만 별도로 승인된 `--submit`을 사용한다.

허용 기사 호스트는 코드에 다음과 같이 고정되어 있다.

| source | 허용 호스트 |
| --- | --- |
| `jumpball` | `jumpball.co.kr`, `www.jumpball.co.kr` |
| `rookie` | `rookie.co.kr`, `www.rookie.co.kr` |

현재 URL 정규화는 query parameter와 trailing slash를 그대로 둔다. 따라서 내용은 같아도 tracking query가 다른 URL은 별개로 취급될 수 있다. 이미지 URL은 scheme/host lowercase와 fragment 제거만 하며, 기사 URL과 같은 allowed-host 검사를 별도로 하지 않는다.

## 6. HTTP 안전장치

`BoundedHttpClient`는 다음 제한을 적용한다.

- HTTPS만 허용한다.
- adapter가 넘긴 고정 allowed host만 허용한다.
- redirect 목적지도 매 단계 같은 URL 정책으로 재검사한다.
- 네 번째 redirect까지 계속 redirect이면 `TooManyRedirects`로 실패한다. 즉 정상 응답에 도달할 수 있는 redirect는 최대 3회다.
- User-Agent: `SupersoheeArticleCrawler/1.0`
- timeout 허용 범위: 1~30초
- retry 허용 범위: 0~3회. 총 시도 횟수는 `retries + 1`이다.
- 요청 간 pace는 0초 이상이어야 한다.
- 재시도 사이에는 1초, 2초, 최대 4초의 지수 backoff를 사용한다.

pace는 기사 사이트의 최상위 GET 또는 Rookie 검색 form POST 시도 직전에 적용되며, 한 GET 시도 안에서 따라가는 각 redirect hop에는 별도로 적용되지 않는다. GET은 same-host redirect만 따라간다. 검색 form POST는 redirect를 따라가지 않고 안전하게 실패하며, redirect location이 있으면 허용 host인지 먼저 검사한다. 실제 구현은 timeout, connection error, redirect 초과와 `requests.HTTPError`를 재시도한다. `raise_for_status()`에서 발생한 HTTP 4xx와 5xx도 `HTTPError`이므로 현재 코드는 429/5xx뿐 아니라 다른 4xx도 설정 횟수만큼 재시도한다.

Spring backend 호출은 기사 사이트 client와 분리된다. `SpringArticleClient`가 공개 `GET /api/articles/{source}?page=0&limit=1`에서 watermark를 읽고, `SpringImportClient`가 승인된 경우에만 import POST를 수행한다. 공개 API는 `source`, `page`, `limit`을 validation하고, 응답 DTO의 `publishedAt`과 `crawledAt`을 서울 시각의 명시적 ISO offset(`+09:00`) 문자열로 반환한다. GET과 POST 모두 redirect를 허용하지 않는다. import POST의 자동 retry는 없지만, 최대 200개 batch 분할은 구현되어 있다.

## 7. CLI 사용법

아래 명령은 `admin/` 디렉터리에서 실행하는 기준이다.

```bash
python3 -m crawlers.supersohee_crawlers.cli --help
```

| 옵션 | 기본값 | 실제 제약/동작 |
| --- | --- | --- |
| `--source` | `all` | `jumpball`, `rookie`, `all` 중 하나 |
| `--keyword` | `이소희` | 정책 `playerName`과 정확히 같아야 하며, 다르면 외부 요청 전에 종료 |
| `--max-pages` | `2` | 소스별 1~10페이지 |
| `--timeout` | `10` | GET과 import POST의 요청 timeout, 1~30초 |
| `--retries` | `2` | 기사 사이트 GET과 Rookie 검색 form POST 재시도 0~3회. import POST에는 적용되지 않음 |
| `--pace-seconds` | `1` | 기사 사이트 요청 간 최소 간격, 0 이상 |
| `--review-output` | 자동 생성 | `/private/tmp` 아래의 절대 `.json` 경로만 허용. 생략하면 timestamp 파일 생성 |
| `--identity-policy` | 기본 정책 JSON | 기간별 선수 식별 정책 경로. JSON은 외부 요청 전에 validation |
| `--submit` | 꺼짐 | 켜면 정규화 결과를 Spring에 전송 |

백엔드 전송 없는 라이브 수집 예시는 다음과 같다. 이 명령은 기사 사이트에 실제 접속한다.

```bash
SUPERSOHEE_BACKEND_URL=http://localhost:8080 \
python3 -m crawlers.supersohee_crawlers.cli \
  --source all \
  --keyword 이소희 \
  --max-pages 2 \
  --timeout 10 \
  --retries 2 \
  --pace-seconds 1
```

이 명령도 DB watermark를 읽어야 하므로 `SUPERSOHEE_BACKEND_URL`이 필요하다. 정상 종료 시 소스별 경계·판정 집계, 기사별 제목/URL/날짜/판정 근거와 검토 JSON 경로를 출력한다.

```text
source=jumpball watermark=... pages=... boundary_reached=true accepted=... ambiguous=... rejected=...
review source=jumpball decision=accept publishedAt=... title='...' url=... reason=...
review_output=/private/tmp/supersohee-crawler-review-....json
```

모든 실행 전에 backend URL을 준비하고, `--submit` 실행에만 import key도 준비한다. `--submit`이면 import key와 client를 backend/기사 사이트 GET보다 먼저 검증한다. 값은 이 문서, 저장소, 브라우저 코드, 터미널 기록에 남기지 않는다.

| 환경변수 | 사용 위치 | 조건 |
| --- | --- | --- |
| `SUPERSOHEE_BACKEND_URL` | watermark GET과 import client | 모든 실행에 필요. HTTP(S) backend base URL. plain HTTP는 `localhost`, `127.0.0.1`, `::1`만 허용 |
| `SUPERSOHEE_ARTICLE_IMPORT_KEY` | Python client와 Spring backend | UTF-8 기준 최소 32 bytes, 양쪽 값이 같아야 함 |

환경변수가 이미 안전하게 주입된 실행 환경에서만 다음을 실행한다.

```bash
python3 -m crawlers.supersohee_crawlers.cli \
  --source all \
  --max-pages 2 \
  --submit
```

성공한 import는 소스별 aggregate를 출력한다.

```text
source=jumpball processed=<처리 요청 수> created=<신규 저장 수> existing=<기존 기사 수> batches=<batch 수>
```

## 8. 증분 watermark와 submit 차단 규칙

1. 각 소스 실행 전에 공개 `GET /api/articles/{source}?page=0&limit=1`로 DB 최신 `publishedAt`을 읽는다. backend는 지원 source와 `page`, `limit`을 validation하고 공개 DTO의 시각을 명시적 `+09:00` offset 문자열로 반환한다. 관리자 JWT나 import key는 이 GET에 보내지 않는다.
2. watermark의 offset을 서울 시각으로 변환하고 source 정밀도로 내린다. 기존 watermark가 있으면 검색 결과를 최신 페이지부터 읽는다. 같은 시각 기사가 다음 페이지에 걸칠 수 있으므로 `publishedAt == watermark`를 처음 봤다고 즉시 멈추지 않고, 더 오래된 `publishedAt < watermark`를 보거나 equality를 포함한 검색 결과 끝까지 읽어야 경계 완료로 인정한다.
3. 명시적 마지막/비활성 다음/정상 인식된 빈 목록으로 terminal을 증명하지 못하거나 `--max-pages`에 걸리면 submit을 차단한다. pagination markup 없음, window의 최대 숫자, page2 selector drift는 끝으로 인정하지 않는다.
4. 날짜가 하나라도 없거나 검색 결과 날짜가 최신순이 아니면 submit을 차단한다.
5. 후보에는 `publishedAt >= watermark`를 사용해 경계 시각을 의도적으로 겹친다. URL idempotency가 이미 저장된 경계 기사를 제거한다.
6. 기사 날짜에 맞는 선수 식별 정책이 없거나 동명이인 `ambiguous` 후보가 있으면 submit을 차단한다. 정책 기간 중복은 실행 시작 단계에서 설정 오류로 종료한다.
7. 모든 소스를 먼저 수집·검증한 다음에만 전송을 시작한다. 소스별 accepted 후보는 오래된 것부터 최대 200개 batch로 전송한다.

예를 들어 DB 최신 기사가 2026-01-23이라면 “최근 12개월”을 계산하지 않고 그 소스의 실제 `publishedAt`을 기준으로 삼는다. 기본 정책은 이 날짜를 포함하는 2025-26 구간과 이어지는 2026-27 구간을 각각 선택한다. 10페이지 안에 2026-01-23 경계가 나오지 않으면 `--max-pages`를 검토해 다시 dry-run해야 하며, 그 상태로는 `--submit`이 동작하지 않는다.

## 9. Spring import 계약과 idempotency

- method/path: `POST /api/admin/articles/import`
- 인증 header: `X-Article-Import-Key`
- payload: `{"articles": [AdminArticleImportItem, ...]}`
- source: lowercase `jumpball` 또는 `rookie`만 허용
- 성공 응답: `{processed, created, existing}`
- 일반 관리자 JWT나 브라우저의 HttpOnly 관리자 cookie로 호출하는 endpoint가 아니다. 유효한 import key가 반드시 필요하다.

백엔드는 각 기사를 `(source, url)` query로 MongoDB atomic upsert한다. 신규 문서에만 필드를 쓰는 `setOnInsert`를 사용하며, Mongo 결과의 `upsertedId`가 있으면 `created`, 없으면 `existing`으로 집계한다. 따라서 같은 batch나 같은 실행의 재전송 및 동시에 들어온 동일 identity 요청이 별도 사전 조회 없이도 idempotent하다.

이 원자성을 뒷받침하는 unique compound index는 Article 전용 startup initializer가 생성한 뒤 이름, `unique`, `source/url` key와 partial filter를 검증한다. 이는 Spring Data의 전역 auto-index를 켜는 구현이 아니다. 필요한 Article index를 생성하거나 검증할 수 없으면 backend는 원인을 외부에 노출하지 않는 안전한 오류로 **의도적으로 기동 실패**한다.

Python의 실행 내 dedupe 기준은 URL 단독이고, 백엔드의 영속 dedupe 기준은 `(source, url)`이다. 이 차이는 현재 두 소스가 서로 다른 도메인을 사용하므로 일반적인 실행에서는 충돌하지 않는다.

### 실패와 부분 성공

- DTO validation은 저장 전에 요청 전체에 적용된다. 잘못된 source, 빈 필수값, 길이 초과, 빈 articles, 200개 초과는 400 validation 실패가 된다.
- import key가 없거나 틀리면 401이다.
- `SpringImportClient`는 non-2xx에서 예외를 발생시키며 자동 retry하지 않는다.
- 각 기사 upsert는 MongoDB에서 원자적이지만 요청 전체를 묶는 batch transaction은 사용하지 않는다. 중간의 비-중복 DB 오류로 5xx가 발생하면 앞에서 upsert된 일부 기사는 남을 수 있다.
- 실패 응답에는 몇 번째 기사까지 저장됐는지 알려 주는 별도 partial-success DTO가 **미구현**이다.
- 같은 payload를 다시 보내면 앞에서 저장된 항목은 `existing`이 되므로 idempotency를 이용해 복구할 수 있다. 오래된 batch부터 보내므로 다음 실행의 source watermark가 완료 지점부터 이어진다. 그래도 먼저 오류 원인은 확인해야 한다.
- accepted 후보가 0개이면 import POST를 호출하지 않고 0 집계로 종료한다.

### 로그 정책

현재 CLI는 source별 watermark/페이지/판정 집계와 기사 제목·URL·날짜·판정 근거를 표준 출력하고 같은 정보를 `/private/tmp` JSON에 기록한다. 기사 본문, 목록 요약, import key, request header는 출력하거나 JSON에 저장하지 않는다. HTTP/validation 오류의 구조화 JSON 로그와 실행 ID는 **미구현**이다.

### 주 1회 GitHub Actions 자동 실행

`sofanpage` 저장소의 기본 `main` 브랜치에는 `.github/workflows/supersohee-weekly-crawler.yml`을 둔다. 예약 workflow는 매주 월요일 09:10 KST(월요일 00:10 UTC)에 실행되며, 같은 저장소의 `admin` 브랜치를 체크아웃해 이 크롤러를 사용한다. `workflow_dispatch`로 수동 실행할 수도 있다.

저장소 Actions secrets에는 다음 두 값을 설정한다.

- `SUPERSOHEE_BACKEND_URL`: 최신 import API가 배포된 HTTPS origin
- `SUPERSOHEE_ARTICLE_IMPORT_KEY`: 배포 백엔드의 동명 환경변수와 동일한 32-byte 이상 비밀값

workflow는 전체 크롤러 테스트를 먼저 통과한 뒤 `--source all --max-pages 10 --pace-seconds 1 --submit`을 실행한다. 동시 실행은 하나로 제한하며, 경계 미도달·날짜 누락·ambiguous가 하나라도 있으면 CLI가 제출을 차단하고 workflow가 실패한다. 제목·URL·판정 근거만 포함한 review JSON은 14일 동안 Actions artifact로 보관한다.

## 10. 관리자 UI의 수동 기사와 크롤러 기사

두 종류의 기사는 같은 관리자 기사 목록에 함께 나타나며 `source` badge로 구분한다.

| 구분 | 생성 경로 | 인증 | 저장 source | 주요 차이 |
| --- | --- | --- | --- | --- |
| 수동 기사 | 브라우저 `POST /api/admin/articles` BFF → Spring | HttpOnly 관리자 session/Bearer | `manual` | 입력한 `content`가 `summary`로 저장되고 URL은 null, 현재 시각 사용 |
| 크롤러 기사 | Python → Spring `POST /api/admin/articles/import` | `X-Article-Import-Key` | `jumpball`/`rookie` | 원문 URL·목록 요약과 제한된 상세 keyword 문맥·이미지·원문 게시 시각 포함 |

관리자 UI는 목록에서 source, title, summary, publishedAt을 보여 준다. 크롤러 실행 버튼, crawler 상태, import 오류 내역은 UI에 **미구현**이다.

## 11. 네트워크 없이 검증하기

실사이트 HTML 변경이나 운영 DB를 건드리지 않고 다음 fixture 테스트만 실행한다.

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s crawlers/tests -v
```

이 테스트는 다음을 검증한다.

- Jumpball 실사이트 축약 fixture에서 제목+내용 검색의 전체 목록 후보, 상세 날짜·`#viewConts` 본문, `.pageindex`와 zero-based `pagenum` 파싱
- Rookie 실사이트 축약 fixture에서 POST 검색 context, 최초 응답의 동적 `total`을 사용한 page2 form POST, 후속 응답 identity, 날짜, `.pagination-end` last page와 상세 본문 파싱
- 목록 snippet에는 이름이 없고 상세 본문에만 이름이 있는 정상 후보의 summary 보강
- Rookie 전체기사 `page=5152` 응답과 후속 page identity drift의 실행 전 fail-closed
- 제목 공백 정리, fragment 제거, keyword/host 필터, URL dedupe
- timeout/retry 범위와 허용하지 않은 host의 요청 전 차단
- `requests.post` mock을 이용한 import header와 payload
- 공개 source API watermark parsing, `Z`/offset의 서울 시각 변환, source 정밀도 floor와 import key 미전송
- watermark 경계 overlap, max-pages 미도달 submit 차단, 날짜/정렬 안전 검사
- 200개 batch 분할과 oldest-first 순서
- 게시일별 정책 선택, 시즌 경계, 정책 없는 날짜의 submit 차단, FA/해외 이적 target 변경
- 기간 중복·필수 설정 validation, identity/relevance 분리, 제목의 직접 이름, 최종 명단·직접 발언·강한 개인 기록, 롤모델·팀 경기·시상식·팝업·중계 제외, U18/청소년 동명이인 우선순위, 숫자 substring 방지
- submit key와 keyword-policy 일치의 외부 요청 전 preflight
- `/private/tmp` 검토 JSON에 제목·URL·날짜·판정만 포함되는지

현재 admin fixture/mock 테스트는 **56개**다. backend 전체 테스트는 **105개**이며, Article 전용 startup unique index의 생성·검증·fail-closed, `(source,url)` atomic upsert와 `upsertedId` 집계, 공개 source DTO의 `+09:00` 계약, import 200건 성공/201건 validation 실패를 포함한다.

테스트는 기사 사이트에 접속하지 않는다. import POST도 mock이므로 Spring 또는 MongoDB에 데이터를 쓰지 않는다. 반면 CLI를 직접 실행하면 `--submit`이 없어도 기사 사이트에는 접속하므로 parser 검증 용도로 CLI를 사용하지 않는다.

기존 저장 기사를 신규 규칙으로 읽기 전용 재분류할 때는 full summary가 포함된 JSON/EJSON 백업만 입력으로 사용한다. 기존 review JSON은 summary가 없으므로 cleanup 근거가 아니며 도구가 fail-closed한다.

```bash
python3 -m crawlers.supersohee_crawlers.cleanup_audit \
  --input /private/tmp/<full-backup>.json \
  --output /private/tmp/<cleanup-audit>.json
```

입·출력은 `/private/tmp`의 절대 경로만 허용한다. 출력은 summary를 복제하지 않고 `KEEP`, `DELETE_CANDIDATE`, `MANUAL_REVIEW`와 근거만 기록하며 `mutationPerformed=false`다. 이 결과는 삭제 명령이 아니며, 실제 DB 정리는 별도 사람 검토와 승인 후에만 한다.

현재 fixture 테스트에 포함되지 않은 항목도 있다.

- 실제 redirect chain과 HTTP retry/backoff 시간: **미검증**
- CLI argument parser 자체: **미검증**
- 실사이트 최신 DOM과 selector 호환성: fixture로는 **미검증**
- Spring과의 실제 통합 smoke: 운영 데이터 보호를 위해 기본 검증에서 **미실행**

## 12. 운영 전 체크리스트

- [ ] `admin/`에서 필요한 Python 의존성이 격리된 가상환경에 설치되어 있다.
- [ ] Jumpball/Rookie의 이용 정책과 robots 정책을 운영자가 확인했다.
- [ ] 먼저 fixture 테스트를 통과했다.
- [ ] 소스별 selector를 실사이트 변경 내역과 비교했다.
- [ ] 정책 JSON이 watermark부터 최신 후보 날짜까지 끊김 없이 포괄하며 기간이 겹치지 않는다.
- [ ] 시즌 시작·FA·해외 진출이 있었다면 공식 효력일로 새 정책 구간과 팀 alias를 추가했다.
- [ ] `--max-pages`, `--timeout`, `--retries`, `--pace-seconds`를 작은 값부터 검토했다.
- [ ] 전송 없는 실행에서 source별 watermark와 `boundary_reached=true`를 확인했다.
- [ ] `/private/tmp` review JSON의 모든 `ambiguous` 제목·URL·판정 근거를 사람이 검토했다.
- [ ] `missingDates=0`, `chronologyValid=true`, `safeToSubmit=true`를 확인했다.
- [ ] 후보가 200개를 넘으면 oldest-first batch 수와 중간 실패 복구 방식을 확인했다.
- [ ] `SUPERSOHEE_BACKEND_URL`이 의도한 backend를 가리킨다.
- [ ] `SUPERSOHEE_ARTICLE_IMPORT_KEY`가 양쪽에 안전하게 주입되었고 최소 32 bytes다.
- [ ] key가 브라우저의 `NEXT_PUBLIC_*`, 저장소, 명령행 인자, 로그에 들어가지 않았다.
- [ ] 백엔드가 기동했고 import endpoint가 redirect되지 않는다.
- [ ] 운영 MongoDB에서 실제 `articles.getIndexes()`를 조회해 `article_source_url_unique`의 `source/url`, `unique`, partial filter가 backend 기대와 일치하는지 확인했다.
- [ ] 운영 `articles`에 `(source,url)` 중복 문서가 없는지 배포 전에 별도로 검사했다. 중복이 있으면 initializer가 index를 보장할 수 없어 backend startup이 의도적으로 실패하므로, 데이터를 임의 삭제하지 말고 정리 계획을 먼저 승인받는다.
- [ ] 첫 운영 실행은 source 하나와 1페이지로 제한해 결과를 검토한다.
- [ ] 재실행 시 `created`가 감소하고 `existing`이 증가하는지 확인한다.

## 13. 흔한 오류와 대응

| 증상 | 코드 기준 원인 | 확인/대응 |
| --- | --- | --- |
| 401 `ADMIN_AUTHENTICATION_REQUIRED` | import key 누락 또는 불일치. 관리자 JWT만 보낸 경우도 해당 | 양쪽의 `SUPERSOHEE_ARTICLE_IMPORT_KEY` 주입 여부와 32-byte 조건 확인. 값을 출력하지 말 것 |
| 400 validation 실패 | source 대문자/미지원 값, 필수값 누락, 길이 초과, 날짜 누락, 빈 batch, 200개 초과 | normalized payload의 필드와 개수 확인. source는 `jumpball`/`rookie` lowercase만 사용 |
| `URL host is not allowed` | HTTPS가 아니거나 source adapter의 고정 host 밖 URL/redirect | 요청 URL과 redirect 목적지의 scheme/host 확인. CLI allowed-host 확장 옵션은 없음 |
| `request failed after ... attempts` | timeout, 연결 오류, HTTP 4xx/5xx, redirect 초과 | 사이트 상태와 DOM 이전에 HTTP status 확인. retry를 무작정 늘리지 말고 pace와 정책 검토 |
| `boundary_reached=false` | max-pages 안에 DB watermark 또는 검색 결과 끝이 나오지 않음 | submit은 자동 차단된다. review 결과와 페이지 수를 확인한 뒤 max-pages 범위 내에서 다시 dry-run |
| `invalid identity policy` | JSON/date/필수 필드 오류 또는 정책 기간 중복 | 외부 요청 전에 종료된다. 겹치는 양 끝 날짜와 빈 팀 alias를 수정하고 fixture 테스트 |
| `ambiguous` + 정책 없음 | 기사 게시일을 포괄하는 기간 정책이 없음 | 사실 확인 후 해당 기간 정책을 추가하기 전 자동 submit 금지 |
| `ambiguous` | 이름은 맞지만 정책상 목표 소속을 확인할 수 없거나, 양 팀 귀속이 불명확하거나, 농구·비농구 종목 신호가 충돌 | 자동 submit 금지. 제목·URL·정책 ID·근거를 사람이 확인 |
| `--keyword must exactly match...` | CLI keyword와 정책 `playerName` 불일치 | 정책 선수명을 사용한다. 다른 인물을 수집하려면 별도 검증된 정책이 필요 |
| accepted/review가 0 | selector 변화, 날짜 파싱 실패, URL/host/entity 필터 탈락 | source 집계와 fixture, 최근 HTML 구조를 비교하되 바로 submit하지 말 것 |
| Rookie가 `page=5152` 또는 전체기사 수를 표시 | 최초 form POST가 아닌 GET 검색으로 이탈했거나 Session이 유지되지 않음 | 최초 응답의 keyword context와 동적 `total`/last page를 확인한다. `total=1232` 같은 관측값을 코드에 하드코딩하지 말고 서버 href와 Session 계약을 확인 |
| Rookie 후속 페이지에서 identity 변경 오류 | 후속 요청을 GET으로 보냈거나, POST의 동적 `total`/page/search form 값이 잘못됐거나, 응답 identity가 바뀜 | 같은 Session의 form POST인지, `total`을 최초 응답에서 읽었는지, 응답의 current page/last page가 맞는지 확인 |
| 제목은 보이지만 날짜가 없어 탈락 | Jumpball 상세 날짜 또는 Rookie byline selector/format 변화 | `parse_jumpball_published_at`, `parse_rookie_listing`과 새 fixture를 함께 갱신해야 함 |
| `article body could not be parsed` | 상세 본문 selector가 변경됐거나 검색 결과가 기사 이외 URL을 가리킴 | 실HTML에서 Jumpball `#viewConts`, Rookie `#article-view-content-div.article-veiw-body`를 확인하고 최소 fixture와 parser를 함께 갱신 |
| 동일 기사인데 계속 신규 생성 | query/trailing slash 차이로 canonical URL이 달라짐 | 저장된 URL과 정규화 URL 비교. tracking parameter 제거는 현재 미구현 |
| 일부 저장 후 5xx | batch가 transaction이 아니며 중간 DB 오류 가능 | 백엔드 오류를 먼저 수정한 뒤 같은 payload 재전송. 기존 항목은 `(source,url)`로 `existing` 처리 |
| backend startup 실패 | Article 전용 unique index 생성·검증 실패. 운영 DB에 `(source,url)` 중복이 있거나 기존 index 정의가 기대와 다를 수 있음 | 실제 `articles.getIndexes()`와 duplicate 집계를 확인. fail-closed를 우회하지 말고 데이터·index 정리 절차를 승인받을 것 |
| import endpoint redirect 오류 | backend base URL/proxy가 `/api/admin/articles/import`를 다른 주소로 redirect | `SUPERSOHEE_BACKEND_URL`과 reverse proxy path를 확인. client는 redirect를 따라가지 않음 |

## 14. 레거시 Flask 대비 이관 내용

읽기 근거는 레거시의 `routes/newsjump_routes.py`와 `routes/newsrookie_routes.py`다.

이관한 핵심은 다음과 같다.

- Jumpball/Rookie 검색 URL과 검색 parameter
- 두 사이트의 목록 selector와 날짜 형식
- 제목+내용 검색 결과 전체를 유지한 뒤 상세 keyword 문맥으로 정규화하는 필터
- Rookie의 레거시 동명이인 문구를 기간 정책 `identityPhrases`로 이관
- title, link, summary, image, created time 필드 의미
- URL 기반 중복 방지 의도

대신 실행·저장 구조는 다음과 같이 바뀌었다.

| 레거시 | 현재 |
| --- | --- |
| Flask route가 크롤링을 시작 | 독립 Python CLI가 명시적으로 실행 |
| crawler가 `news_jumpball`, `news_rookie`, `crawl_info` Mongo collection에 직접 접근 | crawler는 MongoDB를 모르며 Spring import API만 호출 |
| source마다 DB write/update 로직 중복 | 공통 `NormalizedArticle` DTO와 하나의 import client 사용 |
| 마지막 crawl 날짜, 최신 DB 날짜, 고정 cutoff로 증분 제어 | Spring 공개 source API의 최신 DB watermark까지 경계 overlap 수집 후 `(source,url)` idempotency 적용 |
| 요청/redirect host 제한이 일관되지 않음 | 공통 HTTPS + allowed-host 정책 적용 |
| Flask 프로세스, app config, PyMongo에 결합 | `requests`와 BeautifulSoup만 사용하는 CLI 패키지 |
| 개별 기사 추가·삭제·복구 같은 Jumpball 전용 route 포함 | 해당 관리 기능은 현재 crawler에서 미구현 |

Flask와 Mongo 직접 쓰기를 제거한 이유는 crawler가 인증·validation·중복 index를 우회하지 않게 하고, 저장 계약과 오류 응답을 Spring 한 곳에서 관리하기 위해서다. 현재 Python 패키지에는 Flask app, Mongo client, legacy DB credential, `venv`, `__pycache__`를 복사하지 않았다.

## 15. 변경 시 원칙

- selector 변경은 반드시 재현 HTML fixture와 parser test를 함께 추가한다.
- 새로운 source는 adapter, parser, `SOURCE_HOSTS`, Spring DTO source validation을 동시에 맞춘다.
- import key를 browser bundle이나 `NEXT_PUBLIC_*` 환경변수로 옮기지 않는다.
- parser가 DB나 Flask를 직접 호출하도록 되돌리지 않는다.
- 운영 데이터를 대상으로 parser를 디버깅하지 않는다. fixture → mock import → 승인된 소규모 smoke 순서를 지킨다.
- retry, pacing, max page, redirect, allowed host의 상한을 제거하지 않는다.

여전히 미해결인 운영 기능은 URL query/trailing-slash canonicalization, 사람이 검토한 항목의 승인 receipt, batch 부분 실패의 구조화된 resume/receipt workflow다. Article atomic upsert와 unique index가 이 기능들을 대신한다고 간주하지 않는다.
