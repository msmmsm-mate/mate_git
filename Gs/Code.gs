const doGet = () => {
var page = HtmlService.createTemplateFromFile('index').evaluate()
  .addMetaTag('viewport', 'width=device-width, initial-scale=1')
  .setTitle(nameSystem)
  .setFaviconUrl(logoUrl)
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
return page;
}

const getURL = () => {
  return ScriptApp.getService().getUrl();
}

const include = (filename) => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

const getDataCar = () => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const data = sheet.getDataRange().getDisplayValues().slice(1);
  //Logger.log(data)
  return data;
}

const getCalendarCars = () => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data'); 
  const data = sheet.getDataRange().getDisplayValues();
    let sheetDataCars = [];
    for (let row of data) {
      let newRow = [];
      for (let cell of row) {
        newRow.push(cell);
      }
      sheetDataCars.push(newRow);
    }
    
  let events = [];
  for (let i = 0; i < sheetDataCars.length; i++) {
    let eventData = sheetDataCars[i];
    let event = {
      idevent: eventData[0],
      status: eventData[1],
      dateTime: eventData[2],
      uid: eventData[3],
      name: eventData[4],
      group: eventData[5],
      dpm: eventData[6],
      cars1: eventData[8],
      cars2: eventData[9],
      cars3: eventData[10],
      cars4: eventData[11],
      cars5: eventData[12],
      cars6: eventData[13],
      start: eventData[15],
      end: eventData[16],
      numuser: eventData[19],
      note: eventData[26]
    };
    events.push(event);
  }
  //Logger.log(events)
  return events;
}

const setCarsStatus = (codeId, isActive) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars'); 
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === codeId) {
      sheet.getRange(i + 1, 8).setValue(isActive ? 'TRUE' : 'FALSE');
      break;
    }
  }
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return year + month + day + hours + minutes + seconds;
}

const generateCodeCars = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = 'CAR';
  const currentDate = new Date(); 
  const timestamp = formatDate(currentDate); 
  let key = timestamp + prefix; 
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters[randomIndex];
  }
  return key;
}

const addDataCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data'); 
  const lastRow = sheet.getLastRow();
  const codeID = generateCodeCars(lastRow);
  const currentTime = new Date();
  const formattedDate = Utilities.formatDate(currentTime, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  let rowData;
    rowData = [codeID, "รอตรวจสอบ", formattedDate, obj.carsuid, obj.carsfullname, obj.carsdpm, obj.carsgroup, obj.carssig, obj.dataCars1 , obj.dataCars2, obj.dataCars3, obj.dataCars4, obj.dataCars5, obj.dataCars6, "", "'"+ obj.dataCars7, "'"+ obj.dataCars8, obj.dataCars9,""];
    sheet.appendRow(rowData);

  const msg = `ขอเช่าใช้รถ` +
              `\n🆔 Key: ${codeID}` +   
              `\n🙋 ผู้ขอใช้: ${obj.carsfullname} ${obj.carsgroup} ${obj.carsdpm}` +
              `\n🕒 วันที่ลงระบบ: ${formattedDate}` +
              `\n🚗 ขอเช่าใช้รถ: ${obj.dataCars5} ${obj.dataCars6}`+
              `\n🙋 ชื่อ-สกุล: ${obj.dataCars3}`+
              `\n📅 วันที่เริ่ม: ${obj.dataCars7} ถึงวันที่: ${obj.dataCars8}`;

  const activeNotifications = getNotificationSettings();
  
  activeNotifications.forEach(setting => {
    sendNotify(msg, setting);
  });

  return sheet.getRange("A2:AA" + sheet.getLastRow()).getValues();
}

const upDataCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const data = sheet.getDataRange().getDisplayValues();
  let rowIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === obj.carsKey) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex > -1) {
    sheet.getRange(rowIndex + 1, 9).setValue(obj.dataCars1);
    sheet.getRange(rowIndex + 1, 10).setValue(obj.dataCars2);
    sheet.getRange(rowIndex + 1, 11).setValue(obj.dataCars3);
    sheet.getRange(rowIndex + 1, 12).setValue(obj.dataCars4);
    sheet.getRange(rowIndex + 1, 13).setValue(obj.dataCars5);
    sheet.getRange(rowIndex + 1, 14).setValue(obj.dataCars6);
    sheet.getRange(rowIndex + 1, 16).setValue("'"+ obj.dataCars7);
    sheet.getRange(rowIndex + 1, 17).setValue("'"+ obj.dataCars8);
    sheet.getRange(rowIndex + 1, 18).setValue(obj.dataCars9);
  }

  const msg = `แก้ไขการขอใช้รถ` +
              `\n🆔 Key: ${obj.carsKey}` +   
              `\n🙋 ผู้ขอใช้: ${obj.carsfullname} ${obj.carsgroup} ${obj.carsdpm}` +
              `\n🚗 ขอเช่าใช้รถ: ${obj.dataCars5} ${obj.dataCars6}`+
              `\n🙋 ชื่อ-สกุล: ${obj.dataCars3}`+
              `\n📅 วันที่เริ่ม: ${obj.dataCars7} ถึงวันที่: ${obj.dataCars8}`;

  const activeNotifications = getNotificationSettings();
  
  activeNotifications.forEach(setting => {
    sendNotify(msg, setting);
  });

  return sheet.getRange("A2:AA" + sheet.getLastRow()).getValues();
}

const delDataCars = (codeID) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const data = sheet.getDataRange().getDisplayValues();
  let rowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === codeID) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex > -1) {
    const ucfile = sheet.getRange(rowIndex + 1, 29).getValue();
    if(ucfile !=""){
      DriveApp.getFileById(ucfile.split('/')[5]).setTrashed(true)
    }
    sheet.deleteRow(rowIndex + 1);
  }
}

const addAPDataCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data'); 
  const data = sheet.getDataRange().getValues();
  const currentTime = new Date();
  const formattedDate = Utilities.formatDate(currentTime, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  let rowIndex;
  let pdfLink;

  for (let i = 1; i < data.length; i++) {
    rowIndex = i + 1;
    if (data[i][0] === obj.codeID) {
      sheet.getRange(rowIndex, 2).setValue(obj.carsdata1);
      sheet.getRange(rowIndex, 15).setValue("'"+ obj.carsdata2);
      sheet.getRange(rowIndex, 23).setValue(obj.carsdataname);
      sheet.getRange(rowIndex, 24).setValue(obj.carsdata1);
      sheet.getRange(rowIndex, 25).setValue(formattedDate);
      sheet.getRange(rowIndex, 26).setValue(obj.carsdatasig);
      obj.fullname = data[i][4];
      pdfLink = runCars(rowIndex, obj.codeID);
      sheet.getRange(rowIndex, 28).setValue(pdfLink);
      break;
    }
  }

  const msg = `อนุมัติให้เช่ารถ` +
              `\n🆔 Key: ${obj.codeID}` +
              `\n🙋 เลขที่อนุญาตขับขี่: ${obj.carsdata1}` +    
              `\n🙋 ผู้อนุมัติ: ${obj.carsdataname}` +
              `\n🕒 วันที่ตรวจ: ${formattedDate}` +
              `\n🚗 เลขบัตรประชาชน: ${obj.carsdata2}` +
              `\n📄 เอกสาร: ${pdfLink}`; 

  const activeNotifications = getNotificationSettings();
  
  activeNotifications.forEach(setting => {
    sendNotify(msg, setting);
  });

  return pdfLink;
};



