<template>
  <div class="search-input">
    <el-autocomplete
        placeholder="搜索"
        prefix-icon="el-icon-search"
        :value="search"
        :fetch-suggestions="querySearchAsync"
        :trigger-on-focus="false"
        @input="inputVal"
        popper-class="suggestion"
        @select="selectSuggestion"
    >
      <template v-slot="{ item }">
        <linkmanItem v-if="item.type === 'chat'" :username="item.name" />
        <linkmanItem v-else-if="item.type === 'group'" :username="item.alias" />
      </template>
    </el-autocomplete>
    <el-button icon="el-icon-plus"></el-button>
  </div>
</template>

<script>
import linkmanItem from "components/linkman-item/linkman-item.vue";
export default {
  name: "search-input",
  props: {
    search: String,
    searchSuggestFunc: Function,
  },
  methods: {
    inputVal(val) {
      this.$emit("update:search", val);
    },
    selectSuggestion(item) {
      this.$emit("select", item);
      this.$emit("update:search", "");
    },
    querySearchAsync(query, cb) {
      const suggest = this.searchSuggestFunc(query).map(item => {
        if (item.type === "group") {
          item.value = item.alias;
        } else if (item.type === "chat") {
          item.value = item.name;
        }
        return item;
      });
      cb(suggest);
    }
  },
  components: {
    linkmanItem,
  }
};
</script>

<style lang="scss" scoped>
@import "./search-input.scss";
</style>
