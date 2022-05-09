/**
 * @time 2022/5/7 11:44
 * @author xiaoqinvar
 * @desc TRTC SDK工具类
 * @dependence trtc-js-sdk 自带.d.ts文件
 */
import { Client, Stream } from "trtc-js-sdk";
export declare class TrtcUtil {
    /**
     * trtc 关闭客户端和流
     * @param client 客户端
     * @param stream 本地流
     */
    static trtcClientStreamClear(client: Client, stream?: Stream): Promise<void>;
}
