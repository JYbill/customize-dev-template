<template>
  <div class="login-component">
    <el-dialog
        :visible.sync="dialogVisible"
        :width="width"
        :top="top"
        :modal="modal"
        :close-on-click-modal="false"
    >
      <template slot="title">
        <span class="dialog-title">登陆</span>
      </template>
      <template>
        <div class="login-body">
          <el-form
              :model="loginFrom"
              :rules="loginRule"
              @validate="validateLoginForm"
              ref="loginFormRef"
          >
            <!-- 手机号 -->
            <el-form-item prop="phone" :show-message="false">
              <el-input v-model="loginFrom.phone" placeholder="请输入手机号"/>
            </el-form-item>

            <!-- 验证码 -->
            <el-form-item prop="verifyCode" :show-message="false">
              <el-input
                  v-model="loginFrom.verifyCode"
                  placeholder="请输入验证码"
              />
            </el-form-item>
          </el-form>
          <el-button @click="clickUserLogin">登陆</el-button>
          <span class="verify-code" @click="clickPhoneVerityCode"
          >获取验证码</span
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "login-component",
  props: {
    // 遮罩层, 默认关闭
    modal: {
      type: Boolean,
      default: false
    },

    // 登陆dialog显示属性
    loginDialogVisible: {
      type: Boolean,
      require: true
    },

    // 组件距离顶点的高度
    top: {
      type: String,
      default: "40vh"
    },

    // 宽度
    width: {
      type: String,
      default: "420px"
    },
  },
  data() {
    return {
      // dialog显示属性
      dialogVisible: false,
      // 登陆表单提交数据
      loginFrom: {
        phone: "17683860320",
        verifyCode: "123456",
      },
      // 表单校验数据
      loginRule: {
        phone: [
          {required: true, message: "请输入手机号", trigger: "blur"},
          {
            min: 11,
            max: 11,
            message: "请输入11位手机号",
            trigger: "blur",
          },
          {
            pattern:
                /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        verifyCode: [
          {required: true, message: "请填写验证码", trigger: "blur"},
          {
            min: 4,
            max: 6,
            message: "请填写正确的验证码",
            trigger: "blur",
          },
        ],
      },
    }
  },
  watch: {
    loginDialogVisible: {
      handler(newVal) {
        this.dialogVisible = newVal;
      },
      immediate: true,
    },
    dialogVisible: {
      handler(newVal) {
        this.$emit("update:loginDialogVisible", newVal);
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 组件事件： 表单校验事件hook
     * NOTE: 如果用户验证码输入错误直接点登陆会触发两次，一次blur、一次登陆事件的valid()方法，业务不需要改动可以不用管。
     */
    validateLoginForm(propName, isPass, tip) {
      if (isPass) {
        return;
      }
      // 未通过的验证
      this.$message.error(tip);
    }
    ,

    /**
     * 组件事件：用户登陆
     */
    async clickUserLogin() {
      // 先校验
      const valid = await this.$refs["loginFormRef"].validate().catch((e) => e);
      if (!valid) {
        this.$message.error("请填写正确后再提交");
        return;
      }

      // 校验通过 => 进行登陆
      const phone = this.loginFrom.phone;
      const verifyCode = this.loginFrom.verifyCode;
      this.loginFrom.phone = "";
      this.loginFrom.verifyCode = "";
      this.$emit("login", { phone, verifyCode });
      this.dialogVisible = false;
    }
    ,

    /**
     * 组件事件：发送手机验证码
     */
    clickPhoneVerityCode() {
      // TODO:发送手机验证码
      console.log("TODO: 发送手机验证码");
    }
    ,
  }
  ,
}
</script>

<style lang="scss" scoped>
@import "login-component.scss";
</style>