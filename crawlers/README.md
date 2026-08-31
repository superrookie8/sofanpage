# Supersohee article crawler

기존 Flask 크롤러의 Jumpball/Rookie 기사 수집 기능만 CLI로 옮긴 코드입니다. MongoDB나 Flask에 직접 연결하지 않으며, 정규화된 기사만 Spring의 `POST /api/admin/articles/import`로 전송합니다.

기본 실행은 Spring 공개 source API의 최신 `publishedAt` watermark 이후 기사만 검토하는 dry-run입니다. 공개 API는 source/page/limit을 validation하고 시각을 명시적 서울 offset(`+09:00`) DTO로 반환합니다. 경계 시각은 같은 시각을 포함해 다시 수집하고 URL idempotency로 중복을 제거합니다. 결과는 화면과 `/private/tmp` review JSON에 남으며 backend import는 호출하지 않습니다.

watermark의 `Z`/offset은 서울 시각으로 변환한 뒤 Jumpball은 초, Rookie는 분 단위로 맞춥니다. pagination은 명시적 마지막/비활성 다음/정상 빈 목록만 종료로 인정하며 markup 없음이나 window의 최대 숫자만으로 완료 처리하지 않습니다.

Jumpball은 제목+내용(`sfld=all`)의 최근 12개월 검색을 사용하고, 화면 page와 zero-based `pagenum`을 구분합니다. Rookie는 최초 검색 form POST로 만든 `requests.Session`을 유지하며 후속 페이지도 form POST로 요청합니다. 후속 payload에는 다음 page, 최초 응답에서 파싱한 동적 `total`, `sc_area=A`, `sc_word`, `view_type=sm`을 넣고 `box_idxno`는 빈 값으로 보냅니다. `total`은 하드코딩하지 않으며 최초 결과의 `total`/마지막 page와 각 후속 응답이 다르거나 현재 page가 확인되지 않으면 실패합니다. 이렇게 해야 GET pagination이 검색 상태를 잃고 첫 페이지 또는 전체기사 `page=5152`로 돌아가는 문제를 막을 수 있습니다.

제목+내용 검색은 목록 snippet에 `이소희`가 없을 수도 있으므로 두 소스 모두 목록의 모든 기사를 후보로 유지하고 각 상세 페이지를 요청합니다. Jumpball은 `#viewConts`, Rookie는 `#article-view-content-div.article-veiw-body` 본문을 메모리에서 검사합니다. 정규화 summary에는 목록 요약과 키워드 앞뒤 최대 600자 문맥만 합치며 전체 길이는 4,000자로 제한합니다. 본문 selector를 확인할 수 없으면 저장 후보를 조용히 버리지 않고 실행을 실패시킵니다.

```bash
SUPERSOHEE_BACKEND_URL=http://localhost:8080 \
python3 -m crawlers.supersohee_crawlers.cli --source all --max-pages 2
```

`max-pages` 안에 기존 watermark까지 도달하지 못하거나 날짜 파싱/정렬 문제가 있거나 동명이인 `ambiguous` 후보가 있으면 submit은 차단됩니다. 소속과 동명이인 값은 코드가 아니라 `config/player_identity_policies.json`의 기간별 정책에 있습니다. classifier는 identity와 relevance를 분리해 제목의 직접 이름, 최종 명단, 직접 발언, 강한 개인 기록처럼 선수에게 직접 발생한 소식만 accept합니다. 일반 팀 경기·대표팀 경기·시상식·팝업·중계와 롤모델 간접 언급은 제외하며, U18·청소년·학교·신장·드래프트 등 known namesake 직접 신호가 우선합니다. 정책이 없는 날짜는 review 대상으로 남고, 기간이 겹치는 설정은 외부 요청 전에 실패합니다.

기본 설정은 2025-26과 2026-27을 별도 구간으로 두어 2026-01-23 이후 backfill의 시즌 경계를 포괄합니다. 새 시즌, FA 이적, 해외 진출 때는 기존 기록을 바꾸지 말고 공식 효력일로 새 구간과 새 팀 alias를 추가해야 합니다. 날짜에 따라 불확실한 나이·등번호는 해당 구간의 보조 신호에서 제외합니다.

동명이인 식별 문구는 parser에서 숨기지 않고 정책 `identityPhrases`를 거쳐 review에 reject 근거를 남깁니다. 비농구 단어가 단순히 이름 근처에 있는 경우는 reject하지 않고 ambiguous로 보냅니다.

실제 전송에는 서버 전용 환경 변수가 필요합니다. import key는 32바이트 이상으로 만들고, 값은 브라우저 번들이나 저장소에 넣지 않습니다.

```bash
SUPERSOHEE_BACKEND_URL=http://localhost:8080 \
SUPERSOHEE_ARTICLE_IMPORT_KEY=... \
python3 -m crawlers.supersohee_crawlers.cli --source all --max-pages 2 --submit
```

전송은 소스별 오래된 기사부터 최대 200개 batch로 처리합니다. 실행 전에 반드시 dry-run review JSON의 제목·URL·날짜·판정 근거와 `safeToSubmit`을 확인합니다.

backend는 각 기사를 `(source,url)`로 MongoDB atomic upsert하고 `upsertedId` 유무로 `created`/`existing`을 집계합니다. 필요한 unique compound index는 Article 전용 startup initializer가 생성하고 검증하며, 전역 auto-index를 켜는 방식이 아닙니다. 운영 배포 전 실제 `articles.getIndexes()`와 기존 `(source,url)` duplicate를 반드시 확인해야 합니다. duplicate나 잘못된 index가 있으면 backend startup이 의도적으로 실패합니다.

테스트는 실사이트 대신 `tests/fixtures/` HTML만 사용합니다.

```bash
python3 -m unittest discover -s crawlers/tests -v
```

현재 검증 기준은 admin 56개, backend 전체 105개 테스트입니다. admin fixture에는 실제 검색 DOM을 축약한 source parser 계약과 identity/relevance 분리, 이름 직접 제목, 공식 명단·직접 발언·강한 개인기록, 롤모델·감독·팀 경기·시상식·팝업·중계 제외, 다인 box-score 제외, full-summary cleanup audit fail-closed가 포함됩니다. backend 테스트에는 public source 200 응답/`+09:00` DTO, import 200건 성공·201건 validation 실패, Article index fail-closed와 atomic upsert 집계가 포함됩니다.

URL query/trailing-slash canonicalization, 사람 검토 승인 receipt, batch 부분 실패의 구조화된 resume workflow는 아직 미구현입니다.
