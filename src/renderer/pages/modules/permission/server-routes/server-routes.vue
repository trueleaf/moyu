
<template>
  <div>
    <!-- 搜索条件 -->
    <SSearch auto-request @change="handleChange">
      <SSearchItem :label="t('名称&地址')" prop="name"></SSearchItem>
      <SSearchItem :label="t('分组名称')" prop="groupName" type="select" :select-enum="groupEnum"></SSearchItem>
      <template #operation>
        <el-button type="success" @click="handleOpenAddRouteDialog">{{ t("新增路由") }}</el-button>
        <el-button :disabled="selectedData.length === 0" type="success" @click="handleOpenMultiEditTypeDialog">{{ t("批量修改类型") }}</el-button>
      </template>
    </SSearch>
    <!-- 表格展示 -->
    <STable ref="table" url="/api/security/server_routes" :res-hook="hookRequest" :paging="false" selection @select="handleSelect">
      <el-table-column :label="t('请求方法')" align="center">
        <template #default="scope">
          <span v-if="scope.row.method === 'get'" class="green">GET</span>
          <span v-else-if="scope.row.method === 'post'" class="orange">POST</span>
          <span v-else-if="scope.row.method === 'put'" class="teal">PUT</span>
          <span v-else-if="scope.row.method === 'delete'" class="red">DELETE</span>
          <span v-else>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="t('路由名称')" align="center"></el-table-column>
      <el-table-column prop="path" :label="t('路由地址')" align="center"></el-table-column>
      <el-table-column prop="groupName" :label="t('分组名称')" align="center"></el-table-column>
      <el-table-column :label="t('操作')" align="center">
        <template #default="scope">
          <el-button link type="primary" text @click.stop="handleOpenServerEditDialog(scope.row)">{{ t("修改") }}</el-button>
          <el-button link type="primary" text @click.stop="handleDeleteServerRoute(scope.row)">{{ t("删除") }}</el-button>
        </template>
      </el-table-column>
    </STable>
    <SAddServerRoute v-if="dialogVisible" v-model="dialogVisible" @success="getData"></SAddServerRoute>
    <SEditServerRoute v-if="dialogVisible2" v-model="dialogVisible2" :edit-data="editData" @success="getData"></SEditServerRoute>
    <SMultiEditServerRoute v-if="dialogVisible3" v-model="dialogVisible3" :edit-data="selectedData" @success="getData"></SMultiEditServerRoute>
  </div>
</template>

<script lang="ts" setup>
import type { Response, PermissionServerRoute } from '@src/types/global'
import SAddServerRoute from './add/add.vue'
import SEditServerRoute from './edit/edit.vue'
import SMultiEditServerRoute from './edit/edit2.vue'
import { ref } from 'vue';

type HookThis = {
  tableData: PermissionServerRoute[],
  total: number,
}

const selectedData = ref<PermissionServerRoute[]>([]); //当前被选中的表单数据
const editData = ref<PermissionServerRoute>({}); //需要编辑的数据
const originTableData = ref<PermissionServerRoute[]>([]); //原始表单数据
const groupEnum = ref<{ id: string, name: string }[]>([]); //分组信息
const dialogVisible = ref(false); //新增路由信息弹窗
const dialogVisible2 = ref(false); //修改路由信息弹窗
const dialogVisible3 = ref(false); //批量修改路由信息弹窗

const table = ref<{ getData: () => void }>();

export default defineComponent({

  data() {
    return {
      selectedData: [] as PermissionServerRoute[], //-----------------当前被选中的表单数据
      editData: {} as PermissionServerRoute, //-----------------------需要编辑的数据
      originTableData: [] as PermissionServerRoute[], //--------------原始表单数据
      groupEnum: [] as { id: string, name: string }[], //---分组信息
      dialogVisible: false, //------------------------------新增路由信息弹窗
      dialogVisible2: false, //-----------------------------修改路由信息弹窗
      dialogVisible3: false, //-----------------------------批量修改路由信息弹窗
    };
  },
  methods: {
    //=====================================数据获取====================================//
    //获取表格数据
    getData() {
      table.value?.getData();
    },
    //搜索数据
    handleChange(params: { name: string, groupName: string }) {
      const { name, groupName } = params;
      this.$refs.table.tableData = this.originTableData.filter((val) => {
        const matchedName = name ? val.name.match(name) : true;
        const matchedPath = name ? val.path.match(name) : true;
        const matchedGroupName = groupName ? val.groupName.match(groupName) : true;
        return (matchedName || matchedPath) && matchedGroupName;
      })
    },
    //获取前端路由信息
    hookRequest(res: Response<PermissionServerRoute[]>, _this: HookThis) {
      this.originTableData = res.data;
      _this.tableData = res.data;
      _this.total = res.data.length;
      const uniqueData = this.uniqueByKey(res.data, 'groupName');
      this.groupEnum = uniqueData.map((v) => ({ id: v.groupName, name: v.groupName })).sort((a, b) => {
        const unicodeOfA = a.name.charCodeAt(0);
        const unicodeOfB = b.name.charCodeAt(0)
        return unicodeOfA - unicodeOfB;
      })
    },
    //=========================================================================//
    handleSelect(routeList: PermissionServerRoute[]) {
      this.selectedData = routeList;
    },
    //删除前端路由组件
    handleDeleteServerRoute(row: PermissionServerRoute) {
      ElMessageBox.confirm(this.t('此操作将永久删除此条记录, 是否继续?'), this.t('提示'), {
        confirmButtonText: this.t('确定'),
        cancelButtonText: this.t('取消'),
        type: 'warning',
      }).then(() => {
        const params = { ids: [row._id] };
        this.axios.delete('/api/security/server_routes', { data: params }).then(() => {
          table.value?.getData();
        }).catch((err) => {
          console.error(err);
        });
      }).catch((err: Error | string) => {
        if (err === 'cancel' || err === 'close') {
          return;
        }
        console.error(err);
      });
    },
    //=====================================其他操作====================================//
    //打开新增前端路由
    handleOpenAddRouteDialog() {
      this.dialogVisible = true;
    },
    //打开修改前端路由
    handleOpenServerEditDialog(row: PermissionServerRoute) {
      this.editData = row;
      this.dialogVisible2 = true;
    },
    //打开批量修改前端路由类型
    handleOpenMultiEditTypeDialog() {
      this.dialogVisible3 = true;
    },
  },
})
</script>

<style lang="scss" scoped>

</style>
