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
      stdin: "piped",
      stderr: "piped",
      stdout: "piped",
    });
    const child = p.spawn();
    const result = await child.output();;
    const decoder = new TextDecoder();

    const stdout = decoder.decode(result.stdout);
    const stderr = decoder.decode(result.stderr);

    child.stdin?.close();
    if (result.success) {
      return new Ok({ stdout, stderr });
    } else {
      return new Err({ stdout, stderr });
    }
  });
}
