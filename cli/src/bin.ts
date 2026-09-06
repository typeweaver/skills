#!/usr/bin/env node
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { Effect } from "effect";
import { runCli } from "./cli.js";

NodeRuntime.runMain(runCli(process.argv.slice(2)).pipe(Effect.provide(NodeServices.layer)));
