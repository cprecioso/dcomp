import { Command, Option, runExit } from "clipanion";
import fse from "fs-extra";
import { relative, resolve } from "node:path";

const DEFAULT_INPUT_FILE_NAME = "Compose.mjs";
const DEFAULT_OUTPUT_FILE_NAME = "docker-compose.yml";

class CLIError extends Error {
  constructor(message: string, public readonly errorCode: number) {
    super(message);
  }
}

class BuildCommand extends Command {
  input = Option.String({ name: "input file", required: false });
  output = Option.String("-o,--output", { required: false });

  async getFilePath(input: string | undefined, defaultFileName: string) {
    const path = resolve(process.cwd(), input || ".");
    if ((await fse.stat(path)).isDirectory()) {
      return resolve(path, defaultFileName);
    } else {
      return path;
    }
  }

  async getEnv() {
    const inputFilePath = await this.getFilePath(
      this.input,
      DEFAULT_INPUT_FILE_NAME
    );

    const outputFilePath =
      this.output !== "-" &&
      (await this.getFilePath(this.output, DEFAULT_OUTPUT_FILE_NAME));

    const createOutputStream = outputFilePath
      ? () => fse.createWriteStream(outputFilePath)
      : () => this.context.stdout;

    if (!(await fse.pathExists(inputFilePath))) {
      throw new CLIError(`No such file [${inputFilePath}]`, 1);
    }

    const outputFileDescription = outputFilePath
      ? relative(process.cwd(), outputFilePath)
      : "stdout";
    const inputFileDescription = relative(process.cwd(), inputFilePath);

    return {
      inputFilePath,
      outputFilePath,
      createOutputStream,
      inputFileDescription,
      outputFileDescription,
    };
  }

  async makeBuilder() {
    const env = await this.getEnv();

    const {
      inputFileDescription,
      outputFileDescription,
      inputFilePath,
      createOutputStream,
    } = env;

    const { generate } = await import("@dcomp/generator");
    const { Compose: ComposeEntity } = await import("@dcomp/defs");

    const build = async () => {
      this.context.stderr.write(
        `Building ${inputFileDescription} → ${outputFileDescription}\n`,
        "utf-8"
      );

      const { default: composeDef } = await import(inputFilePath);

      if (!(composeDef instanceof ComposeEntity)) {
        throw new CLIError(
          `\`default\` export from [${inputFileDescription}] is not an instance of \`Compose\` from \`dcomp\` or \`@dcomp/defs\``,
          2
        );
      }

      const composeFile = generate(composeDef);

      const outputStream = createOutputStream();
      outputStream.write(composeFile, "utf-8");
      outputStream.end();
    };

    return { build, env };
  }

  async execute() {
    try {
      const { build } = await this.makeBuilder();
      await build();
      this.context.stderr.write("Done!\n");
    } catch (err) {
      if (err instanceof CLIError) {
        this.context.stderr.write(`Error: ${err.message}\n`);
        return err.errorCode;
      } else {
        throw err;
      }
    }
  }
}

runExit(BuildCommand);
