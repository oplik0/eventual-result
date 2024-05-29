import { Err, EventualResult, Ok } from "../../lib/mod.ts";

type AllRunOptions = Deno.CommandOptions;
type RunOptions = Omit<AllRunOptions, "stdin" | "stderr" | "stdout">;

type Output = {
  stdout: string;
  stderr: string;
};

/**
 * Run a shell command
 */
export function run(
  cmd: string | URL,
  options: RunOptions,
): EventualResult<Output, Output> {
  return new EventualResult<Output, Output>(async () => {
    const p = new Deno.Command(cmd, {
      ...options,
      stdin: "inherit",
      stderr: "piped",
      stdout: "piped",
    });
    const child = p.spawn();
    const result = await child.status;;
    const decoder = new TextDecoder();

    const output = await p.output();
    const stdout = decoder.decode(output.stdout);
    const stderr = decoder.decode(output.stderr);

    if (result.success) {
      return new Ok({ stdout, stderr });
    } else {
      return new Err({ stdout, stderr });
    }
  });
}
