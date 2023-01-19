import React, {FC, memo, ReactNode} from "react";

interface LoginProps {
    children?: ReactNode;
}
const Login: FC<LoginProps> = (props) => {

    return (
        <div>login page</div>
    )
}
export default memo(Login);
