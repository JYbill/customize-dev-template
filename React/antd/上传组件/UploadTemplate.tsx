/**
 * @time 2024/4/23
 * @auth xiaoqinvar
 * @desc
 */
import React, {memo, useCallback} from "react";
import type {FC, ReactNode} from "react";
import { UploadChangeParam } from 'antd/es/upload';
import {
    App,
    Button,
    Upload,
    UploadFile,
} from 'antd';
import Style from "./style.less"

interface UploadTemplateProps {
    children?: ReactNode;
}

const UploadTemplate: FC<UploadTemplateProps> = (props) => {
    const {message} = App.useApp();
    const [resFileList, setResFileList] = useState<UploadFile[]>([]); // 资源列表

    // 上传文件:自定义请求钩子
    const uploadRequest = useCallback(async (opts: any) => {
        // body会被插入到resFileList item的response内
        /* 设置进度：opts.onProgress: (event: { percent: number }): void */
        /* 设置错误：opts.onError: (event: Error, body?: Object): void */
        /* 设置成功：onSuccess: (body: Object): void */
        const file = opts.file as File;
        let res;
        try {
            res = await fileApi.upload(file, (evt) => {
                const total: number = evt.total;
                const loaded: number = evt.loaded;
                const percent = (loaded / total) * 100;
                opts.onProgress({percent});
            });
        } catch (err) {
            opts.onError(err);
        }
        opts.onSuccess(res);
    }, []);
    // 上传文件onChange:上传状态改变的钩子
    /* const fileUploadChange = (data: UploadChangeParam<UploadFile<any>>) => {
      const {file, fileList, event} = data;
      if (file.status === "done") {
        console.log('change', file, fileList, event);
      }
    } */
    // 上传文件onPreview属性:点击预览图时的钩子(拦截默认的行为)
    /* const onPreview = (f: UploadFile) => {
      console.log(f.response);
    } */

    return <div>
        <Upload
            accept="audio/*,video/*,image/*,.csv,text/plain,application/vnd.ms-excel,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            fileList={resFileList}
            className={Style.uploadComp}
            itemRender={() => null}
            customRequest={uploadRequest}
            beforeUpload={(file) => {
                const isAllow = [
                    'image',
                    'text/rtf',
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.ms-excel',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'video/mp4',
                    'audio/x-mpeg',
                    'audio/mp3',
                    'audio/mpeg',
                    'audio/x-m4a',
                ].some((type) => {
                    return file.type.match(type);
                });
                if (!isAllow) {
                    message.warning('不支持提交该类型的资源');
                    return Upload.LIST_IGNORE;
                }
            }}
            onChange={(data: UploadChangeParam<UploadFile<any>>) => {
                const {file, fileList, event} = data;
                setResFileList([...fileList]);
            }}
        >
            <Button
                icon={<img className={Style.uploadImg} src="/assets/upload-icon.png" alt=""/>}
            >
                上传新资源
            </Button>
        </Upload>
    </div>;
};

export default memo(UploadTemplate);
