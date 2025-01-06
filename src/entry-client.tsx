// @refresh reload
import { StartClient, mount } from "@solidjs/start/client";
import "solid-devtools";

// biome-ignore lint/style/noNonNullAssertion: won't be null
mount(() => <StartClient />, document.getElementById("app")!);
