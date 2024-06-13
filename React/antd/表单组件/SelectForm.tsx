/**
 * @file: SelectForm.tsx
 * @author: xiaoqinvar
 * @desc: 
 * 注意事项1：表单的form.getFieldsValue() 与当前显示的<Form.Item name="">一一对应，如果发现少了某些需要的字段，请检查name属性
 * @dependencies: 
 * @date: 2024-06-13 15:53:53
 */
import React, {useState} from "react";
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  SelectProps,
  Spin,
  Upload,
  UploadFile,
  UploadChangeParam,
} from "antd";
import { CourseEnum } from "@/app.enum";

export default function SelectForm() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [spocOptions, setSpocOptions] = useState<
    { label: string; value: any }[]
  >([{ value: "jack", label: "Jack" }]); // spoc课程列表
  const isFetching = true;

  /**
   * 搜索Select
   */
  const labelRender: SelectProps["labelRender"] = (props) => {
    const { label } = props;
    if (label) {
      return label;
    }
    return <span>当前输入没有对应的选项</span>;
  };

  /**
   * 上传图片
   */
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <div>
      <Form
        form={form}
        autoComplete="off"
        labelAlign="left"
        labelCol={{ span: 6 }}
        colon={false}
        initialValues={{ type: CourseEnum.SPOC, name: "" }}
        /* 表单校验失败钩子 */
        onFinishFailed={({ values, errorFields, outOfDate }) => {
          message.warning("请将表单填写完整");
        }}
        /* 表单校验通过的钩子 */
        onFinish={(data) => {
        }}
      >
        <Form.Item
          /* 返回true即更新子组件 */
          shouldUpdate={(prevValues, curValues) =>
            curValues.type !== prevValues.type
          }
        >
          {() => {
            const type = form.getFieldValue("type");
            // 两种情况
            return type === CourseEnum.HREF ? (
              <Form.Item
                label="课程名称"
                name="name"
                labelCol={{ span: 6 }}
                rules={[{ required: true, message: "请输入课程名称!" }]}
              >
                <Input placeholder="请输入课程名称" />
              </Form.Item>
            ) : (
              <Form.Item
                label="课程"
                name="name"
                labelCol={{ span: 6 }}
                rules={[{ required: true, message: "请选择SPOC课程!" }]}
              >
                <Select
                  placeholder="请从校方认证SPOC中选取课程"
                  showSearch
                  allowClear
                  filterOption={
                    false
                  } /* 默认开启关键字过滤选项，会和远程搜索有冲突 */
                  onChange={(value) => form.setFieldValue("name", value)}
                  /* 搜索钩子 */
                  onSearch={(search: string) => {
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        setSpocOptions([
                          {
                            label: `语文课`,
                            value: 123,
                          },
                        ]);
                        resolve("ok");
                      }, 500);
                    });
                  }}
                  labelRender={labelRender}
                  notFoundContent={isFetching ? <Spin size="small" /> : null}
                  options={spocOptions}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
            label="图片"
            name="cover"
            valuePropName="fileList"
            /* 从子组件的onChange事件中获取子元素的值 */
            getValueFromEvent={(e: any) => {
                if (Array.isArray(e)) {
                return e;
                }
                return e?.fileList.response?.url;
            }}
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <Upload
              accept="image/*"
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                if (!file.type.includes('image')) {
                  message.warning('请上传一张图片封面');
                  return Upload.LIST_IGNORE;
                }
              }}
            >
              <Button
                icon={<img src="/assets/upload-icon.png" alt="" />}
              >
                上传图片
              </Button>
            </Upload>
          </Form.Item>
      </Form>
    </div>
  );
}
