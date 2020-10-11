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
