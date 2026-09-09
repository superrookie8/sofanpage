import React from "react";
import LegalDocument, { type LegalSection } from "@/shared/legal/legalDocument";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/privacy");

const CONTACT_URL = "https://www.instagram.com/hahanana20C/";

const PRIVACY_SECTIONS: readonly LegalSection[] = [
	{
		id: "operator",
		title: "처리방침의 범위와 운영자",
		content: <><p>SUPER SOHEE는 개인이 운영하는 농구선수 이소희 팬페이지입니다. 이 방침은 SUPER SOHEE가 웹사이트와 소셜 로그인, 프로필, 아케이드 기능을 제공하면서 처리하는 개인정보에 적용됩니다.</p><p>개인정보 보호업무 및 관련 고충사항 처리 담당은 <strong>SUPER SOHEE 개인정보 보호 담당</strong>입니다. 열람·정정·삭제·처리정지 요청은 <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">제작자 소셜 계정으로 문의</a>해 주세요.</p></>,
	},
	{
		id: "data-purpose-basis",
		title: "처리 목적, 항목 및 법적 근거",
		content: <><p>서비스는 다음 정보를 서비스 제공을 위한 계약의 체결·이행 또는 이용자의 선택과 동의를 근거로 필요한 범위에서 처리합니다.</p><ul><li><strong>소셜 로그인과 계정 관리:</strong> Google 또는 Kakao 제공자, 제공자의 이용자 식별자(sub), Google 이메일, Kakao에서 이용자가 동의한 경우 이메일, 닉네임과 프로필 이미지, 내부 사용자 ID, 역할, 포인트, 레벨, 생성·수정 시각을 계정 식별, 로그인, 권한 확인 및 서비스 운영에 사용합니다.</li><li><strong>세션:</strong> 내부 사용자 ID와 백엔드 접근 토큰이 포함된 암호화 세션 정보를 로그인 유지와 보호 API 접근에 사용합니다. 브라우저에는 HttpOnly 세션 쿠키를 사용하며 최대 유효기간은 24시간입니다.</li><li><strong>아케이드:</strong> 로그인 이용자의 최고 점수와 순위를 기록하고 랭킹을 제공합니다.</li><li><strong>프로필:</strong> 이용자가 선택한 닉네임과 선택적으로 업로드한 프로필 사진을 마이페이지와 서비스 표시를 위해 처리합니다.</li></ul></>,
	},
	{
		id: "public-data",
		title: "공개되는 정보",
		content: <p>아케이드 랭킹의 <strong>닉네임, 최고 점수, 순위</strong>는 로그인하지 않은 방문자에게도 공개됩니다. 내부 사용자 ID와 프로필 이미지 주소는 공개 랭킹 응답에서 제외합니다. 공개를 원하지 않으면 점수 제출 전에 로그아웃하거나 삭제를 요청할 수 있습니다.</p>,
	},
	{
		id: "legacy-data",
		title: "현재 접근이 중단된 과거 기능 정보",
		content: <><p>직관일지, 방명록과 일반 회원가입의 신규 접근 및 작성 기능은 현재 차단되어 있습니다. 다만 과거 운영 과정에서 입력된 정보가 남아 있을 수 있습니다.</p><ul><li><strong>과거 일반 가입 계정:</strong> 이메일, 닉네임과 단방향 해시로 저장된 비밀번호</li><li><strong>직관일지:</strong> 동행인, 좌석, 관람 기록, 메모와 사진 등</li><li><strong>방명록:</strong> 작성자명, 메시지와 사진 등</li></ul><p>현재 계정과 연결된 직관일지 문서는 회원 탈퇴 때 함께 삭제됩니다. 소유를 확인하기 어려운 기존 직관일지 사진과 과거 방명록처럼 현재 계정과 연결할 수 없는 정보는 회원 탈퇴만으로 삭제되지 않을 수 있으므로 별도로 삭제를 요청해 주세요.</p></>,
	},
	{
		id: "retention",
		title: "보유기간",
		content: <ul><li>활성 계정, 프로필, 아케이드 점수와 계정에 연결된 직관일지 문서: 회원 탈퇴 또는 이용자의 삭제 요청을 처리할 때까지</li><li>로그인 세션 쿠키: 생성 후 최대 24시간</li><li>현재 접근이 중단된 일반 가입 계정, 소유를 확인하기 어려운 기존 직관일지 사진과 계정에 연결할 수 없는 방명록 정보: 이용자의 삭제 요청을 처리할 때까지</li><li>관계 법령에 따라 보존할 의무가 생기는 경우: 해당 법령이 정한 기간</li></ul>,
	},
	{
		id: "processors",
		title: "처리위탁과 외부 서비스",
		content: <><p>서비스 운영을 위해 다음 인프라와 인증 서비스를 사용합니다.</p><ul><li>Netlify: 웹사이트 호스팅과 전송</li><li>Cloudtype: API 서버 운영</li><li>MongoDB: 계정과 서비스 데이터 저장</li><li>Cloudflare R2: 이용자가 선택적으로 올린 이미지 저장</li><li>Google·Kakao: 소셜 로그인과 본인 계정 인증</li></ul><p>외부 제공자의 처리 장소와 방식은 각 제공자의 정책에 따라 달라질 수 있습니다. 서비스는 주민등록번호나 결제정보를 직접 요구하지 않습니다.</p></>,
	},
	{
		id: "external-requests",
		title: "외부 페이지와 리소스",
		content: <><p>지도, 영상, 글꼴, 기사 이미지나 외부 링크를 열 때 Google, Kakao, YouTube, 뉴스 매체, CDN 및 연결된 외부 사이트에 IP 주소, 브라우저 정보, 접속 시각 같은 접속정보가 전달될 수 있습니다. 이 처리는 각 제공자의 정책을 따릅니다.</p><p>Google Analytics는 이 방침이 적용되는 사이트 버전부터 비활성화되어 신규 분석 정보를 전송하지 않습니다.</p></>,
	},
	{
		id: "destruction",
		title: "삭제와 파기",
		content: <p>마이페이지의 회원 탈퇴가 완료되면 활성 계정, 프로필, 계정과 연결된 직관일지 문서, 아케이드 점수 및 랭킹 기록을 삭제합니다. 소유를 확인하기 어려운 기존 직관일지 사진과 계정에 연결할 수 없는 방명록 정보는 별도 삭제 요청이 확인되면 저장소와 기록을 확인해 수동 처리하여 삭제합니다. 전자 파일은 복구하기 어려운 방식으로 삭제합니다. 백업이나 관계 법령상 보존이 필요한 정보가 있다면 해당 목적에만 분리하여 보관한 뒤 기간이 끝나면 삭제합니다.</p>,
	},
	{
		id: "rights",
		title: "이용자의 권리와 행사 방법",
		content: <p>이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 요청 시 계정의 소유 여부를 확인할 수 있으며, 대리 요청은 정당한 대리권 확인이 필요할 수 있습니다. 요청은 <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">제작자 소셜 계정으로 문의</a>해 주세요.</p>,
	},
	{
		id: "security",
		title: "안전성 확보 조치",
		content: <p>확인된 구현 범위에서 HTTPS 통신, HttpOnly·Secure(운영 환경) 세션 쿠키, 인증이 필요한 API의 접근 통제, 토큰 원문 대신 해시를 이용한 로그인 교환 요청의 중복 방지 식별자를 적용합니다. 운영자는 접근 권한을 필요한 범위로 제한하고 오류 알림에 요청 본문·쿠키·인증 토큰을 포함하지 않도록 관리합니다.</p>,
	},
	{
		id: "children",
		title: "만 14세 미만 이용자",
		content: <p>SUPER SOHEE는 법정대리인의 동의 없이 만 14세 미만 이용자의 회원 이용을 받지 않습니다. 해당 이용자는 소셜 로그인, 프로필 작성, 점수 저장 기능을 이용하지 말아야 하며, 확인된 경우 운영자에게 삭제를 요청할 수 있습니다.</p>,
	},
	{
		id: "changes",
		title: "방침 변경",
		content: <p>처리 항목이나 서비스가 바뀌어 이 방침을 변경할 때에는 시행 전에 웹사이트에서 변경 내용과 시행일을 알립니다. 이용자 권리에 중대한 변경이 있으면 알아보기 쉬운 방법으로 별도 안내합니다.</p>,
	},
] as const;

export default function PrivacyPage() {
	return <LegalDocument eyebrow="PRIVACY" title="개인정보처리방침" summary="SUPER SOHEE가 어떤 정보를 왜 처리하고, 어디에 공개하며, 이용자가 어떻게 권리를 행사할 수 있는지 안내합니다." effectiveDate="2026년 9월 9일" sections={PRIVACY_SECTIONS} />;
}
