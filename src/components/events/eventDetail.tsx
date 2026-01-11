// components/eventDetail.tsx
import Link from "next/link";
import { EventDetails } from "@/features/events/types";

interface EventDetailProps {
	eventDetails: EventDetails;
	loadingDetails: boolean;
}

const getButtonText = (title: string) => {
	// "데뷔 5주년", "6주년" 등의 패턴을 찾아서 버튼 텍스트 생성
	const yearMatch = title.match(/(\d+)주년/);
	if (yearMatch) {
		return `데뷔 ${yearMatch[1]}주년 이벤트 사이트`;
	}
	return "이벤트 사이트";
};

const getEventUrl = (title: string, originalUrl?: string) => {
	// 제목에서 주년 정보 추출
	const yearMatch = title.match(/(\d+)주년/);
	if (yearMatch) {
		const year = yearMatch[1];
		// 5주년이면 /events/5th, 6주년이면 /events/6th
		return `/events/${year}th`;
	}
	// 주년 정보가 없으면 원래 URL 사용
	return originalUrl || "#";
};

const EventDetail: React.FC<EventDetailProps> = ({
	eventDetails,
	loadingDetails,
}) => {
	if (loadingDetails) {
		return (
			<div className="flex justify-center items-center">
				<p>어라 왜 이렇게 오래 걸리지...</p>
			</div>
		);
	}

	const buttonUrl = getEventUrl(eventDetails.title, eventDetails.url);

	return (
		<div className="lg:w-2/3">
			<div className="text-lg font-bold">{eventDetails.title}</div>
			<div className="mt-2 mb-4 italic" style={{ whiteSpace: "pre-line" }}>
				{eventDetails.description}
			</div>
			<div className="flex justify-center items-center">
				{buttonUrl !== "#" && (
					<Link href={buttonUrl}>
						<button className="w-auto bg-red-500 text-white font-bold py-2 px-4 rounded">
							{getButtonText(eventDetails.title)}
						</button>
					</Link>
				)}
			</div>
			<div className="mt-4 flex flex-col items-start">
				{eventDetails.checkFields.check_1 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check_1}</div>
				)}
				{eventDetails.checkFields.check_2 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check_2}</div>
				)}
				{eventDetails.checkFields.check_3 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check_3}</div>
				)}
			</div>
		</div>
	);
};

export default EventDetail;
