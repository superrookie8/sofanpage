import type { ReactNode } from "react";

export interface LegalSection {
	id: string;
	title: string;
	content: ReactNode;
}

interface LegalDocumentProps {
	eyebrow: string;
	title: string;
	summary: string;
	effectiveDate: string;
	sections: readonly LegalSection[];
}

export default function LegalDocument({
	eyebrow,
	title,
	summary,
	effectiveDate,
	sections,
}: LegalDocumentProps) {
	return (
		<article className="mx-auto w-full max-w-4xl">
			<header className="border-b border-ink-200 pb-7 lg:pb-9">
				<p className="text-caption font-bold uppercase tracking-[.14em] text-brand-500">
					{eyebrow}
				</p>
				<h1 className="mt-2 text-h1 text-ink-900 lg:text-h1-lg">{title}</h1>
				<p className="mt-4 max-w-3xl text-sm-lg leading-7 text-ink-700">{summary}</p>
				<p className="mt-4 text-sm font-medium text-ink-500">시행일: {effectiveDate}</p>
			</header>

			<nav aria-label={`${title} 목차`} className="border-b border-ink-200 py-6">
				<p className="mb-3 text-sm font-bold text-ink-900">목차</p>
				<ol className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
					{sections.map((section, index) => (
						<li key={section.id}>
							<a className="text-ink-700 underline-offset-4 hover:text-brand-600 hover:underline" href={`#${section.id}`}>
								{index + 1}. {section.title}
							</a>
						</li>
					))}
				</ol>
			</nav>

			<div className="divide-y divide-ink-100">
				{sections.map((section, index) => (
					<section key={section.id} id={section.id} className="scroll-mt-24 py-7 lg:py-9">
						<h2 className="text-h2 text-ink-900 lg:text-h2-lg">
							{index + 1}. {section.title}
						</h2>
						<div className="mt-4 space-y-4 text-[15px] leading-7 text-ink-700 [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-ink-900 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
							{section.content}
						</div>
					</section>
				))}
			</div>
		</article>
	);
}
