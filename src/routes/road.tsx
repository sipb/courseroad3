import type { RouteSectionProps } from "@solidjs/router";
import CourseDataProvider from "~/context/component";

export default function RoadLayout(props: RouteSectionProps) {
	return <CourseDataProvider>{props.children}</CourseDataProvider>;
}
