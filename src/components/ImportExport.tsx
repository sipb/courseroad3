import { type Component, For, Show, createSignal } from "solid-js";

import { useCourseDataContext } from "~/context/create";
import type {
	SimplifiedSelectedSubjects,
	Subject,
	SubjectWithId,
} from "~/context/types";

import { flatten } from "~/lib/browserSupport";
import { getSimpleSelectedSubjects } from "~/lib/sanitizeSubjects";

import {
	DownloadIcon,
	FileInputIcon,
	FileXIcon,
	SpellCheck2Icon,
	UploadIcon,
	XIcon,
} from "lucide-solid";
import { sva } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { FileUpload } from "~/components/ui/file-upload";
import { IconButton } from "~/components/ui/icon-button";
import { Textarea } from "~/components/ui/textarea";

export const styles = sva({
	className: "import-export",
	slots: ["import", "export"],
	base: {
		import: {},
		export: { marginRight: 2 },
	},
})();

const ImportExport: Component<{
	addRoad: (
		roadTitle: string,
		coursesOfStudy: string[],
		simpless: SimplifiedSelectedSubjects,
		progressOverrides: Record<string, number>,
	) => void;
}> = (props) => {
	const [store] = useCourseDataContext();

	const [dialog, setDialog] = createSignal(false);
	const [inputText, setInputText] = createSignal("");
	const [roadTitle, setRoadTitle] = createSignal("");
	const [badInput, setBadInput] = createSignal(false);

	const otherRoadHasName = (roadName: string) => {
		const otherRoadNames = Object.keys(store.roads).filter((road) => {
			return store.roads[road].name.toLowerCase() === roadName.toLowerCase();
		});
		return otherRoadNames.length > 0;
	};

	const exportRoad = () => {
		const filename = `${store.roads[store.activeRoad].name}.road`;

		const roadSubjects = flatten(
			store.roads[store.activeRoad].contents.selectedSubjects,
		);
		const formattedRoadContents = Object.assign(
			{ coursesOfStudy: ["girs"], progressOverrides: [] },
			store.roads[store.activeRoad].contents,
			{ selectedSubjects: roadSubjects },
		);

		const text = JSON.stringify(formattedRoadContents);

		// for some reason this is the way you download files...
		// create an element, click it, and remove it
		const element = document.createElement("a");
		element.setAttribute(
			"href",
			`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
		);
		element.setAttribute("download", filename);

		element.style.display = "none";
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	};

	const importRoad = () => {
		let fail = false;
		const inputTextValue = inputText();
		const roadTitleValue = roadTitle();

		// check for legal input
		if (
			inputTextValue === "" ||
			roadTitleValue === "" ||
			otherRoadHasName(roadTitleValue)
		) {
			fail = true;
		}

		const expectedFields = [
			"index",
			"title",
			"overrideWarnings",
			"semester",
			"units",
			"subject_id",
		] as const;

		if (!fail) {
			try {
				// parse text and add to roads
				const obj = JSON.parse(inputTextValue);

				// sanitize
				// progressOverrides must be defined
				if (obj.progressOverrides === undefined) {
					obj.progressOverrides = {};
				}

				// subject_id issue
				const newss = obj.selectedSubjects.map((s: SubjectWithId) => {
					if (s.id) {
						s.subject_id = s.id;
						s.id = undefined;
					}
					return s;
				});
				obj.selectedSubjects = newss;

				const ss = obj.selectedSubjects
					.map((s: Subject) => {
						// make sure it has everything, if not fill in from subjectsIndex or genericCourses
						let subject: Subject | undefined = undefined;
						if (
							s.subject_id &&
							store.subjectsIndex[s.subject_id] !== undefined
						) {
							subject = store.subjectsInfo[store.subjectsIndex[s.subject_id]];
						} else if (
							s.subject_id &&
							store.genericIndex[s.subject_id] !== undefined
						) {
							subject = store.genericCourses[store.genericIndex[s.subject_id]];
						}

						if (subject === undefined) {
							const oldSubjects = store.subjectsInfo.filter((subj) => {
								return subj.old_id === s.subject_id;
							});

							if (oldSubjects.length > 0) {
								subject = oldSubjects[0];
								s.subject_id = subject.subject_id;
							}
						}

						if (subject !== undefined) {
							// expectedFields.forEach((f) => {
							for (const f of expectedFields) {
								if (s[f] === undefined) {
									// right now (4/16/19) 'units' is the only one that doesn't match and needs an exception
									if (f === "units") {
										s[f] = subject.total_units;
									} else {
										// @ts-expect-error TOOD: fix all types...
										s[f] = subject[f];
									}
								}
							}
							return s;
						}
						console.log(`ignoring ${s.subject_id}`);
						return undefined;
					})
					.filter((s: Subject) => {
						return s !== undefined;
					});

				// convert selected subjects to more convenient format
				const simpless = getSimpleSelectedSubjects(ss);

				props.addRoad(
					roadTitle(),
					obj.coursesOfStudy,
					simpless,
					obj.progressOverrides,
				);
			} catch (error) {
				fail = true;
				console.log("import failed with error:");
				console.error(error);
			}
		}

		if (fail) {
			setBadInput(true);
			// make warning go away after 7 seconds
			setTimeout(() => {
				setBadInput(false);
			}, 7000);
		} else {
			setBadInput(false);
			setDialog(false);
		}
	};

	return (
		<div>
			<Button variant="outline" class={styles.export} onClick={exportRoad}>
				Export
				<DownloadIcon />
			</Button>
			<Dialog.Root
				lazyMount
				open={dialog()}
				onOpenChange={(e) => setDialog(e.open)}
			>
				<Dialog.Trigger
					asChild={(triggerProps) => (
						<Button variant="outline" class={styles.import} {...triggerProps()}>
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
							<Field.Root>
								<Field.Label>Road Name</Field.Label>
								<Field.Input
									value={roadTitle()}
									onInput={(e) => setRoadTitle(e.target.value)}
								/>
							</Field.Root>

							<FileUpload.Root
								maxFiles={1}
								disabled={badInput()}
								onFileAccept={(details) => {
									const reader = new FileReader();
									reader.onload = (event) => {
										setInputText(event.target?.result as string);
									};

									if (details.files.length > 0) {
										reader.readAsText(details.files[0]);

										if (roadTitle() === "") {
											const fileName = details.files[0].name;
											setRoadTitle(fileName.slice(0, fileName.length - 5));
										}
									}
								}}
								onFileReject={(details) => {
									if (details.files.length > 0) {
										setBadInput(true);
										setTimeout(() => setBadInput(false), 7000);
									}
								}}
								validate={(file) => {
									const errors = [];

									if (!file.name.endsWith(".road")) {
										errors.push("FILE_INVALID_TYPE"); // Custom error
									}

									return errors.length > 0 ? errors : null;
								}}
							>
								<FileUpload.Trigger
									asChild={(triggerProps) => (
										<Button size="sm" {...triggerProps()}>
											<FileInputIcon /> Choose file
										</Button>
									)}
								/>
								<FileUpload.ItemGroup>
									<FileUpload.Context>
										{(fileUpload) => (
											<For each={fileUpload().acceptedFiles}>
												{(file) => (
													<FileUpload.Item file={file}>
														<FileUpload.ItemName />
													</FileUpload.Item>
												)}
											</For>
										)}
									</FileUpload.Context>
								</FileUpload.ItemGroup>
								<FileUpload.HiddenInput />
							</FileUpload.Root>

							<Field.Root>
								<Field.Textarea
									asChild={(inputProps) => (
										<Textarea
											value={inputText()}
											onInput={(e) => setInputText(e.target.value)}
											{...inputProps()}
											placeholder="Or copy/paste a road here"
										/>
									)}
								/>
							</Field.Root>

							<Show when={otherRoadHasName(roadTitle())}>
								<Alert.Root>
									<Alert.Icon
										asChild={(iconProps) => (
											<SpellCheck2Icon {...iconProps()} />
										)}
									/>
									<Alert.Content>
										<Alert.Title>Invalid input!</Alert.Title>
										<Alert.Description>
											There's already a road with this name.
										</Alert.Description>
									</Alert.Content>
								</Alert.Root>
							</Show>

							<Show when={badInput()}>
								<Alert.Root>
									<Alert.Icon
										asChild={(iconProps) => <FileXIcon {...iconProps()} />}
									/>
									<Alert.Content>
										<Alert.Title>Invalid input!</Alert.Title>
										<Alert.Description>
											Make sure you have given this road a unique name, and
											uploaded/pasted a valid '.road' file.
										</Alert.Description>
									</Alert.Content>
								</Alert.Root>
							</Show>

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
								<Button
									disabled={otherRoadHasName(roadTitle())}
									onClick={importRoad}
								>
									Import!
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
			</Dialog.Root>
		</div>
	);
};

export default ImportExport;
