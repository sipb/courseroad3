import {
	CheckIcon,
	ChevronsUpDownIcon,
	SettingsIcon,
	XIcon,
} from "lucide-solid";
import { type Component, createMemo, createSignal, For } from "solid-js";
import { Portal } from "solid-js/web";
import { Stack } from "styled-system/jsx";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { IconButton } from "~/components/ui/icon-button";
import { createListCollection, Select } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

import { useCourseDataContext } from "~/context/create";

interface SettingsProps extends Dialog.RootProps {
	changeYear: (year: number) => void;
}

const Settings: Component<SettingsProps> = (props) => {
	const [store, { getUserYear, setHideIAP }] = useCourseDataContext();
	const [openRoadSettings, setOpenRoadSettings] = createSignal(false);

	const year = createMemo(() => getUserYear());
	const hideIAP = createMemo(() => store.hideIAP);

	const yearCollection = createListCollection({
		items: [
			{ value: "0", label: "First Year/Freshman" },
			{ value: "1", label: "Sophomore" },
			{ value: "2", label: "Junior" },
			{ value: "3", label: "Senior" },
			{ value: "4", label: "Super Senior" },
		],
	});

	return (
		<Dialog.Root
			lazyMount
			unmountOnExit
			open={openRoadSettings()}
			onOpenChange={(e) => setOpenRoadSettings(e.open)}
			{...props}
		>
			<Dialog.Trigger
				asChild={(triggerProps) => (
					<IconButton {...triggerProps()} variant="ghost" aria-label="Settings">
						<SettingsIcon />
					</IconButton>
				)}
			/>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Stack gap="8" p="6">
							<Dialog.Title>Road Settings</Dialog.Title>
							<Select.Root
								positioning={{ sameWidth: true }}
								width="2xs"
								collection={yearCollection}
								value={[`${year()}`]}
								onValueChange={(e) =>
									props.changeYear(Number.parseInt(e.value[0]))
								}
							>
								<Select.Label>I am a...</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select a Year" />
										<ChevronsUpDownIcon />
									</Select.Trigger>
								</Select.Control>
								<Select.Positioner>
									<Select.Content>
										<Select.ItemGroup>
											<For each={yearCollection.items}>
												{(item) => (
													<Select.Item item={item}>
														<Select.ItemText>{item.label}</Select.ItemText>
														<Select.ItemIndicator>
															<CheckIcon />
														</Select.ItemIndicator>
													</Select.Item>
												)}
											</For>
										</Select.ItemGroup>
									</Select.Content>
								</Select.Positioner>
							</Select.Root>

							<Switch
								checked={hideIAP()}
								onCheckedChange={(e) => setHideIAP(e.checked)}
							>
								Hide IAP
							</Switch>

							<Stack
								gap="3"
								direction="row"
								width="full"
								justifyContent="flex-end"
							>
								<Button
									variant="outline"
									onClick={() => {
										setOpenRoadSettings(false);
									}}
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										props.changeYear(year());
										setOpenRoadSettings(false);
									}}
								>
									Submit
								</Button>
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

export default Settings;
