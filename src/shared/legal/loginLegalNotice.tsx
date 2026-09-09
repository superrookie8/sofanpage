import Link from "next/link";

export default function LoginLegalNotice() {
	return (
		<p className="mt-3 text-center text-caption leading-5 text-ink-500">
			로그인하면 <Link className="underline underline-offset-2 hover:text-ink-900" href="/terms">이용약관</Link>이 적용되며{" "}
			<Link className="underline underline-offset-2 hover:text-ink-900" href="/privacy">개인정보처리방침</Link>을 확인할 수 있습니다.
		</p>
	);
}
