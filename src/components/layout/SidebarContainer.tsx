import type { ParentComponent } from "solid-js";

import { Flex, Stack } from "styled-system/jsx";
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
			<Stack class={props.bodyClass}>{props.children}</Stack>
			<Stack class={props.footerClass} color="fg.muted">
				<SidebarWarningText />
				<SidebarProbelmsEmail />
			</Stack>
		</aside>
	);
};

export default SidebarContainer;
