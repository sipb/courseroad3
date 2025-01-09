import { MenuIcon, XIcon } from "lucide-solid";
import type { ParentComponent } from "solid-js";

import {
	SidebarProbelmsEmail,
	SidebarTitle,
	SidebarWarningText,
} from "~/components/layout/Sidebar";
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
								<IconButton
									{...closeProps()}
									variant="ghost"
									position="absolute"
									top={3}
									right={4}
								>
									<XIcon />
								</IconButton>
							)}
						/>
					</Drawer.Header>
					<Drawer.Body>{props.children}</Drawer.Body>
					<Drawer.Footer color="fg.muted" gap="3">
						<SidebarProbelmsEmail />
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
	);
};

export default SidebarDialog;
