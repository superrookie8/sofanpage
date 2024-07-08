import { AppProps } from "next/app";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useRouter } from "next/router";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	return (
		<div className="app">
			<TransitionGroup>
				<CSSTransition key={router.pathname} timeout={300} classNames="page">
					<div className="page">
						<Component {...pageProps} />
					</div>
				</CSSTransition>
			</TransitionGroup>
		</div>
	);
}

export default MyApp;
