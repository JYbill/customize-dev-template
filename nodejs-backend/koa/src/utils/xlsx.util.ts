import * as Xlsx from "xlsx";

import fs from "node:fs";

import type { LoadExcelByPathParams } from "#types/util.d.ts";

// 为Xlsx提供读取写入的能力
Xlsx.set_fs(fs);

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
      const data = Xlsx.utils.sheet_to_json(sheet, {
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
  }
}
