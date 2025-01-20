import { type Component, Show, createMemo } from "solid-js";

import { courseColor, getColorClass } from "~/lib/colors";

import { Box } from "styled-system/jsx";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

import type { SelectedSubjects } from "~/context/types";
import { Button } from "./ui/button";

const Class: Component<{
	classIndex: number;
	classInfo: "placeholder" | SelectedSubjects;
	semesterIndex: number;
	warnings: string[];
}> = (props) => {
	const classInfo = createMemo(() => {
		if (props.classInfo === "placeholder") {
			return undefined;
		}
		return props.classInfo;
	});

	return (
		<Show when={classInfo()} fallback={"placeholder"}>
			{(shownClassInfo) => (
				<Button
					width="48"
					height="24"
					variant="solid"
					overflowY="hidden"
					textWrap="wrap"
					className={getColorClass(courseColor(shownClassInfo()))}
				>
					<Text>
						<Text as="span" fontWeight="bold">
							{shownClassInfo().subject_id}{" "}
						</Text>

						<Text as="span" fontWeight="medium">
							{shownClassInfo().title}
						</Text>
					</Text>
				</Button>
			)}
		</Show>
	);
};

export default Class;
