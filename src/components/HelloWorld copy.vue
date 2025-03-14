<template>
  <div>
    <!-- 上传文件 -->
    <input type="file" @change="handleFileUpload" accept=".xlsx, .xls" />
    <!-- 操作表格 -->
    <button @click="changeTableDel()">新系统格式更改表格</button>
    <!-- 下载按钮 -->
    <button @click="downloadExcel" :disabled="!tableData.length">下载表格</button>
    <el-button type="primary">按钮</el-button>
    <!-- 展示表格数据 -->
    <table v-if="tableData.length">
      <thead>
        <tr>
          <th v-for="(header, index) in tableHeaders" :key="index">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref } from 'vue';
import * as XLSX from 'xlsx';

export default {
  setup() {
    // 表格数据
    const tableData = ref([]);
    // 表头数据
    const tableHeaders = ref([]);
    const name = ref('');

    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      console.log(file.name, 'filefile')
      name.value = file.name
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 提取表头和表格数据
        tableHeaders.value = json[0];
        tableData.value = json.slice(1);
        tableHeaders.value.splice(13, 0, '地址')
        // console.log(tableData.value)
        tableData.value.forEach((item, index) => {
          tableData.value[index].splice(13, 0, item[13] + item[14] + item[15])
        })
        console.log(tableData.value)

      };
      reader.readAsArrayBuffer(file);
    };
    const changeTableDel = () => {
      var arr = [
        '订单编号', '收件人姓名', '联系电话', '地址', '全部商品名称', '商品属性', '商品数量',
        '物流方式1', '物流单号1', '物流方式2', '物流单号2', '物流方式3', '物流单号3', '物流方式4', '物流单号4'
      ];
      var arr1 = JSON.parse(JSON.stringify(tableHeaders.value));
      var arrlength = []
      var newHeader = [];
      var newTable = [];
      arr1.forEach((item, index) => {
        arr.forEach((e) => {
          if (item == e) {
            newHeader.push(item)
            arrlength.push(index)
          }
        })

      })

      const extractFieldsFromProxyArray = (proxyArray, indices) => {
        // 确保输入是一个数组
        if (!Array.isArray(proxyArray)) {
          throw new Error('输入必须是一个数组');
        }

        // 提取指定下标的字段
        return indices.map((index) => proxyArray[index]);
      };
      tableData.value.forEach((item) => {
        var a = extractFieldsFromProxyArray(item, arrlength)
        newTable.push(a)
      })
      tableHeaders.value = newHeader
      tableData.value = newTable

    }
    // // 删除指定列
    // const deleteColumn = (columnIndex) => {

    //   // 删除表头
    //   tableHeaders.value.splice(columnIndex, 1);
    //   // 删除表格数据中的对应列
    //   tableData.value = tableData.value.map((row) => {
    //     row.splice(columnIndex, 1);
    //     return row;
    //   });

    // };

    // 下载 Excel 表格
    const downloadExcel = () => {
      if (tableData.value.length) {
        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        // 将表头和表格数据合并
        const data = [tableHeaders.value, ...tableData.value];
        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // 获取当前日期的月份和日期
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要 +1
        const day = String(date.getDate()).padStart(2, '0'); // 日期
        const time = `${month}.${day}`; // 格式化为 MM-DD
        XLSX.writeFile(workbook, time+'新系统' + name.value);
      } else {
        alert('请先上传 Excel 文件！');
      }
    };

    return {
      tableData,
      tableHeaders,
      handleFileUpload,
      // deleteColumn,
      downloadExcel,
      changeTableDel
    };
  },
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  position: relative;
}

.delete-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 3px 6px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
}

.delete-button:hover {
  background-color: #ff1a1a;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>