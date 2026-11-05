import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const DEFAULT_ENVIRONMENT = "production";
const VALID_ENVIRONMENTS = new Set(["development", "preview", "production", "all"]);
const VERCEL_COMMAND = ["bunx", "vercel"] as const;
const DEFAULT_FILES = [".env"];
const SKIP_KEYS = new Set(["NODE_ENV"]);

const args = process.argv.slice(2);
const separatorIndex = args.indexOf("--");
const scriptArgs = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
const forwardedArgs = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

const requestedEnv = scriptArgs[0] && VALID_ENVIRONMENTS.has(scriptArgs[0]) ? scriptArgs[0] : DEFAULT_ENVIRONMENT;
const targetEnvironments = requestedEnv === "all" ? ["development", "preview", "production"] : [requestedEnv];

const remainingArgs = scriptArgs.slice(VALID_ENVIRONMENTS.has(scriptArgs[0] ?? "") ? 1 : 0);
// Split remaining args into env-file paths and passthrough Vercel CLI flags.
const files: string[] = [];
const passthroughArgs: string[] = [];
for (const arg of remainingArgs) {
	if (!arg.startsWith("-") && existsSync(arg)) {
		files.push(arg);
	} else {
		passthroughArgs.push(arg);
	}
}
const vercelArgs = [...passthroughArgs, ...forwardedArgs];
const envFiles = files.length > 0 ? files : DEFAULT_FILES;

if (envFiles.length === 0) {
	console.log("No env files configured for this Vercel stack.");
	process.exit(0);
}

const env = new Map<string, string>();

for (const file of envFiles) {
	if (!existsSync(file)) {
		console.warn(`Skipping missing env file: ${file}`);
		continue;
	}

	for (const [key, value] of Object.entries(dotenv.parse(readFileSync(file, "utf8")))) {
		if (SKIP_KEYS.has(key)) continue;
		env.set(key, value);
	}
}

if (env.size === 0) {
	console.log("No Vercel env vars found to sync.");
	process.exit(0);
}

const LOCAL_VALUE_PATTERN = /localhost|127\.0\.0\.1|0\.0\.0\.0|^file:/i;
const localKeys = [...env.entries()].filter(([, value]) => LOCAL_VALUE_PATTERN.test(value)).map(([key]) => key);
if (localKeys.length > 0) {
	console.warn(
		`Warning: ${localKeys.join(", ")} look${localKeys.length === 1 ? "s" : ""} like local-only value(s). Update them in your .env file(s) and re-run this sync if your deployed app should not point at local endpoints.`,
	);
}

if (!existsSync(".vercel/project.json")) {
	console.info("Notice: Project is not yet linked to Vercel.");
	console.info("Run 'bun x vercel link' first to link this directory with your Vercel project.\n");
}

const envTargetList = targetEnvironments.join(",");
console.log(`Syncing ${env.size} env var(s) to Vercel (${envTargetList})...\n`);

for (const [key, value] of env.entries()) {
	const typeArgs = key.startsWith("VITE_") || key.startsWith("NEXT_PUBLIC_") || key.startsWith("PUBLIC_") ? ["--type", "config"] : [];
	const result = spawnSync(
		VERCEL_COMMAND[0],
		[
			...VERCEL_COMMAND.slice(1),
			"env",
			"add",
			key,
			"--environment",
			envTargetList,
			...typeArgs,
			"--force",
			"--yes",
			"--non-interactive",
			...vercelArgs,
		],
		{
			input: `${value}\n`,
			stdio: ["pipe", "inherit", "inherit"],
			encoding: "utf8",
			shell: process.platform === "win32",
		},
	);

	if (result.error) {
		console.error(`Failed to sync ${key} to ${envTargetList}: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status !== 0) {
		console.error(`Failed to sync ${key} to ${envTargetList}`);
		process.exit(result.status ?? 1);
	}
}

console.log("\n✅ Vercel env sync complete. Redeploy for changes to take effect.");
