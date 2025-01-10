import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "solid-devtools";
import "./index.css";

export default function App() {
	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Title>CourseRoad</Title>
					<Suspense>{props.children}</Suspense>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
