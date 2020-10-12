import UseDragSort from './core/mouse-dragsort';
import UseScrollY from './core/mouse-scroll-y';

/*
 * 为mixpad的鼠标事件添加获取path的方法
 * */
MouseEvent.prototype.getPath = function () {
  if (this.path) {
    return this.path;
  } else {
    const target = this.target;
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

export default {
  UseScrollY,
  UseDragSort
};
