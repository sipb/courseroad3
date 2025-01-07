import type { Component } from "solid-js";

import { InfoIcon, XIcon } from "lucide-solid";
import { Portal } from "solid-js/web";
import { Stack } from "styled-system/jsx";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";

const About: Component<Dialog.RootProps> = (props) => {
	return (
		<Dialog.Root lazyMount unmountOnExit {...props}>
			<Dialog.Trigger
				asChild={(triggerProps) => (
					<IconButton variant="ghost" {...triggerProps()}>
						<InfoIcon />
					</IconButton>
				)}
			/>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Stack gap="1">
								<Dialog.Title>About CourseRoad</Dialog.Title>
								<Dialog.Description>
									CourseRoad description will go here...
								</Dialog.Description>
							</Stack>
						</Stack>
						<Dialog.CloseTrigger
							asChild={(closeTriggerProps) => (
								<IconButton
									{...closeTriggerProps()}
									aria-label="Close Dialog"
									variant="ghost"
									size="sm"
									position="absolute"
									top="2"
									right="2"
								>
									<XIcon />
								</IconButton>
							)}
						/>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};

export default About;
