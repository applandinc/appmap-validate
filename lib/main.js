const { parse: yaml } = require("yaml");
const Ajv = require("ajv");
const { readFileSync } = require("fs");
const { ExternalError, assert, assertSuccess } = require("./assert.js");

const versions = new Map([
  ["1.6", "1-6-0"],
  ["1.6.0", "1-6-0"],
]);

const keys = Array.from(versions.keys());

const ajv = new Ajv();

const cache = new Map();

const makeDesignator = JSON.stringify;

exports.main = (options) => {
  // Normalize options //
  options = {
    path: null,
    data: null,
    version: "1.6.0",
    ...options,
  };
  assert(
    typeof options.version === "string" && versions.has(options.version),
    ExternalError,
    "invalid version %o, it should be one of: %o",
    options.version,
    keys
  );
  options.version = versions.get(options.version);
  assert(
    (options.path === null) !== (options.data === null),
    ExternalError,
    `either path or data must be provided, got: path = %o and data = %o`,
    options.path,
    options.data
  );
  if (options.path !== null) {
    options.data = assertSuccess(
      () => JSON.parse(readFileSync(options.path, "utf8")),
      ExternalError,
      `could not read or parse file %o >> %s`,
      options.path
    );
  }
  // Validate against json schema //
  if (!cache.has(options.version)) {
    ajv.addSchema(
      yaml(
        readFileSync(`${__dirname}/../schema/${options.version}.yml`, "utf8")
      )
    );
    cache.set(options.version, ajv.getSchema(`appmap-${options.version}`));
  }
  const validate = cache.get(options.version);
  assert(
    validate(options.data),
    ExternalError,
    "appmap failed schema validation >> %s %s",
    validate.errors?.[0].schemaPath,
    validate.errors?.[0].message
  );
  const events = options.data.events;
  // Verify the unicity of code object //
  const designators = new Set();
  const collectDesignator = (entity, parent) => {
    if (entity.type === "function") {
      assert(
        parent !== null,
        Error,
        "this appmap should not have passed ajv (function code objects should not appear at the top-level)"
      );
      const designator = makeDesignator({
        location: entity.location,
        static: entity.static,
        method_id: entity.name,
        defined_class: parent.name,
      });
      assert(
        !designators.has(designator),
        ExternalError,
        "detected a function code object clash in the classMap: %o",
        entity
      );
      designators.add(designator);
    } else {
      for (let child of entity.children) {
        collectDesignator(child, entity);
      }
    }
  };
  for (let entity of options.data.classMap) {
    collectDesignator(entity, null);
  }
  // Verify the unicity of event.id and event.parent_id //
  for (let index1 = 0; index1 < events.length; index1 += 1) {
    const event1 = events[index1];
    for (let index2 = index1 + 1; index2 < events.length; index2 += 1) {
      const event2 = events[index2];
      assert(
        event1.id !== event2.id,
        ExternalError,
        "duplicate event id between #%i and #%i (ie between %o and %o)",
        index1,
        index2,
        event1,
        event2
      );
      if (event1.event == "return" && event2.event === "return") {
        assert(
          event1.parent_id !== event2.parent_id,
          ExternalError,
          "duplicate event parent_id between #%i and #%i (ie between %o and %o)",
          index1,
          index2,
          event1,
          event2
        );
      }
    }
  }
  // Verify that
  //   - each return event is matched by a call event
  //   - each function call event matches a code object
  for (let index1 = 0; index1 < events.length; index1 += 1) {
    const event1 = events[index1];
    if (event1.event === "call") {
      if (Reflect.getOwnPropertyDescriptor(event1, "method_id")) {
        assert(
          designators.has(
            makeDesignator({
              location: `${event1.path}:${event1.lineno}`,
              static: event1.static,
              method_id: event1.method_id,
              defined_class: event1.defined_class,
            })
          ),
          ExternalError,
          "could not find a match in the classMap for the function code object #i (#o)",
          index1,
          event1
        );
      }
    } else {
      assert(
        event1.event === "return",
        Error,
        "this appmap should not have passed ajv"
      );
      assert(
        events.some((event2) => event1.id === event2.parent_id),
        ExternalError,
        "missing matching call event for #%i (%o)",
        index1,
        event1
      );
    }
  }
};
