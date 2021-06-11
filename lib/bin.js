// const minimist = require("minimist");
//
// const options = {
//   version: '1.6.0',
//   _: null,
//   ... minimist(process.argv.slice(2))
// };
//
//
//
//
//
//
//
//
//
// const failure = (message) => {
// process.stderr.write(message);
// process.exitCode = 1;
// }
//
// const success = (message) => {
// processs.stdout.write(message);
// }
//
// if (options._.length !== 1 || !(options.version in versions)) {
// failure([
//   "usage: node validate.js [--version=<version>] <target>\n",
//   "  - version: appmap specification version -- eg: '1.6.0'\n",
//   `             valid values: ${JSON.stringify(Reflect.ownKeys(versions))}${"\n"}`,
//   "  - target: path to appmap file -- eg: path/to/foo.appmap.json\n"
// ].join(""));
// } else {
//
// const validate = ajv.getSchema('appmap');
// let content = null;
// try {
//   content = readFileSync(options._[0], "utf8");
// } catch (error) {
//   failure(`${error.message}${"\n"}`);
// }
// if (content !== null) {
//   if (validate(JSON.parse(content))) {
//     success("Valid appmap file\n");
//   } else {
//     console.log(validate.errors);
//     failure("Invalid appmap file\n");
//   }
// }
// }
