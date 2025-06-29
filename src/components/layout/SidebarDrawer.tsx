import { MenuIcon, XIcon } from "lucide-solid";
import type { ParentComponent } from "solid-js";
import { Float } from "styled-system/jsx";

import About from "~/components/About";
import {
	SidebarProbelmsEmail,
	SidebarTitle,
	SidebarWarningText,
} from "~/components/layout/Sidebar";
import ThemeToggler from "~/components/ThemeToggler";
import { Drawer } from "~/components/ui/drawer";
import { IconButton } from "~/components/ui/icon-button";

const SidebarDialog: ParentComponent<Drawer.RootProps> = (props) => {
	return (
		<Drawer.Root lazyMount unmountOnExit variant="left" {...props}>
			<Drawer.Trigger
				asChild={(triggerProps) => (
					<IconButton {...triggerProps()} hideFrom="md" variant="outline">
						<MenuIcon />
					</IconButton>
				)}
			/>
			<Drawer.Backdrop />
			<Drawer.Positioner>
				<Drawer.Content>
					<Drawer.Header>
						<Drawer.Title>
							<SidebarTitle />
						</Drawer.Title>
						<Drawer.Description>
							<SidebarWarningText />
						</Drawer.Description>
						<Drawer.CloseTrigger
							asChild={(closeProps) => (
								<Float placement="top-end" offsetY="8" offsetX="14">
									<About />
									<IconButton {...closeProps()} variant="ghost">
										<XIcon />
									</IconButton>
								</Float>
							)}
						/>
					</Drawer.Header>
					<Drawer.Body>{props.children}</Drawer.Body>
					<Drawer.Footer color="fg.muted" gap="3">
						<SidebarProbelmsEmail />
						<Float placement="bottom-end" offsetY="8" offsetX="9">
							<ThemeToggler />
						</Float>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	);
};

export default SidebarDialog;
