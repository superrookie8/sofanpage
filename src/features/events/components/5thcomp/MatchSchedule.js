import React from "react";
import styled from "styled-components";

// 스타일 컴포넌트 정의
const ScheduleContainer = styled.div`
 
  border: 3px solid red;
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  max-width: 630px;
  background-color: white;

  @media (max-width: 768px) {
    margin: 15px;
  }

  @media (max-width: 500px) {
    margin: 15px;
  }

  @media (max-width: 430px) {
    margin: 15px;
  }

  @media (max-width: 360px) {
    margin: 10px;
  }
`;

const Spacer = styled.div`
  margin-bottom: 30px; // 추가적인 여백을 위한 스페이서
`;

const Title = styled.h2`
  font-family: 'GmarketSans', sans-serif;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  font-family: 'GmarketSans', sans-serif;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f2f2f2;
  }
`;

const NoticeBox = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
`;

const Button = styled.button`
  display: block;
  margin: 10px auto;
  padding: 10px 20px;
  background-color: white;
  color: red;
  border: 2px solid red;
  border-radius: 8px;
  font-family: 'GmarketSans', sans-serif;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: red;
    color: white;
  }
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
  margin: 10px auto;
`;

function MatchSchedule() {
	return (
		<ScheduleContainer>
			<Title>BNK SUM 홈경기 일정</Title>
			<Table>
				<thead>
					<tr>
						<th>일시</th>
						<th>요일</th>
						<th>대진팀</th>
						<th>경기시간</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>1월 18일</td>
						<td>목요일</td>
						<td>신한은행</td>
						<td>19시</td>
					</tr>
					<tr>
						<td>1월 26일</td>
						<td>금요일</td>
						<td>KB스타즈</td>
						<td>19시</td>
					</tr>
					<tr>
						<td>2월 9일</td>
						<td>금요일</td>
						<td>삼성생명</td>
						<td>14시</td>
					</tr>
					<tr>
						<td>2월 17일</td>
						<td>토요일</td>
						<td>신한은행</td>
						<td>14시 (창원!)</td>
					</tr>
					<tr>
						<td>2월 22일</td>
						<td>목요일</td>
						<td>하나원큐</td>
						<td>19시</td>
					</tr>
					<tr>
						<td>2월 25일</td>
						<td>일요일</td>
						<td>우리은행</td>
						<td>14시</td>
					</tr>
				</tbody>
			</Table>
			<Spacer />
			<NoticeBox>
				<div>WKBL 앱으로 예매하면 할인됩니다!</div>
				<div>회원가입 필요 (티켓링크 연동)</div>
			</NoticeBox>
			<Spacer />
			<Button
				onClick={() =>
					(window.location.href =
						"https://apps.apple.com/kr/app/wkbl/id1071013833")
				}
			>
				WKBL 앱스토어로 이동
			</Button>
			<Button
				onClick={() =>
					(window.location.href =
						"https://play.google.com/store/apps/details?id=or.kr.wkbl&hl=ko&gl=US&pli=1")
				}
			>
				WKBL 구글플레이 이동
			</Button>
			<Button
				onClick={() => (window.location.href = "https://www.wkbl.or.kr/main/")}
			>
				WKBL 웹사이트로 이동
			</Button>
			<Button
				onClick={() =>
					(window.location.href = "http://www.bnksumbasket.com/index.php")
				}
			>
				BNK썸 웹사이트로 이동
			</Button>
			<Button
				onClick={() =>
					(window.location.href = "https://blog.naver.com/bnksum0624")
				}
			>
				BNK썸 팀블로그로 이동
			</Button>
			<Image src="/5th/price2.png" alt="가격표" />
		</ScheduleContainer>
	);
}

export default MatchSchedule;
