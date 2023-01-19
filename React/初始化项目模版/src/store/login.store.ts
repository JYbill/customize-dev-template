import { createSlice } from "@reduxjs/toolkit";

// 这样定义可以让推断更准确，如果是一个元组类型，ts类型可以更精确的提示类型，否则只会返回一个数组类型！
interface IInitState {
}
const initialState: IInitState = {
};
const counterReducer = createSlice({
    initialState,
    name: "loginReducer",
    reducers: {
    },
});

export default counterReducer.reducer;
// export const {  } = counterReducer.actions;
