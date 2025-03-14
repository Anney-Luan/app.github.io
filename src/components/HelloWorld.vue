<template>
  <div>

    <div style="display: flex;">
      <el-timeline>
        <el-timeline-item>
          <div style="margin-top: 20px;">
            <el-tag size="large" type="info">第一步</el-tag>
          </div>
          <el-upload action="" :auto-upload="false" :on-change="handleFileUpload" :show-file-list="false">
            <el-button type="primary">上传 Excel 文件</el-button>
          </el-upload>
        </el-timeline-item>
      </el-timeline>

      <el-timeline>
        <el-timeline-item>
          <div style="margin-top: 20px;">
            <el-tag size="large" type="info">第二步</el-tag>
          </div>
          <el-button type="primary" @click="mergeColumns(['所在省', '所在市', '收件地址'], '地址')" :disabled="!tableData.length">

            合并 "所在省"、"所在市"、"收件地址" 列为 "地址"
          </el-button>
        </el-timeline-item>
      </el-timeline>
      <el-timeline>
        <el-timeline-item>
          <div style="margin-top: 20px;">
            <el-tag size="large" type="info">第三步</el-tag>
          </div>

          <el-button @click="keepColumns" type="primary" :disabled="!tableData.length">新系统格式更改表格</el-button>

        </el-timeline-item>
      </el-timeline>
      <el-timeline>
        <el-timeline-item>
          <div style="margin-top: 20px;">
            <el-tag size="large" type="info">第四步</el-tag>
          </div>
          <el-button type="success" @click="downloadExcel" :disabled="!tableData.length">
            下载 Excel 表格
          </el-button>
        </el-timeline-item>
      </el-timeline>

    </div>





    <!-- 展示表格数据 -->
    <el-table :data="tableData" style="width: 100%; margin-top: 20px;" border>
      <el-table-column v-for="(header, index) in tableHeaders" :key="index" :prop="header" :label="header" />
    </el-table>


  </div>
</template>

<script>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import { ElMessage } from 'element-plus';

export default {
  setup() {
    // 表格数据
    const tableData = ref([]);
    // 表头数据
    const tableHeaders = ref([]);
    const arr = ref([
      '订单编号', '收件人姓名', '联系电话', '全部商品名称', '商品属性', '商品数量',
      '物流方式1', '物流单号1', '物流方式2', '物流单号2', '物流方式3', '物流单号3', '物流方式4', '物流单号4', '地址'
    ])
    const name = ref('');
    // 处理文件上传
    const handleFileUpload = (file) => {
      name.value = file.name
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 提取表头和表格数据
        if (json.length > 0) {
          tableHeaders.value = json[0]; // 第一行为表头
          tableData.value = json.slice(1).map((row) => {
            const rowData = {};
            row.forEach((cell, index) => {
              rowData[tableHeaders.value[index]] = cell;
            });
            return rowData;
          });
          ElMessage.success('文件上传成功！');
        } else {
          ElMessage.warning('文件内容为空！');
        }
      };
      reader.readAsArrayBuffer(file.raw);
    };
    // 合并指定列
    const mergeColumns = (columnsToMerge, newColumnName) => {
      // 检查列是否存在
      const missingColumns = columnsToMerge.filter(
        (column) => !tableHeaders.value.includes(column)
      );
      if (missingColumns.length > 0) {
        ElMessage.warning(`未找到列：${missingColumns.join(', ')}`);
        return;
      }

      // 合并列数据
      tableData.value = tableData.value.map((row) => {
        const mergedValue = columnsToMerge
          .map((column) => row[column])
          .join(' '); // 用空格连接列数据
        return {
          ...row,
          [newColumnName]: mergedValue, // 添加新列
        };
      });

      // 更新表头
      tableHeaders.value = tableHeaders.value.filter(
        (header) => !columnsToMerge.includes(header)
      );
      tableHeaders.value.push(newColumnName); // 添加新列名

      // 删除旧列数据
      tableData.value = tableData.value.map((row) => {
        columnsToMerge.forEach((column) => {
          delete row[column];
        });
        return row;
      });

      ElMessage.success(`已将列 ${columnsToMerge.join(', ')} 合并为 ${newColumnName}`);
    };

    // 只保留指定列
    const keepColumns = () => {
      var columnsToKeep = JSON.parse(JSON.stringify(arr.value));
      // 筛选表头
      tableHeaders.value = tableHeaders.value.filter((header) =>
        columnsToKeep.includes(header)
      );

      // 筛选表格数据
      console.log(tableData, 'tableDatatableData')
      var arr1 = tableData.value.map((row) => {
        const newRow = {};
        columnsToKeep.forEach((column) => {
          if (row[column] !== undefined) {
            newRow[column] = row[column];
          }
        });
        return newRow;
      });
      console.log(arr1);

      ElMessage.success(`只保留列：${columnsToKeep.join(', ')}`);
    };

    // 下载 Excel 表格
    const downloadExcel = () => {
      if (tableData.value.length) {
        // 将表头和表格数据合并为一个二维数组
        const data = [
          tableHeaders.value,
          ...tableData.value.map((row) => tableHeaders.value.map((header) => row[header])),
        ];

        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // 获取当前日期的月份和日期
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要 +1
        const day = String(date.getDate()).padStart(2, '0'); // 日期
        const time = `${month}.${day}`; // 格式化为 MM-DD
        XLSX.writeFile(workbook, time + '新系统' + name.value);
        ElMessage.success('文件下载成功！');
      } else {
        ElMessage.warning('请先上传 Excel 文件！');
      }
    };

    return {
      tableData,
      tableHeaders,
      handleFileUpload,
      downloadExcel,
      keepColumns,
      mergeColumns
    };
  },
};
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>