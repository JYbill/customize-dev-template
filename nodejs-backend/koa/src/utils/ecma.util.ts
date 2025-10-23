/**
 * @Description: ecma工具，比如数据结构的处理
 * @Date: 2025/5/21 17:14
 */
import type { TreeItem } from "performant-array-to-tree";

export default class ECMAUtil {
  /**
   * 将树结构扁平化为一个数组，且从保证顺序为[父1, 子1, 子2..., 父2, 子1, ...]的顺序
   * @param tree - 需要扁平化的树结构。
   * @param childKey - 用于访问子节点的键（默认为 'children'）。
   * 一个以节点 ID 为键、节点对象为值的 Map。
   */
  static flattenTreeToArray(tree: TreeItem[], childKey: string = "children") {
    const list: TreeItem[] = [];

    function traverse(nodes: TreeItem[]) {
      for (const node of nodes) {
        const children = node[childKey] as TreeItem[];
        delete node[childKey];
        list.push(node);
        if (Array.isArray(children)) {
          traverse(children);
        }
      }
    }

    traverse(tree);
    return list;
  }
}
