export const types = {};

export const openLog = (type) => {
  types[type] = true;
};

export const cloneLog = (type) => {
  types[type] = false;
};

export const printLog = (message, type) => {
  if (types[type] || type === undefined) {
    console.log(message);
  }
};

/**
 * @module deepCopy
 * @description 对象深拷贝
 * @param {object} target - 要拷贝的对象
 * @return {object} 返回拷贝后的对象
 */
export const deepCopy = function (target) {
  function deepCopyPro(tt) {
    if (typeof tt !== 'object') return;
    let newObj = tt instanceof Array ? [] : {};
    for (let item in tt) {
      if (tt.hasOwnProperty(item)) {
        newObj[item] =
          typeof tt[item] === 'object' && tt[item] !== null ? deepCopy(tt[item]) : tt[item];
      }
    }
    return newObj;
  }
  let res = deepCopyPro(target);
  return res;
};
