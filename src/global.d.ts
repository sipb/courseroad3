/// <reference types="@solidjs/start/env" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PEOPLEAPI_ID: string;
    readonly PEOPLEAPI_SECRET: string;
  }
}
