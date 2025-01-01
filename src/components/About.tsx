import { XIcon } from "lucide-solid";
import type { Component } from "solid-js";
import { Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";

const About: Component<Dialog.RootProps> = (props) => {
	return (
		<Dialog.Root {...props}>
			<Dialog.Trigger
				asChild={(triggerProps) => (
					<Button variant="link" {...triggerProps()}>
						About CourseRoad
					</Button>
				)}
			/>
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
		</Dialog.Root>
	);
};

export default About;
