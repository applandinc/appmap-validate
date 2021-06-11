const { format } = require("util");

exports.ExternalError = class ExternalError extends Error {};

exports.assert = (boolean, Error, template, ...values) => {
  if (!boolean) {
    throw new Error(format(template, ...values));
  }
};

exports.assertSuccess = (closure, Error, template, ...values) => {
  try {
    return closure();
  } catch (error) {
    throw new Error(format(template, ...values, error.message));
  }
};
