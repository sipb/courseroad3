import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { Box, Flex, HStack, Stack } from "styled-system/jsx";

import { SquareCheckIcon } from "lucide-solid";
import About from "~/components/About";
import Audit from "~/components/Audit";
import Settings from "~/components/Settings";
import ThemeToggler from "~/components/ThemeToggler";
import { Icon } from "~/components/ui/icon";
import { Link } from "~/components/ui/link";
import { Text } from "~/components/ui/text";

import type {
	CourseRequirementsWithKey,
	Reqs,
	SimplifiedSelectedSubjects,
} from "~/context/types";

const Sidebar: Component<{
	changeYear: (year: number) => void;
	reqList: CourseRequirementsWithKey[];
}> = (props) => {
	return (
		<Stack>
			<SidebarButtons changeYear={props.changeYear} />
			<Audit reqList={props.reqList} />
		</Stack>
	);
};

const SidebarButtons: Component<{
	changeYear: (year: number) => void;
}> = (props) => {
	return (
		<HStack>
			<About />
			<ThemeToggler />
			<Settings changeYear={props.changeYear} />
		</HStack>
	);
};

export const SidebarWarningText: Component = () => {
	return (
		<Text>
			<Text fontWeight="bold" as="span">
				Warning
			</Text>
			: This is an unofficial tool that may not accurately reflect degree
			progress. Please view the{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="https://student.mit.edu/cgi-bin/shrwsdau.sh"
					>
						official audit
					</A>
				)}
			/>
			,{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="http://student.mit.edu/catalog/index.cgi"
					>
						course catalog
					</A>
				)}
			/>
			, and{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="http://catalog.mit.edu/degree-charts/"
					>
						degree charts
					</A>
				)}
			/>{" "}
			and confirm with your department advisors.
		</Text>
	);
};

export const SidebarProbelmsEmail: Component = () => {
	return (
		<Text>
			Problems with the course requirements? Request edits{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="https://fireroad.mit.edu/requirements/"
					>
						here
					</A>
				)}
			/>{" "}
			or send an email to{" "}
			<Link
				asChild={(linkProps) => (
					<a {...linkProps} href="mailto:courseroad@mit.edu">
						courseroad@mit.edu
					</a>
				)}
			/>
			.
		</Text>
	);
};

export const SidebarTitle: Component = () => {
	return (
		<Flex>
			<Box p={2} bg="colorPalette.default" color="colorPalette.fg">
				<HStack>
					<Icon asChild={(childProps) => <SquareCheckIcon {...childProps} />} />
					<Text fontWeight="bold" as="h3" letterSpacing=".2rem">
						CourseRoad
					</Text>
				</HStack>
			</Box>
		</Flex>
	);
};

export default Sidebar;
