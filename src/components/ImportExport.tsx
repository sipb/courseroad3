import { DownloadIcon, UploadIcon, XIcon } from "lucide-solid";
import type { Component } from "solid-js";
import { Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";

const ImportExport: Component = (props) => {
	return (
		<>
			<Button {...props}>
				Export
				<DownloadIcon />
			</Button>
			<Dialog.Root {...props}>
				<Dialog.Trigger
					asChild={(triggerProps) => (
						<Button {...triggerProps()}>
							Import
							<UploadIcon />
						</Button>
					)}
				/>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Stack gap="1">
								<Dialog.Title>Import Road</Dialog.Title>
							</Stack>
							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Dialog.CloseTrigger
									asChild={(closeTriggerProps) => (
										<Button {...closeTriggerProps()} variant="outline">
											Cancel
										</Button>
									)}
								/>
								<Button>Import!</Button>
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
		</>
	);
};

export default ImportExport;
