// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

// biome-ignore lint/style/noNonNullAssertion: won't be null
mount(() => <StartClient />, document.getElementById("app")!);
