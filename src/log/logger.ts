import chalk from "chalk";

let space = 0;
export const logger = {
  announce(process: string) {
    console.info("Starting", chalk.underline(process), "...");
    console.log();
    space += 1;
  },
  finish(process: string) {
    space -= 1;
    console.log();
    console.info("Finishing", chalk.underline(process));
    console.log();
    console.log();
  },
  info(message: string) {
    console.info(align(), message);
  },
  details(message: string) {
    logger.info(chalk.gray(chalk.italic(message)));
  },
  result(result: string) {
    logger.info(chalk.green(result));
  },
  output(message: string) {
    logger.info(chalk.gray(message));
  },
  processing(message: string) {
    console.info(align(), "- processing", chalk.blue(message), "...");
  },
  list(messages: string[]) {
    for (const message of messages) {
      console.info(align(), `- `, message);
    }
  },
};

function align() {
  return " ".repeat(space);
}
