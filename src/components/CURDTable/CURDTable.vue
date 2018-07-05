<template>
  <div>
    <el-table :data="rows" :key='key' border fit highlight-current-row style="width: 100%">
      <!-- <el-table-column prop="name" label="fdssfd" width="180"></el-table-column> -->
      <el-table-column :key='item' v-for='item in columns' :label="item.title">
        <template slot-scope="scope">
          {{scope.row[item.field]}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props:{
      rows: {
        default: [],
        required:true
      },
      name: {
        default:'curdtable'
      },
      columns: {
        default: []
      },
      title: {
        default: ''
      }
  },
  data() {
    return {
      key: 1
    }
  },
  watch: {
    change(){

    }
  }
}
</script>

