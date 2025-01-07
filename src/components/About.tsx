import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { Portal } from "solid-js/web";

import { InfoIcon, XIcon } from "lucide-solid";
import { Stack } from "styled-system/jsx";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { Link } from "~/components/ui/link";
import { Text } from "~/components/ui/text";

const About: Component<Dialog.RootProps> = (props) => {
	return (
		<Dialog.Root lazyMount unmountOnExit {...props}>
			<Dialog.Trigger
				asChild={(triggerProps) => (
					<IconButton
						variant="ghost"
						{...triggerProps()}
						aria-label="About CourseRoad"
					>
						<InfoIcon />
					</IconButton>
				)}
			/>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Stack gap="2" maxW="lg">
								<Text as="h1" size="2xl" fontWeight="bold">
									About CourseRoad
								</Text>
								<Text size="sm" color="fg.muted">
									CourseRoad is a student-run academic planner for MIT students.
									It allows students to plan out their degrees, test out paths
									for different majors, and view class information.
								</Text>
								<Text size="sm" color="fg.muted">
									This is always a work in progress! If you have feature
									requests or want to contribute, the source code is open source
									and located on{" "}
									<Link
										asChild={(linkProps) => (
											<A
												{...linkProps}
												target="_blank"
												rel="noreferrer"
												href="https://github.com/sipb/courseroad3"
											>
												Github
											</A>
										)}
									/>
									.
								</Text>
								<Text size="sm" color="fg.muted">
									We would like to thank the Office of the First Year and the
									Student Information Processing Board for all their support
									with this project.
								</Text>
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
