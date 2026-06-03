import * as XLSX from 'xlsx';

export const exportToExcel = (data, headers, fileName = 'export') => {
  if (!data || !data.length) return;

  const keys = Object.keys(headers);
  const mappedData = data.map(row => {
    const newRow = {};
    keys.forEach(key => {
      let value = row[key];
      
      if (value === undefined || value === null) {
        value = '';
      } else if (typeof value === 'object') {
        if (value.seconds) {
          value = new Date(value.seconds * 1000).toLocaleString();
        } else {
          value = JSON.stringify(value);
        }
      }
      
      newRow[headers[key]] = value;
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
