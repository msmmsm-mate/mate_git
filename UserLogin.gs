function checkUsers(username, password, userIpAddress, userAgent){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users"); 
  const data = sheet.getDataRange().getValues();

  const browserInfo = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)\/[\d.]+/);
  const osInfo = userAgent.match(/(Windows NT|Windows|Linux|Mac OS|iOS|Android) [\d.]+/);

  for (let i = 1; i < data.length; i++) { 
    if (data[i][1].toLowerCase() === username.toLowerCase() && data[i][2] === password) {
      if (data[i][9] === true) {
        let datauser = {
          uiduser: data[i][0],
          username: data[i][1],
          password: data[i][2],
          fullname: data[i][3],
          department: data[i][4],
          group: data[i][5],
          level: data[i][6],
          imgUser: data[i][7],
          sigUser: data[i][8],
          status: data[i][9],
        };

        const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LogUsers"); 
        logSheet.appendRow(["'" + datauser.username, userIpAddress, browserInfo + " " + osInfo, new Date(), "เข้าสู่ระบบ"]);

        return datauser;
      } else {
        return '⚠️ ชื่อผู้ใช้งานนี้ถูกระงับการใช้งาน';
      }
    } 
  } 
  return '⚠️ ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง';
}

function checkLogoutUsers(username, userIpAddress, userAgent) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LogUsers"); 
  const browserInfo = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)\/[\d.]+/);
  const osInfo = userAgent.match(/(Windows NT|Windows|Linux|Mac OS|iOS|Android|iPhone) [\d.]+/);
  logSheet.appendRow(["'" + username, userIpAddress, browserInfo + " " + osInfo, new Date(), "ออกจากระบบ"]);
}
