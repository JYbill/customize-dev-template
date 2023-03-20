export default class ExcelUtil {
  /**
   * 根据dataList、fieldList字段通过Stream导出
   * @param dataList
   * @param fieldList
   * @param writeStream
   */
  async exportByStream(dataList, fieldList, writeStream) {
    // 格式化数据
    dataList = dataList.map((item) => {
      const itemRes = {};
      fieldList.forEach((field) => (itemRes[field] = item[field]));
      return itemRes;
    });

    // 创建Excel
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      stream: writeStream,
      useStyles: true,
      useSharedStrings: true,
    });
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    const sheet = workbook.addWorksheet();

    // 列
    const columnList = fieldList.map((field) => ({
      header: field,
      key: field,
      width: 15,
    }));
    columnList.unshift({
      header: "id",
      key: "id",
      width: 15,
    });
    sheet.columns = columnList;

    // 行
    for (const [index, data] of dataList.entries()) {
      const rowItem = {};
      fieldList.forEach((field) => (rowItem[field] = data[field]));
      rowItem.id = index + 1;
      sheet.addRow(rowItem);
    }

    // 保存
    sheet.commit();
    await workbook.commit();
  }

  /**
   * 根据dataList、fieldList字段通过导出[文件可读流，文件路径]
   * @param dataList
   * @param fieldList
   * @param writeStream
   */
  async exportByFilePath(dataList, fieldList, writeStream) {
    // 格式化数据
    dataList = dataList.map((item) => {
      const itemRes = {};
      fieldList.forEach((field) => (itemRes[field] = item[field]));
      return itemRes;
    });

    // 创建Excel
    const workbook = new Excel.stream.xlsx.WorkbookWriter({
      stream: writeStream,
      useStyles: true,
      useSharedStrings: true,
    });
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    const sheet = workbook.addWorksheet();

    // 列
    const columnList = fieldList.map((field) => ({
      header: field,
      key: field,
      width: 15,
    }));
    columnList.unshift({
      header: "id",
      key: "id",
      width: 15,
    });
    sheet.columns = columnList;

    // 行
    for (const [index, data] of dataList.entries()) {
      const rowItem = {};
      fieldList.forEach((field) => (rowItem[field] = data[field]));
      rowItem.id = index + 1;
      sheet.addRow(rowItem);
    }

    // 保存
    const tmpDirPath = resolve(__dirname, "../public/tmp");
    const randomStr = Date.now();
    const fileName = randomStr + ".xlsx";
    const absolutPath = resolve(tmpDirPath, fileName);
    const fileWriteStream = fs.createWriteStream(absolutPath);
    await workbook.xlsx.write(fileWriteStream);
    const readableSteam = fs.createReadStream(absolutPath);
    return [readableSteam, absolutPath];
  }
}
