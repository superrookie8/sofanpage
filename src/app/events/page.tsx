"use client";
import Link from "next/link";
import Header from "@/components/header";
import { events } from "@/data/events";
import Sidebar from "@/components/sidebar";
import useAuth from "@/hooks/useAuth";

interface Props {}

const Events: React.FC<Props> = (props) => {
	useAuth();
	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500 min-h-screen  w-full flex justify-center p-8 relative">
					<Sidebar />
					<div className="w-[1200px] h-auto flex flex-col ">
						<div className=" w-full  overflow-x-auto flex flex-col justify-center items-center">
							{events.map((event, index) => (
								<div
									key={index}
									className="flex flex-row justify-center items-center mb-8"
								>
									<div className="bg-white w-[500px] h-[400px] flex flex-col justify-center p-4 mr-4">
										<div className="flex justify-center items-center text-lg font-bold">
											{event.title}
										</div>
										<div
											className="mt-2 mb-4 flex  text-center justify-center items-center italic"
											style={{ whiteSpace: "pre-line" }}
										>
											{event.description}
										</div>
										<div className="flex justify-center items-center">
											{event.url ? (
												<Link href={event.url}>
													<button className="w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded ">
														{event.title}
													</button>
												</Link>
											) : (
												<span></span>
											)}
										</div>
										<div className="flex justify-center items-center flex-col">
											{event.check_one ? (
												<div className="mt-8 ml-2">✓{event.check_one}</div>
											) : (
												<span></span>
											)}
											{event.check_two ? (
												<div className="mt-8 ml-2">✓{event.check_two}</div>
											) : (
												<span></span>
											)}
											{event.check_three ? (
												<div className="mt-8 ml-2">✓{event.check_three}</div>
											) : (
												<span></span>
											)}
										</div>
									</div>
									<div className="bg-green-200 w-[500px] h-[400px] flex flex-col justify-center items-center">
										여기에 캐로셀
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Events;