const runCars = (rowIndex, idCars) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const sheetCars = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  let pdfFolder = DriveApp.getFolderById(idfolderCar);

  let oldPdfLink = sheet.getRange(rowIndex, 28).getValue();
  if (oldPdfLink) {
    DriveApp.getFileById(oldPdfLink.split('/')[5]).setTrashed(true);
  }

  let copyFile = DriveApp.getFileById(slideDataCar).makeCopy();
  let copyID = copyFile.getId();
  let copyDoc = SlidesApp.openById(copyID);

  let headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
  let item = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getDisplayValues();

  const startMile = parseFloat(item[0][20]) || 0;
  const returnMile = parseFloat(item[0][21]) || 0;
  const totalDistance = startMile - returnMile;

  const carKey = item[0][11];
  let fuelAmount = "";
  if (carKey) {
    const carsData = sheetCars.getDataRange().getValues();
    const carsRow = carsData.find(row => row[0] === carKey);
    if (carsRow) {
      fuelAmount = carsRow[4] || "";
    }
  }

  let startDate = new Date(item[0][15]);
  let endDate = new Date(item[0][16]);
  let startDateThai = formatThaiDate(startDate);
  let endDateThai = formatThaiDate(endDate);

  const carTypes = {
    "รถยนต์นั่งขนาดกลาง": 1,
    "รถยนต์โดยสารขนาดใหญ่": 2,
    "รถยนต์บรรทุกขนาดใหญ่": 3,
    "รถยนต์โดยสารขนาดเล็ก": 4,
    "รถยนต์บรรทุกขนาดเล็ก": 5,
    "รถเอกซเรย์เคลื่อนที่": 6,
    "รถยนต์นั่งขนาดเล็ก": 7,
    "รถยนต์โดยสารขนาดกลาง": 8,
    "รถยนต์บรรทุกขนาดกลาง": 9
  };

  const apTypes = {
    "อนุมัติ": 1,
    "ไม่อนุมัติ": 2,
    "ยกเลิก": 3
  };

  Object.keys(carTypes).forEach(type => {
    const position = carTypes[type];
    copyDoc.replaceAllText(`{C${position}}`, item[0][12] === type ? "✔" : "");
  });

  Object.keys(apTypes).forEach(type => {
    const position = apTypes[type];
    copyDoc.replaceAllText(`{A${position}}`, item[0][1] === type ? "✔" : "");
  });

  copyDoc.replaceAllText('{startDate}', startDateThai);
  copyDoc.replaceAllText('{endDate}', endDateThai);
  copyDoc.replaceAllText('{ระยะทาง}', totalDistance.toString());
  copyDoc.replaceAllText('{น้ำมัน}', fuelAmount.toString());

  headerRow[0].forEach((header, columnIndex) => {
    copyDoc.replaceAllText('{' + header + '}', item[0][columnIndex]);
  });

  let imagesToReplace = [];
  copyDoc.getSlides().forEach(slide => {
    slide.getImages().forEach(image => {
      let title = image.getTitle();
      headerRow[0].forEach((header, imgIndex) => {
        if (header === title && item[0][imgIndex].length > 0) {
          imagesToReplace.push({ image: image, link: item[0][imgIndex] });
        }
      });
    });
  });

  imagesToReplace.forEach(imageData => {
    imageData.image.replace(imageData.link);
  });

  copyDoc.saveAndClose();
  let newFile = pdfFolder.createFile(copyFile.getAs(MimeType.PDF));
  let pdfView = newFile.setName(idCars + ".PDF").getUrl();
  copyFile.setTrashed(true);

  sheet.getRange(rowIndex, 28).setValue(pdfView);

  return pdfView;
};

