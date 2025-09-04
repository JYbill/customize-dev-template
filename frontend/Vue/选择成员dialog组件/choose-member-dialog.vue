<template>
  <div class="choose-member-dialog">
    <el-dialog
        width="50%"
        :before-close="dialogCloseBefore"
        :close-on-click-modal="false"
        title="添加人员"
        :visible="this.$attrs['visible']"
    >

      <!--   添加人员内容   -->
      <el-card shadow="never">
        <div class="continer">

          <!--     选择内容     -->
          <div class="select">
            <!--      搜索      -->
            <el-input v-model="search"
                      placeholder="用户名、职称"
                      :maxlength="12"
                      :clearable="true"
                      @input="searchMembers" />
            <el-checkbox-group
                @change="checkedBox"
                v-model="checkedList">
              <el-checkbox
                  v-for="item in members"
                  :disabled="item.disabled"
                  :label="item.uid"
                  :key="item.key">
                <span class="logo">{{ item.label.substring(0, 1) }}</span>
                <span class="username">{{ item.label }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!--     被选内容     -->
          <div class="selected">
            <div class="header">已选:{{ checkedList.length }}人</div>
            <div class="scroll">
              <div class="selected-item"
                   v-for="item in checkedList"
                   :key="item">
                <span class="logo">{{ getNameByUid(item, 1) }}</span>
                <span class="username">{{ getNameByUid(item) }}</span>
                <i class="el-icon-close" @click="clearSelected(item)"/>
              </div>
            </div>
          </div>
        </div>
      </el-card>
      <!--   确认、取消   -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCloseBefore">取 消</el-button>
        <el-button type="primary"
                   :disabled="disabledBtn"
                   @click="submitDialog"
                   :class="{disabledBtn}">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "choose-member-dialog",
  data() {
    return {
      // 选择的模式枚举
      modeEnum: {
        anchor: 'anchor',
        manager: 'manager',
      },
      // 禁用按钮
      disabledBtn: false,
      // 搜索(姓名、职称)
      search: '',
      // 多选内容列表
      checkedList: [],
      // 成员列表(可变)
      members: [],
    };
  },
  props: {

    // 当前模式：'anchor'、'manager' 两种
    mode: {
      type: String,
      required: true
    },

    // 成员列表(不可变), 镜像模板作用
    memberList: {
      type: Array,
      required: true
    }
  },
  // 自定义v-model
  model: {
    prop: "visible",
    event: "switch"
  },
  watch: {
    memberList(newer) {
      this.members = this.memberList;
    }
  },
  methods: {
    // 关闭dialog
    dialogCloseBefore() {
      this.clearComponentStatus();
    },

    // 确认提交dialog
    submitDialog() {
      this.$emit('submit', this.checkedList);
      this.clearComponentStatus();
    },

    // 搜索输入的成员
    searchMembers() {
      const filter = this.memberList.filter((item) => {
        const flag = item.label.includes(this.search) ||
            item.profession.includes(this.search) ||
            item.uid.includes(this.search);
        return flag;
      });
      this.members = filter;
    },

    // 清理当前选中的成员
    clearSelected(uid) {
      const filterCheckedList = this.checkedList.filter((item) => {
        return item !== uid;
      });
      console.log(filterCheckedList);
      this.checkedList = filterCheckedList;
    },

    // 选择多选框、取消勾选多选框
    checkedBox(list) {
      // console.log(list);
      if (this.mode === this.modeEnum.manager && list.length >= 2) {
        this.$message.warning('管理员只允许选择一个');
        this.checkedList = [list[0]];
      }
    },
    /** util工具开始
     *           ,--.  ,--.,--.
     * ,--.,--.,-'  '-.`--'|  |
     * |  ||  |'-.  .-',--.|  |
     * '  ''  '  |  |  |  ||  |
     *  `----'   `--'  `--'`--'
     */
    getNameByUid(value, length) {
      const member = this.memberList.find((item) => {
        return item.uid === value;
      });
      const name = member.label;
      return name.slice(0, length ? length : name.length);
    },

    clearComponentStatus() {
      this.search = '';
      this.checkedList = [];
      this.members = this.memberList;
      this.$emit('switch', false);
    },
    /**
     *           ,--.  ,--.,--.
     * ,--.,--.,-'  '-.`--'|  |
     * |  ||  |'-.  .-',--.|  |
     * '  ''  '  |  |  |  ||  |
     *  `----'   `--'  `--'`--'
     *  util工具结束
     */
  },
};
</script>

<style lang="scss" scoped>
@import "choose-member-dialog.scss";
</style>