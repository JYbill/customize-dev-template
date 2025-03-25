import { DataType, FunctionType, IndexType, MetricType, type FieldType } from "@zilliz/milvus2-sdk-node";

/**
 * knowledge集合的表结构
 */
export const QuestionSchema = {
  ID: "id",
  CONTENT: "query",

  TYPE: "type",
  FILEPATH: "filepath",
  EMBEDDING: "embedding",

  CONTENT_SPARSE: "contentSparse",
  CURRICULUM_ID: "curriculumId",
  COURSE_ID: "courseId",
  $META: "$meta",
};

/**
 * 默认，输出字段
 */
export const ALL_FIELDS = Object.values(QuestionSchema).filter(
  (field) => ![QuestionSchema.CONTENT_SPARSE, QuestionSchema.EMBEDDING].includes(field),
);
export const KnowledgeFields: FieldType[] = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true,
    nullable: false,
  },
  {
    // 资源类型:
    // 1 文本及各种格式文档转为文本的类型
    // 2 已有的视频音频字幕类型
    // 3 上传的音视频转录的字幕类型
    // 4 问题类型
    name: "type",
    data_type: DataType.Int8,
    nullable: false,
    default_value: 1,
  },
  {
    // 文件解析、音视频解析存在
    name: "filepath",
    data_type: DataType.VarChar,
    max_length: 256,
    nullable: false,
    default_value: "",
  },
  {
    name: "embedding",
    data_type: DataType.FloatVector,
    nullable: false,
    dim: 2560,
  },
  {
    name: "content",
    data_type: DataType.VarChar,
    max_length: 1024, // 256 * 4
    nullable: false,
    enable_analyzer: true,
    enable_match: true,
  },
  {
    name: "contentSparse",
    data_type: DataType.SparseFloatVector,
  },
  {
    name: "curriculumId",
    data_type: DataType.Int32,
    nullable: false,
    default_value: 0,
  },
  {
    name: "courseId",
    data_type: DataType.Int32,
    nullable: false,
    default_value: 0,
  },
];
export const KnowledgeIndexes = [
  {
    field_name: "id",
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: "type",
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: "embedding",
    index_type: IndexType.AUTOINDEX,
    metric_type: MetricType.COSINE,
  },
  {
    field_name: "contentSparse",
    index_type: IndexType.SPARSE_INVERTED_INDEX,
    metric_type: MetricType.BM25,
    params: {
      inverted_index_algo: "DAAT_MAXSCORE",
    },
  },
  {
    field_name: "curriculumId",
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: "courseId",
    index_type: IndexType.STL_SORT,
  },
];
export const functions = [
  {
    name: "text_bm25_emb",
    description: "bm25 function",
    type: FunctionType.BM25,
    input_field_names: ["content"],
    output_field_names: ["contentSparse"],
    params: {},
  },
];
