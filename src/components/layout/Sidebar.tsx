import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { Box, HStack, Stack, VStack } from "styled-system/jsx";

import { SquareCheckIcon } from "lucide-solid";
import Audit from "~/components/Audit";
import Settings from "~/components/Settings";
import { Icon } from "~/components/ui/icon";
import { Link, type LinkProps } from "~/components/ui/link";
import { Text } from "~/components/ui/text";

import type { CourseRequirementsWithKey } from "~/context/types";

import sipbLogo from "~/assets/simple-fuzzball.png";

const Sidebar: Component<{
	changeYear: (year: number) => void;
	reqList: CourseRequirementsWithKey[];
}> = (props) => {
	return (
		<>
			<Stack h="full">
				<Stack flex={1} overflowY="auto">
					<Audit reqList={props.reqList} />
				</Stack>
				<HStack justifyContent="end">
					<Settings changeYear={props.changeYear} />
				</HStack>
			</Stack>
		</>
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
					/>
				)}
			>
				official audit
			</Link>
			,{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="http://student.mit.edu/catalog/index.cgi"
					/>
				)}
			>
				course catalog
			</Link>
			, and{" "}
			<Link
				asChild={(linkProps) => (
					<A
						{...linkProps}
						target="_blank"
						rel="noreferrer"
						href="http://catalog.mit.edu/degree-charts/"
					/>
				)}
			>
				degree charts
			</Link>{" "}
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
					/>
				)}
			>
				here
			</Link>{" "}
			or send an email to{" "}
			<Link
				asChild={(linkProps) => (
					<a {...linkProps} href="mailto:courseroad@mit.edu" />
				)}
			>
				courseroad@mit.edu
			</Link>
			.
		</Text>
	);
};

export const SidebarTitle: Component = () => {
	return (
		<VStack alignItems="start">
			<Box p={2} bg="colorPalette.default" color="colorPalette.fg">
				<HStack>
					<Icon asChild={(childProps) => <SquareCheckIcon {...childProps} />} />
					<Text fontWeight="bold" as="h3" letterSpacing=".2rem">
						CourseRoad
					</Text>
				</HStack>
			</Box>
		</VStack>
	);
};

// TODO: find nice way of integrating logo
// do we want to? it would match hydrant ig but idk
export const SIPBLogo: Component<LinkProps> = (props) => {
	return (
		<Link
			{...props}
			asChild={(linkProps) => (
				<A
					{...linkProps}
					target="_blank"
					rel="noreferrer"
					href="https://sipb.mit.edu"
				/>
			)}
		>
			By SIPB
			<Icon
				asChild={(iconProps) => (
					<img {...iconProps} src={sipbLogo} alt="SIPB Logo" />
				)}
			/>
		</Link>
	);
};

export default Sidebar;
