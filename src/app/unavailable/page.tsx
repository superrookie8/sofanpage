import Link from "next/link";

export default function UnavailablePage() {
	return (
		<main className="flex min-h-[calc(100vh-72px)] items-center justify-center p-6">
			<section className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
				<h1 className="text-2xl font-bold text-gray-900">현재 비공개 기능입니다</h1>
				<p className="mt-4 leading-7 text-gray-600">
					안정화 MVP에 포함되지 않은 기능은 기존 데이터와 소스를 보존한 채
					공개 접근만 막아두었습니다.
				</p>
				<Link
					href="/home"
					className="mt-6 inline-flex rounded-lg bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
				>
					홈으로 돌아가기
				</Link>
			</section>
		</main>
	);
}
