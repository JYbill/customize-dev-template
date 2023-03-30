<template>
  <el-dialog
      class="addition-list-dialog"
      :width="width"
      :visible.sync="visible"
      :show-close="false"
      :modal="true"
      :close-on-click-modal="false"
      :before-close="closeHandler"
      @open="dialogOpenHandler">
    <template v-slot:title>
      <div class="header">
        <div class="title">{{ title }}</div>
        <img @click.stop="closeHandler" src="./images/close@2x.png" alt="">
      </div>
    </template>
    <div class="content">

      <!--   搜索框   -->
      <el-input class="search" :class="{isFocus: this.inputFocus}"
                prefix-icon="el-icon-search"
                @input="searchInputHandler"
                @focus="inputFocus = true"
                @blur="inputFocus = false"
                clearable
                v-model="search"
                :placeholder="searchPlaceholder"/>

      <!--   列表   -->
      <div class="list">
        <div
            class="item"
            v-for="item in dataList" :key="item.value"
            @click.stop="itemActiveId = item.value">
          <span class="label text-overflow-1">{{ item.label }}</span>
          <button
              class="submit"
              @click.stop="submitHandler(item.value)">添加</button>
        </div>
      </div>

      <!-- 新建 -->
      <div class="create operation" v-show="isCreate">
        <el-input clearable class="input" v-model="createValue" :placeholder="createPlaceholder"/>
        <button class="submit cancel" @click.stop="isCreate = false">取消</button>
        <button class="submit" @click.stop="submitHandler(createValue)">添加</button>
      </div>
      <div class="create" @click.stop="isCreate = true" v-show="!isCreate">
        <div class="prefix">+</div>
        <span class="title">{{ createTip }}</span>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "addition-list-dialog",
  props: {
    title: String,
    createTip: {
      type: String,
      default: "新建文件"
    },
    createPlaceholder: String,
    searchPlaceholder: String,
    width: {
      type: String,
      default: "450px"
    },
    visible: {
      type: Boolean,
      default: true,
    },
    list: Array,
  },
  data() {
    return {
      inputFocus: false, // input是否聚焦
      search: "",
      itemActiveId: "", // list下的item被点击的id
      dataList: [],

      // 新建相关
      isCreate: false, // 新建状态
      createValue: "",
    };
  },
  watch: {
    list() {
      this.dataList = this.list;
    }
  },
  methods: {

    /**
     * 打开dialog
     */
    dialogOpenHandler() {
      this.dataList = this.list;
    },

    /**
     * 关闭处理器
     */
    closeHandler() {
      this.isCreate = false;
      this.itemActiveId = "";
      this.createValue = "";
      this.search = "";
      this.$emit("update:inputValue", "");
      this.$emit("update:visible", false);
      this.$emit("cancel");
    },

    /**
     * 提交处理器
     */
    submitHandler(value) {
      if (!value) {
        this.$notify.warning("请输入模板名称");
        return;
      }
      this.isCreate = false;
      this.itemActiveId = "";
      this.createValue = "";
      this.search = "";
      this.$emit("submit", value);
      this.$emit("update:visible", false);
    },

    /**
     * 搜索输入：过滤list
     * @param value
     */
    searchInputHandler(value) {
      const regex = new RegExp(`.*${value}.*`);
      this.dataList = this.list.filter(item => regex.test(item.label));
    },
  },
};
</script>

<style scoped lang="scss">
@import "addition-list-dialog";
</style>
