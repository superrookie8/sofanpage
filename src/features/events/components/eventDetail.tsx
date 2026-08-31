// components/eventDetail.tsx
import Link from "next/link";
import { EventDetails } from "../types";

interface EventDetailProps {
	eventDetails: EventDetails | undefined;
	loadingDetails: boolean;
}

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

	if (!eventDetails) {
		return (
			<div className="flex justify-center items-center">
				<p>이벤트 정보를 불러올 수 없습니다.</p>
			</div>
		);
	}

	const buttonUrl = eventDetails.url;

	return (
		<div className="lg:w-2/3">
			<div className="text-lg font-bold">{eventDetails.title}</div>
			<div className="mt-2 mb-4 italic" style={{ whiteSpace: "pre-line" }}>
				{eventDetails.description}
			</div>
			<div className="flex justify-center items-center">
				{buttonUrl && (
					<Link href={buttonUrl}>
						<button className="w-auto bg-red-500 text-white font-bold py-2 px-4 rounded">
							이벤트 사이트
						</button>
					</Link>
				)}
			</div>
			<div className="mt-4 flex flex-col items-start">
				{eventDetails.checkFields.check1 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check1}</div>
				)}
				{eventDetails.checkFields.check2 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check2}</div>
				)}
				{eventDetails.checkFields.check3 && (
					<div className="mt-2">✓ {eventDetails.checkFields.check3}</div>
				)}
			</div>
		</div>
	);
};

export default EventDetail;
