import type { ParentComponent } from "solid-js";

import { Flex, Float, Stack } from "styled-system/jsx";
import About from "~/components/About";
import ThemeToggler from "~/components/ThemeToggler";
import {
	SidebarProbelmsEmail,
	SidebarTitle,
	SidebarWarningText,
} from "~/components/layout/Sidebar";

const SidebarContainer: ParentComponent<{
	class?: string;
	headerClass?: string;
	bodyClass?: string;
	footerClass?: string;
}> = (props) => {
	return (
		<aside class={props.class}>
			<Flex class={props.headerClass}>
				<SidebarTitle />
			</Flex>
			<Float placement="top-end" offset="9">
				<About />
			</Float>
			<Stack class={props.bodyClass}>{props.children}</Stack>
			<Stack class={props.footerClass} color="fg.muted">
				<SidebarWarningText />
				<SidebarProbelmsEmail />
			</Stack>
			<Float placement="bottom-end" offset="9">
				<ThemeToggler />
			</Float>
		</aside>
	);
};

export default SidebarContainer;
