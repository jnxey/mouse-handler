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
/*
 * 为mixpad的鼠标事件添加获取path的方法
 * */
export const getPath = (mouseEvent) => {
  if (mouseEvent.path) {
    return mouseEvent.path;
  } else {
    const target = mouseEvent.target;
    let path = [target];
    if (target instanceof Node) {
      let parent = target.parentElement;
      while (parent) {
        path.push(parent);
        parent = parent.parentElement;
      }
      return path;
    } else {
      return path;
    }
  }
};
