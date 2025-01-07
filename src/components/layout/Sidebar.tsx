import { A } from "@solidjs/router";
import type { Component } from "solid-js";

import About from "~/components/About";
import ThemeToggler from "~/components/ThemeToggler";
import { Link } from "~/components/ui/link";
import { Text } from "~/components/ui/text";

const Sidebar: Component = () => {
	return (
		<>
			<About />
			<ThemeToggler />
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

export default Sidebar;
