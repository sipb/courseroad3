import { useParams } from "@solidjs/router";
import { useCourseDataContext } from "~/context/create";

export default function RoadPage() {
	const params = useParams();
	const [store] = useCourseDataContext();
	return <></>;
}
