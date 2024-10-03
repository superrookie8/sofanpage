"use client";

const DateTimeDisplay = ({ date = new Date() }) => {
	const formattedDateTime = new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).format(date);

	return <span>{formattedDateTime}</span>;
};

export default DateTimeDisplay;