const formatThaiDate = (date) => {
  const monthsThai = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const day = date.getDate();
  const month = monthsThai[date.getMonth()];
  const year = date.getFullYear() + 543; // ปี พ.ศ.
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year} เวลา ${hours}:${minutes}`;
}


const updateSendCarData = (keyCar, startMile, returnMile, fuelAmount) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const sheetCars = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  const data = sheet.getDataRange().getValues();
  const dataRow = data.findIndex(row => row[0] === keyCar); 

  if (dataRow !== -1) {
    if (startMile) {
      sheet.getRange(dataRow + 1, 21).setValue(startMile);
    }

    if (returnMile || fuelAmount) {
      if (returnMile) {
        sheet.getRange(dataRow + 1, 22).setValue(returnMile);
      }

      const keyCarInData = data[dataRow][11];
      if (keyCarInData) {
        const carsData = sheetCars.getDataRange().getValues();
        const carsRow = carsData.findIndex(row => row[0] === keyCarInData);
        if (carsRow !== -1) {
          if (returnMile) {
            sheetCars.getRange(carsRow + 1, 4).setValue(returnMile);
          }
          if (fuelAmount) {
            sheetCars.getRange(carsRow + 1, 5).setValue(fuelAmount);
          }

          const checkPDF = sheet.getRange(dataRow + 1, 28).getValue();
          if (checkPDF) {
            try {
              const fileId = checkPDF.split('/')[5];
              const file = DriveApp.getFileById(fileId);
              file.setTrashed(true);
            } catch (e) {
              Logger.log("Error deleting existing PDF: " + e.message);
            }
          }
          const pdfLink = runCars(dataRow + 1, keyCar);
          sheet.getRange(dataRow + 1, 28).setValue(pdfLink);
        }
      }
    }
  }
};

const adduploadFileCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('Data');
  const rows = sheet.getDataRange().getValues();
  const documentFolder = DriveApp.getFolderById(idfolderCar);
  const blob = Utilities.newBlob(Utilities.base64Decode(obj.repairFile), MimeType.PDF, obj.fileName);
  const file = documentFolder.createFile(blob);
  let ucfile = file.getUrl();
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === obj.codeID) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex !== -1) {
    const oldFileUrl = sheet.getRange(rowIndex + 1, 28).getValue();
    if (oldFileUrl) {
      const oldFileId = oldFileUrl.split('/')[5];
      DriveApp.getFileById(oldFileId).setTrashed(true);
    }
    sheet.getRange(rowIndex + 1, 28).setValue(ucfile);
  } else {
    sheet.appendRow([obj.codeID, ucfile]);
  }
};

const getShowCars = () => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  const data = sheet.getDataRange().getDisplayValues().slice(1);
  //Logger.log(data)
  return data;
}

function generateIDShowCars(currentIDShowCars) {
  const prefix = 'CAR';
  const number = currentIDShowCars.toString().padStart(4, '0');
  return `${prefix}${number}`;
}

const addShowCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  const lastRowID = sheet.getLastRow();
  const codeID = generateIDShowCars(lastRowID);
  const documentFolder = DriveApp.getFolderById(idfolderCar);
  const dateParts1 = obj.dataShowCars5.split('-');
  const formattedDate1 = Utilities.formatDate(new Date(dateParts1[0], dateParts1[1] - 1, dateParts1[2]), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const dateParts2 = obj.dataShowCars6.split('-');
  const formattedDate2 = Utilities.formatDate(new Date(dateParts2[0], dateParts2[1] - 1, dateParts2[2]), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  let ucfile = "";
  if(obj.myregisImgShowCars.length > 0){
    let file = documentFolder.createFile(obj.myregisImgShowCars).getId();
    ucfile = "https://lh3.googleusercontent.com/d/" + file;
  }
  const rowData = [codeID, obj.dataShowCars1, obj.dataShowCars2, obj.dataShowCars3, obj.dataShowCars4, formattedDate1, formattedDate2, true, ucfile];
  sheet.appendRow(rowData);

  return sheet.getRange("A2:G" + sheet.getLastRow()).getValues();
}

const updateShowCars = (obj) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  const data = sheet.getDataRange().getDisplayValues();
  const documentFolder = DriveApp.getFolderById(idfolderCar);
  const dateParts1 = obj.dataShowCars5.split('-');
  const formattedDate1 = Utilities.formatDate(new Date(dateParts1[0], dateParts1[1] - 1, dateParts1[2]), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const dateParts2 = obj.dataShowCars6.split('-');
  const formattedDate2 = Utilities.formatDate(new Date(dateParts2[0], dateParts2[1] - 1, dateParts2[2]), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  let rowIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === obj.dataShowCarsKey) {
      rowIndex = i;
      break;
    }
  }

  let ucFile = "";
  if (obj.myregisImgShowCars.length > 0) {
    let newFile = documentFolder.createFile(obj.myregisImgShowCars.setName(obj.dataShowCarsKey));
    ucFile = "https://lh3.googleusercontent.com/d/" + newFile.getId();
    const oldFileUrl = sheet.getRange(rowIndex + 1, 9).getValue();
    const oldFileId = oldFileUrl.split('/d/')[1];
    if (oldFileId) {
      DriveApp.getFileById(oldFileId).setTrashed(true);
    }
    sheet.getRange(rowIndex + 1, 9).setValue(ucFile);
  }
  if(rowIndex > -1){
  sheet.getRange(rowIndex + 1, 2).setValue(obj.dataShowCars1);
  sheet.getRange(rowIndex + 1, 3).setValue(obj.dataShowCars2);
  sheet.getRange(rowIndex + 1, 4).setValue(obj.dataShowCars3);
  sheet.getRange(rowIndex + 1, 5).setValue(obj.dataShowCars4);
  sheet.getRange(rowIndex + 1, 6).setValue(formattedDate1);
  sheet.getRange(rowIndex + 1, 7).setValue(formattedDate2);
  }

  return sheet.getRange("A2:G" + sheet.getLastRow()).getValues();
}

const delDataShowCars = (record) => {
  const sheet = SpreadsheetApp.openById(sheetData).getSheetByName('DataCars');
  const data = sheet.getDataRange().getDisplayValues();
  let rowIndex = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === record) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex > -1) {
    const fileUrl = sheet.getRange(rowIndex + 1, 9).getValue();
    if (fileUrl.includes("https://lh3.googleusercontent.com/d/")) {
      const fileId = fileUrl.split('/d/')[1];
      DriveApp.getFileById(fileId).setTrashed(true);
    }
    sheet.deleteRow(rowIndex + 1);
  }
}
