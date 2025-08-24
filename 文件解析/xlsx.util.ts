import * as Xlsx from "xlsx";
import fs from "node:fs";

// 为Xlsx提供读取写入的能力
Xlsx.set_fs(fs);

/**
 * 大部分类型来源于xlsx类型定义
 * @desc 文档参考：[xlsx - array-output](https://docs.sheetjs.com/docs/api/utilities/array/#array-output)
 */
export type LoadExcelByPathParams = {
  path: string;
  header: string[]; // 数组每一个元素对应每一列的key
  sheetIdx?: number; // 获取xlsx工作薄的索引，默认获取全部
  raw?: boolean; // 默认为原始值，为true则表示格式化字符串
  defval?: string | null | undefined | number | boolean; // 默认值，如果单元格没有值，则使用此默认值

  /**
   * 读取范围
   *
   * 如果是number，则表示[n, 结束行]
   *
   * 如果是string, 则表示单元格框选的范围"A1:D10"表示读取A、B、C、D四列，1-10行
   */
  range?: number | string;
};

export class XlsxUtil {
 
   /**
   * 加载excel文件内容
   *
   * - 使用方法
   * 1. 先定义好类型
   * ```ts
   * type GradeExcelData = {
   *   name: string;
   *   studentNumber: string;
   *   score: number;
   * };
   * ```
   * 2. 使用
   * ```ts
   * const data = Export.loadExcelByPath<GradeExcelData[]>({
   *   path: "/Users/xiaoqinvar/Downloads/自定义成绩.xlsx",
   *   header: ["name", "studentNumber", "score"],
   *   sheetIdx: 0,
   * });
   * ```
   */
  static loadExcelByPath<T = unknown>(params: LoadExcelByPathParams): T {
    const { path, header, sheetIdx, raw, range, defval = null } = params;
    const workBook = Xlsx.readFile(path);
    const matrix = workBook.SheetNames.map((name) => {
      const sheet = workBook.Sheets[name];
      const data = XLSX.utils.sheet_to_json(sheet, {
        raw,
        header,
        defval,
        range,
      });
      return data;
    });

    if (Number.isInteger(sheetIdx)) {
      // 制定了sheetIdx，返回指定的工作表数据
      return matrix[sheetIdx!] as T;
    }

    return matrix as T;
  }   // 这里是一些工具方法
}