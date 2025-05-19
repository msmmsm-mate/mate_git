const getDataUsers = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users')
  const data = sheet.getDataRange().getDisplayValues().slice(1)
  //Logger.log(data)
  return data
}

const getUserLog = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LogUsers');
  const data = sheet.getDataRange().getDisplayValues().slice(1);
  return data
}

const sendForgotPassword = (username) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const user = data.find(row => row[1] === username);
  if (user && user[1]) {
    const msg = `คำขอลืมรหัสผ่านจากผู้ใช้งาน:` +
                `\n👨‍💻 Username: ${user[1]}` +
                `\n🔐 Password: ${user[2]}`;
    const imgUrl = user[7];
    const activeNotifications = getNotificationSettings();
    
    activeNotifications.forEach(setting => {
      sendNotify(msg, setting, imgUrl);
    });
  }
};

const setUserStatus = (userId, isActive) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, 10).setValue(isActive ? 'TRUE' : 'FALSE');
      break;
    }
  }
}

const generateIDMember = (currentIDNumber) => {
  var prefix = 'USER-';
  var paddingSize = 3;
  var number = currentIDNumber.toString();
  while (number.length < paddingSize) {
    number = '0' + number;
  }
  return prefix + number;
}

const saveUser = (obj) => {
  const sheetUsers = SpreadsheetApp.getActive().getSheetByName('Users');
  const lastRowID = sheetUsers.getLastRow();
  var codeUserIDMember = generateIDMember(lastRowID);
  var folder = DriveApp.getFolderById(idfolder);
  var profileUrl = "";

  if (obj.check !== "") {
    var datafile = Utilities.base64Decode(obj.imageDataUrlA.split(',')[1]);
    var blob = Utilities.newBlob(datafile, obj.filetype, obj.filename);
    var file = folder.createFile(blob);
    var fileId = file.getId();
    profileUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  } else {
    profileUrl = obj.profile;
  }
      
      sheetUsers.appendRow(["'" + codeUserIDMember,
                    "'"+obj.registerData5, 
                    "'"+obj.registerData6,
                    "'"+obj.registerData4,  
                    "'"+obj.registerData2,
                    obj.registerData1,
                    obj.registerData3, 
                    profileUrl]);

  return sheetUsers.getRange("A2:G" + sheetUsers.getLastRow()).getValues();
}

const editUser = (obj) => {
  const sheetUsers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheetUsers.getDataRange().getDisplayValues();
  const folder = DriveApp.getFolderById(idfolder);
  let profileUrl = obj.profile;
  let rowIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === obj.registerDataID) {
      rowIndex = i;
      break;
    }
  }

  if (obj.check !== "" && obj.imageDataUrlA.length > 0) {
    const datafile = Utilities.base64Decode(obj.imageDataUrlA.split(',')[1]);
    const blob = Utilities.newBlob(datafile, obj.filetype, obj.filename);
    const file = folder.createFile(blob);
    const fileId = file.getId();
    profileUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    const oldProfile = sheetUsers.getRange(rowIndex + 1, 8).getValue().split('/d/')[1];
    if (oldProfile) {
      DriveApp.getFileById(oldProfile).setTrashed(true);
    }
  }

  if (rowIndex > -1) {
    sheetUsers.getRange(rowIndex + 1, 1, 1, 8).setValues([
      [obj.registerDataID,  
        "'"+obj.registerData5, 
        "'"+obj.registerData6,
        "'"+obj.registerData4,  
        "'"+obj.registerData2,
        obj.registerData1,
        obj.registerData3, 
        profileUrl]
    ]);
  }

  return sheetUsers.getRange("A2:G" + sheetUsers.getLastRow()).getValues();
}

const delRecordU = (record) => {
  const sheetUsers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  const data = sheetUsers.getDataRange().getDisplayValues();
  let rowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === record) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex > -1) {
    const fileDlUser = sheetUsers.getRange(rowIndex + 1, 8).getValue();
    const sigDlUser = sheetUsers.getRange(rowIndex + 1, 9).getValue(); 

    if (fileDlUser.includes("https://lh3.googleusercontent.com/d/")) {
      const fileId = fileDlUser.split('/d/')[1];
      DriveApp.getFileById(fileId).setTrashed(true);
    }

    if (sigDlUser.includes("https://lh3.googleusercontent.com/d/")) {
      const fileId = sigDlUser.split('/d/')[1];
      DriveApp.getFileById(fileId).setTrashed(true);
    }

    sheetUsers.deleteRow(rowIndex + 1);
  }
}

const updateProfile = (obj) => {
  const sheetUsers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheetUsers.getDataRange().getValues();
  var folder = DriveApp.getFolderById(idfolder);
  var profileUrl = "";

  if (obj.check !== "") {
    var datafile = Utilities.base64Decode(obj.imageDataUrl.split(',')[1]);
    var blob = Utilities.newBlob(datafile, obj.filetype, obj.filename);
    var file = folder.createFile(blob);
    var fileId = file.getId();
    profileUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    for (let i = 1; i < data.length; i++) {
      const userValue = data[i][3];
      if (userValue === obj.codeName) {
        const oldprofileValue = data[i][7];
        if (oldprofileValue && oldprofileValue.startsWith("https://lh3.googleusercontent.com/d/") && oldprofileValue !== "https://lh3.googleusercontent.com/d/") {
          let oldprofile = oldprofileValue.split('/d/')[1];
          if (oldprofile) {
            DriveApp.getFileById(oldprofile).setTrashed(true);
          }
        }
        sheetUsers.getRange(i + 1, 8).setValue(profileUrl);
        break;
      }
    }
    return profileUrl;
  } else {
    profileUrl = obj.profileNew;
    return profileUrl;
  }
}

const saveUploadSig = (obj) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  var folderSig = DriveApp.getFolderById(idfolder);

  if (obj.signatureCanvas === "") {
    for (let i = 1; i < data.length; i++) {
      const userValue = data[i][3];
      if (userValue === obj.codeName) {
        const oldUrlSig = data[i][8];
        if (oldUrlSig) {
          const oldSig = oldUrlSig.split('/d/')[1];
          const oldFile = DriveApp.getFileById(oldSig);
          oldFile.setTrashed(true);
          sheet.getRange(i + 1, 9).setValue("");
          break;
        }
      }
    }
    return "";
  } else {
    var datafile2 = Utilities.base64Decode(obj.signatureCanvas.split(',')[1]);
    var blob2 = Utilities.newBlob(datafile2, obj.filetype, obj.filename);
    var fileSig = folderSig.createFile(blob2);
    var sig = fileSig.getId();
    var urlsig = "https://lh3.googleusercontent.com/d/" + sig;

    for (let i = 1; i < data.length; i++) {
      const userValue = data[i][3];
      if (userValue === obj.codeName) {
        const oldUrlSig = data[i][8];
        if (oldUrlSig) {
          const oldSig = oldUrlSig.split('/d/')[1];
          const oldFile = DriveApp.getFileById(oldSig);
          oldFile.setTrashed(true);
        }
        sheet.getRange(i + 1, 9).setValue(urlsig);
        break;
      }
    }
    return urlsig;
  }
}

const changePasswordMember = (obj) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users"); 
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const userValue = data[i][3];
    if (userValue === obj.code) {
      sheet.getRange(i + 1, 3).setValue("'" + obj.password);
      break;
    }
  }
}
