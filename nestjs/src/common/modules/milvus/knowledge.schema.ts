import { DataType, FunctionType, IndexType, MetricType, type FieldType } from "@zilliz/milvus2-sdk-node";

/**
 * knowledge集合的表结构
 */
export const KnowledgeSchema = {
  ID: "id",
  TYPE: "type",
  FILEPATH: "filepath",
  EMBEDDING: "embedding",
  CONTENT: "content",
  CONTENT_SPARSE: "contentSparse",
  CURRICULUM_ID: "curriculumId",
  COURSE_ID: "courseId",
  $META: "$meta",
};

/**
 * 默认，输出字段
 */
export const ALL_FIELDS = Object.values(KnowledgeSchema).filter(
  (field) => ![KnowledgeSchema.CONTENT_SPARSE, KnowledgeSchema.EMBEDDING].includes(field),
);
export const KnowledgeFields: FieldType[] = [
  {
    name: KnowledgeSchema.ID,
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
    name: KnowledgeSchema.TYPE,
    data_type: DataType.Int8,
    nullable: false,
    default_value: 1,
  },
  {
    // 文件解析、音视频解析存在
    name: KnowledgeSchema.FILEPATH,
    data_type: DataType.VarChar,
    max_length: 256,
    nullable: false,
    default_value: "",
  },
  {
    name: KnowledgeSchema.EMBEDDING,
    data_type: DataType.FloatVector,
    nullable: false,
    dim: 2560,
  },
  {
    name: KnowledgeSchema.CONTENT,
    data_type: DataType.VarChar,
    max_length: 1024, // 256 * 4
    nullable: false,
    enable_analyzer: true,
    enable_match: true,
  },
  {
    name: KnowledgeSchema.CONTENT_SPARSE,
    data_type: DataType.SparseFloatVector,
  },
  {
    name: KnowledgeSchema.CURRICULUM_ID,
    data_type: DataType.Int32,
    nullable: false,
    default_value: 0,
  },
  {
    name: KnowledgeSchema.COURSE_ID,
    data_type: DataType.Int32,
    nullable: false,
    default_value: 0,
  },
];
export const KnowledgeIndexes = [
  {
    field_name: KnowledgeSchema.ID,
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: KnowledgeSchema.TYPE,
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: KnowledgeSchema.EMBEDDING,
    index_type: IndexType.AUTOINDEX,
    metric_type: MetricType.COSINE,
  },
  {
    field_name: KnowledgeSchema.CONTENT_SPARSE,
    index_type: IndexType.SPARSE_INVERTED_INDEX,
    metric_type: MetricType.BM25,
    params: {
      inverted_index_algo: "DAAT_MAXSCORE",
    },
  },
  {
    field_name: KnowledgeSchema.CURRICULUM_ID,
    index_type: IndexType.STL_SORT,
  },
  {
    field_name: KnowledgeSchema.COURSE_ID,
    index_type: IndexType.STL_SORT,
  },
];
export const functions = [
  {
    name: "text_bm25_emb",
    description: "bm25 function",
    type: FunctionType.BM25,
    input_field_names: [KnowledgeSchema.CONTENT],
    output_field_names: [KnowledgeSchema.CONTENT_SPARSE],
    params: {},
  },
];
