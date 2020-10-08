export const isNumber = function (item) {
  return Object.prototype.toString.call(item) === '[object Number]';
};
export const isNumberic = function (item) {
  let _item = Number(item);
  return !isNaN(_item);
};

export const isString = function (item) {
  return Object.prototype.toString.call(item) === '[object String]';
};

export const isArray = function (item) {
  return Object.prototype.toString.call(item) === '[object Array]';
};

export const isDate = function (item) {
  return Object.prototype.toString.call(item) === '[object Date]';
};

export const isFunction = function (item) {
  return Object.prototype.toString.call(item) === '[object Function]';
};

export const isObject = function (item) {
  return Object.prototype.toString.call(item) === '[object Object]';
};

export const isBoolean = function (item) {
  return Object.prototype.toString.call(item) === '[object Boolean]';
};

export const isRegExp = function (item) {
  return Object.prototype.toString.call(item) === '[object RegExp]';
};

export const isNull = function (item) {
  return Object.prototype.toString.call(item) === '[object Null]';
};

export const isUndefined = function (item) {
  return Object.prototype.toString.call(item) === '[object Undefined]';
};
