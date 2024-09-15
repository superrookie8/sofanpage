
# supersohee.com

**supersohee.com**은 농구 선수의 팬사이트로 기획되었으며, 팬들이 경기 직관일지를 기록하고 방명록을 남기는 등 다양한 커뮤니티 활동을 할 수 있는 공간입니다.


## 프로젝트 개요
팬페이지 "슈퍼소히" 는 팬들이 농구 선수 이소희의 기본 정보, 사진, 스탯을 확인할 수 있는 페이지를 비롯하여, 점프볼과 루키에서 크롤링한 관련 기사를 정리한 뉴스 페이지, 이벤트 활동 기록 페이지, 간단한 게임을 즐길 수 있는 아케이드 페이지, 경기 스케줄을 확인할 수 있는 스케줄 페이지, 방명록, 직관일지 작성 기능을 제공합니다. 회원가입 후 로그인을 하면 마이페이지를 통해 개인 맞춤형 기능을 사용할 수 있으며, 이를 통해 팬 활동을 더욱 즐겁게 할 수 있도록 다양한 요소를 확장해 나가는 프로젝트입니다.

## 사용한 기술과 이유
1. Next14 - React의 기능도 모두 쓸 수 있고, AppRouter 방식을 통해 효율적으로 page와 api를 관리하기 위해서 사용했습니다. 
2. framer-motion - 페이지 전환시 매끄럽게 넘어가는 표현이 가능하고 React와 호환이 좋은 라이브러리라 사용했습니다.
3. TailwindCSS - 유틸리티 기반 스타일링이 가능해서 필요한 요소에 직접 스타일을 가미할 수 있고, 모바일 처리도 용이하게 하며 커스터마이징이 자유로워서 사용했습니다.
4. cloudType - 빠른 배포와 관리를 위해 사용했습니다. 이미지 로딩 이슈로 다른 배포루트도 고려중입니다.
5. Unity - javascript만으로 만든 가벼운 게임의 게임성이 좋지 않아서, 사용했습니다. 

## 주요 기능
- **홈 페이지**: 프로필, 스탯, 사진
- **뉴스 페이지**: 점프볼, 루키에서 크롤링한 관련 기사들
- **이벤트 페이지**: 이벤트 활동 기록 열람
- **아케이드 페이지**: 간단한 게임 (자바스크립트, 유니티로 만든 캐주얼 게임)
- **스케줄 페이지**: 달력에 표기된 팀 경기스케줄과 그에 따라 연동된 경기장 지도와 찾아가는 교통편 정보제공
- **방명록 섹션** : 사진방명록, 글 방명록을 열람가능하고, 작성할 수 있는 섹션
- **직관일지 섹션** : 직관간 기록을 남기고 내기록, 전체기록을 확인할수 있는 섹션
- **마이페이지** : 유저프로필 관리(수정), 내가 쓴 방명록 관리(삭제)
- **로그인/회원가입**: 최소한의 정보(nickname, password)를 제공받아 회원가입 가능, 로그인 후 방명록 및 직관일지 작성 가능 (추후 이메일 정보 추가 예정)


## 스크린샷
웹뷰 web view

|1.홈 페이지|
|--------|
|<img src="https://github.com/user-attachments/assets/cc6088ca-c123-4c3c-a15d-a7888d8b8dbb" width="480" height="270" alt="홈페이지">|
|2.뉴스 페이지|
|<img src="https://github.com/user-attachments/assets/37e7ceb8-edc5-4400-8d46-39574eee9b9c" width="480" height="270" alt="뉴스페이지">|
|3.이벤트 페이지|
|<img src="https://github.com/user-attachments/assets/571d4455-06af-4113-ba68-75caa2699715" width="480" height="270" alt="이벤트페이지">|
|4.아케이드 페이지|
|<img src="https://github.com/user-attachments/assets/aaa39976-4c32-44f4-80c0-b3ec53afe142" width="480" height="270" alt="아케이드페이지">|
|5.방명록 페이지|
|<img src="https://github.com/user-attachments/assets/8b157780-76dc-4383-9dfb-7c9b29fca7f8" width="480" height="270" alt="방명록페이지">|
|6.직관일지 페이지|
|<img src="https://github.com/user-attachments/assets/848f0f28-85d7-4990-a3ef-60c275d5de44" width="480" height="270" alt="직관일지페이지">|


모바일뷰 mobile view


|1. 로그인 페이지|2. 홈페이지|
|-----------------|------------------|
  |<img src="https://github.com/user-attachments/assets/46c2bcbf-f662-4ca8-bc2c-293a0f331a65" width="400" height="700" alt="로그인">|<img src="https://github.com/user-attachments/assets/a9a6a527-7e7d-4bd2-95f1-e6c44d6fbf38" width="400" height="700" alt="홈 페이지">|
|3.뉴스 페이지|4.이벤트 페이지|
  |<img src="https://github.com/user-attachments/assets/2e433200-9f21-4e06-abb4-882126f0442c" width="400" height="700" alt="뉴스 페이지">|<img src="https://github.com/user-attachments/assets/6c1fe491-dc0e-4ffe-a73d-03afb48cb28b" width="400" height="700" alt="이벤트 페이지">|
|5.아케이드1|6.아케이드2|  
  |<img src="https://github.com/user-attachments/assets/90fcac7d-32ea-4ff8-a019-82f69d595669" width="400" height="700" alt="아케이드1">|<img src="https://github.com/user-attachments/assets/41648489-c2ec-4864-acf5-2f340e151d2e" width="400" height="700" alt="아케이드2">|
|7.스케줄 페이지|8.방명록 페이지|
  |<img src="https://github.com/user-attachments/assets/d3659498-c1ed-4954-bd8d-57b9cbfc9086" width="400" height="700" alt="스케줄 페이지">|<img src="https://github.com/user-attachments/assets/900a5efe-5368-43d2-a749-1842ac89d360" width="400" height="700" alt="방명록페이지">|
|9.마이 페이지|10.직관일지 페이지 
 |<img src="https://github.com/user-attachments/assets/298c0f9a-24e4-4687-924b-18fe41f5f4dd" width="400" height="700" alt="마이 페이지"> |<img src="https://github.com/user-attachments/assets/18bee6a1-4177-44c1-9594-4cbac08e1376" width="400" height="700" alt="직관일지 페이지">|


## 트러블슈팅

1. 이미지 업로드 및 표시 문제
- 문제: 배포 후, 데이터베이스에서 불러온 이미지가 로드되지 않음.
- 해결 방법: 이미지 파일의 저장 경로나 URL 처리를 재확인하고, 클라우드 서버 설정을 점검.
- 결과: 이미지가 정상적으로 로드되도록 수정하였으나 여전히 배포 후 작은 버그가 남아 있음. 이를 해결하기 위해 추가 점검 중.

2. 프로필 데이터 및 통계 불러오기
- 문제: API를 통해 유저 통계 데이터를 불러올 때 응답 시간이 길어짐.
- 해결 방법: 데이터베이스 쿼리를 최적화하고 캐싱 전략을 검토 중.
- 결과: 현재 부분적으로 개선되었으나, 향후 더 나은 성능을 위해 추가적인 캐싱 기능 도입을 계획 중.



## 사용된 기술 스택
- **프론트엔드**: Next.js, Typescript
- **스타일링**: Tailwind CSS (반응형 처리) 
- **배포**: cloudType

### 참고사항  
백엔드 깃허브
[:link:](https://github.com/superrookie8/sofanpage_backend)
- **백엔드**: python flask
- **데이터베이스**:MongoDB atlas


## 배포된 사이트
[supersohee.com](https://www.supersohee.com)

