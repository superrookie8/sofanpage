"use client";

import Link from "next/link";

const quickMenus = [
	{ href: "/admin/schedule", tag: "SCHEDULE", title: "경기 일정", description: "시즌별 경기 일정을 추가하고 홈·원정 정보를 관리해요.", number: "01" },
	{ href: "/admin/stats", tag: "RECORD", title: "선수 기록", description: "이소희 선수의 시즌 평균과 누적 기록을 업데이트해요.", number: "02" },
	{ href: "/admin/photos", tag: "GALLERY", title: "사진 업로드", description: "팬페이지 갤러리에 보여줄 새로운 사진을 등록해요.", number: "03" },
	{ href: "/admin/events", tag: "EVENT", title: "이벤트", description: "팬 이벤트 콘텐츠와 참여 항목을 구성해요.", number: "04" },
];

export default function AdminDashboard() {
	const today = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(new Date());

	return (
		<div className="admin-dashboard">
			<section className="admin-hero">
				<div className="admin-hero-copy">
					<span className="admin-eyebrow">BNK SUM · NO.6</span>
					<h2>오늘도 소희 선수의<br /><em>빛나는 순간</em>을 기록해요.</h2>
					<p>{today} · 팬페이지 운영에 필요한 메뉴를 한곳에 모았어요.</p>
					<div className="admin-hero-actions"><Link href="/admin/schedule">경기 일정 등록</Link><Link href="/admin/photos" className="is-secondary">사진 업로드</Link></div>
				</div>
				<div className="admin-hero-visual" aria-hidden="true">
					<div className="admin-hero-ball" /><span className="admin-hero-six">6</span>
					<div className="admin-hero-caption"><small>BUSAN BNK SUM</small><strong>LEE SO HEE</strong></div>
				</div>
			</section>
			<section className="admin-summary-grid" aria-label="운영 요약">
				<div><span>ACTIVE PLAYER</span><strong>이소희 <em>#6</em></strong><small>BNK SUM · Guard</small></div>
				<div><span>MANAGEMENT</span><strong>8 <em>menus</em></strong><small>콘텐츠 관리 도구</small></div>
				<div><span>API STATUS</span><strong className="admin-online-text">Connected</strong><small>Local server · 8080</small></div>
			</section>
			<div className="admin-section-heading"><div><span>QUICK MANAGEMENT</span><h2>빠른 관리</h2></div><p>자주 사용하는 메뉴로 바로 이동하세요.</p></div>
			<section className="admin-quick-grid">
				{quickMenus.map((menu) => <Link href={menu.href} key={menu.href} className="admin-quick-card"><span className="admin-card-number">{menu.number}</span><small>{menu.tag}</small><h3>{menu.title}</h3><p>{menu.description}</p><strong>관리하러 가기 <span>→</span></strong></Link>)}
			</section>
		</div>
	);
}
