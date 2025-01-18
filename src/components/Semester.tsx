import { type Component, For, createMemo } from "solid-js";

import { ChevronDownIcon } from "lucide-solid";
import { Flex, Grid, HStack } from "styled-system/jsx";
import Class from "~/components/Class";
import { Accordion } from "~/components/ui/accordion";
import { Text } from "~/components/ui/text";

import { useCourseDataContext } from "~/context/create";
import type {
	SelectedSubjects,
	SimplifiedSelectedSubjects,
	Subject,
	SubjectFull,
} from "~/context/types";

const Semester: Component<{
	selectedSubjects: SimplifiedSelectedSubjects;
	semesterSubjects: SelectedSubjects[];
	index: number;
	roadID: string;
	isOpen: boolean;
}> = (props) => {
	const [store, { getUserYear }] = useCourseDataContext();

	const baseYear = createMemo(() => {
		const today = new Date();
		const currentYear = today.getFullYear();
		const baseYear = today.getMonth() >= 5 ? currentYear + 1 : currentYear;
		return baseYear - getUserYear();
	});
	const semesterYearName = createMemo(() => {
		const yearNames = [
			"Freshman",
			"Sophomore",
			"Junior",
			"Senior",
			"Fifth Year",
		] as const;
		if (props.index === 0) {
			return "";
		}
		const yearIndex = Math.floor((props.index - 1) / 3);
		return yearNames[yearIndex];
	});
	const semesterYear = createMemo(() => {
		return props.index === 0
			? ""
			: Math.floor((props.index - 2) / 3) + baseYear();
	});
	const semesterType = createMemo(() => {
		return props.index === 0
			? "Prior Credit"
			: (["Fall", "IAP", "Spring"] as const)[(props.index - 1) % 3];
	});
	const semesterYearRendered = createMemo(() => {
		return props.index > 0 && semesterYear()
			? `'${semesterYear().toString().substring(2)}`
			: "";
	});

	// TODO: copied from courseroad 2, see what's actually needed
	const semesterInformation = createMemo(() => {
		const classesInfo = props.semesterSubjects
			.map((subj) => {
				if (subj.public === false) {
					return Object.assign({}, subj, {
						total_units: subj.units,
					});
				}
				if (subj.subject_id in store.subjectsIndex) {
					return store.subjectsInfo[store.subjectsIndex[subj.subject_id]];
				}
				if (subj.subject_id in store.genericIndex) {
					return store.genericCourses[store.genericIndex[subj.subject_id]];
				}
				return undefined;
			})
			.filter((subj) => subj !== undefined);
		const totalUnits = classesInfo.reduce((units, subj) => {
			let tu = subj.total_units;
			tu = Number.isNaN(tu) ? 0 : tu;
			return units + tu;
		}, 0);
		const expectedHours = (subj: SubjectFull) => {
			let hours =
				(subj.in_class_hours ?? Number.NaN) +
				(subj.out_of_class_hours ?? Number.NaN);
			hours = Number.isNaN(hours) ? subj.total_units : hours;
			hours = Number.isNaN(hours) ? 0 : hours;
			return {
				hours,
				subject_id: subj.subject_id,
			};
		};
		const sumExpectedHours = (hours: number, subj: { hours: number }) =>
			hours + subj.hours;
		const isInQuarter = (subj: Subject, quarter: number) =>
			subj.quarter_information === undefined ||
			Number.parseInt(subj.quarter_information.split(",")[0]) === quarter;
		const expectedHoursQuarter1 = classesInfo
			.filter((s) => isInQuarter(s, 0))
			.map(expectedHours);
		const totalExpectedHoursQuarter1 = expectedHoursQuarter1.reduce(
			sumExpectedHours,
			0,
		);
		const expectedHoursQuarter2 = classesInfo
			.filter((s) => isInQuarter(s, 1))
			.map(expectedHours);
		const totalExpectedHoursQuarter2 = expectedHoursQuarter2.reduce(
			sumExpectedHours,
			0,
		);
		const totalExpectedHours = Math.max(
			totalExpectedHoursQuarter1,
			totalExpectedHoursQuarter2,
		);
		const anyClassInSingleQuarter = classesInfo.some(
			(s) => s.quarter_information !== undefined,
		);

		return {
			totalUnits,
			totalExpectedHours,
			anyClassInSingleQuarter,
			expectedHoursQuarter1,
			expectedHoursQuarter2,
			totalExpectedHoursQuarter1,
			totalExpectedHoursQuarter2,
		};
	});

	return (
		<Accordion.Item
			value={props.index.toString()}
			hidden={store.hideIAP && semesterType() === "IAP"}
		>
			<Accordion.ItemTrigger>
				<Grid gap={6} gridTemplateColumns="4fr 6fr" w="full">
					<Flex justifyContent="space-between" flexWrap="wrap">
						<Text minWidth="fit-content">
							{semesterYearName()} {semesterType()} {semesterYearRendered()}
						</Text>
						<HStack gap="4">
							<Text fontSize="sm">
								Units: {semesterInformation().totalUnits}
							</Text>
							<Text fontSize="sm">
								Hours: {semesterInformation().totalExpectedHours.toFixed(1)}
							</Text>
						</HStack>
					</Flex>
					<HStack>{/* SMALL CLASSES WILL GO HERE */}</HStack>
				</Grid>
				<Accordion.ItemIndicator>
					<ChevronDownIcon />
				</Accordion.ItemIndicator>
			</Accordion.ItemTrigger>
			<Accordion.ItemContent justifyContent="center" display="flex">
				<For each={props.semesterSubjects}>
					{(subj, index) => (
						<Class
							classInfo={subj}
							semesterIndex={props.index}
							// warnings={warnings()[props.index]}
							classIndex={index()}
						/>
					)}
				</For>
			</Accordion.ItemContent>
		</Accordion.Item>
	);
};

export default Semester;
