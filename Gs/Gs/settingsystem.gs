const settingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
const idfolder = settingSheet.getRange('B1').getDisplayValue();
const idfolderCar = settingSheet.getRange('B2').getDisplayValue();
const slideDataCar = settingSheet.getRange('B3').getDisplayValue();
const sheetData = settingSheet.getRange('B4').getDisplayValue();
const sheetDataSet = settingSheet.getRange('B5').getDisplayValue();
const logoUrl = settingSheet.getRange('B6').getDisplayValue();
const nameSystem = settingSheet.getRange('B7').getDisplayValue();


const getSet = () => {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  var data = ss.getRange("B1:B").getDisplayValues();
  return data;
}

const getLineSet = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Setting');
  const data = sheet.getRange('A1:B' + sheet.getLastRow()).getValues();

  const settings = {};

  data.forEach(row => {
    const key = row[0];
    const value = row[1];
    settings[key] = value;
  });

  return settings;
};

const settingGS = (data) => {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Setting');
  var valuesToSet = [];
  for (let i = 1; i <= 8; i++) {
    valuesToSet.push([data[`set${i}`]]);
  }
  var range = sheet.getRange(1, 2, valuesToSet.length, 1);
  range.setValues(valuesToSet);
}

const selectDataFromSheet = (sheetName) => {
  var sheet = SpreadsheetApp.openById(sheetDataSet).getSheetByName(sheetName);
  var getLastRow = sheet.getLastRow();
  var data = sheet.getRange(2, 2, getLastRow - 1, 1).getValues().flat();
  return data;
}

const selectDepartment = () => selectDataFromSheet("Department");
const selectGroup = () => selectDataFromSheet("Group");
const selectObjectiveType = () => selectDataFromSheet("ObjectiveType");
const selectTypeCars = () => selectDataFromSheet("TypeCars");
const selectClassCars = () => selectDataFromSheet("ClassCars");

const getTodos = (sheetName) => {
  var sheet = SpreadsheetApp.openById(sheetDataSet).getSheetByName(sheetName);
  var data = sheet.getRange('B2:B' + sheet.getLastRow()).getValues();
  return data.flat().filter(Boolean);
}

const saveTodos = (data) => {
  var sheet = SpreadsheetApp.openById(sheetDataSet).getSheetByName(data.sheetName);
  sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).clearContent();
  data.todos.forEach((todo, index) => {
    sheet.getRange(index + 2, 2).setValue(todo);
  });
}

const getsetMenuItems = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UsersMenu");
  const data = sheet.getDataRange().getDisplayValues().slice(1);
  return data;
}

const updateMenuCarsStatus = (index, role, isChecked) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UsersMenu");
  const range = sheet.getRange(index + 2, role === 'SuperAdmin' ? 2 : role === 'Admin' ? 3 : role === 'SuperUser' ? 4 : 5);
  range.setValue(isChecked ? "TRUE" : "FALSE");
}


const getMenuItems = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("UsersMenu");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const menuItems = {};

  for (let i = 1; i < data.length; i++) {
    const item = data[i][0];
    menuItems[item] = {};
    for (let j = 1; j < headers.length; j++) {
      const cellValue = data[i][j] ? String(data[i][j]).toUpperCase() : "FALSE";
      menuItems[item][headers[j]] = cellValue === "TRUE";
    }
  }
  return menuItems;
}

const cloundChat = (obj) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Chat");
  const data = sheet.getDataRange().getValues();

  for (let i = 0; i < data.length; i++) {
    const chatRoomValue = data[i][0];
    if (chatRoomValue == obj.roomId) {
      sheet.getRange(i + 1, 2).setValue(obj.msg);
      sheet.getRange(i + 1, 3).setValue("0");
      sheet.getRange(i + 1, 4).setValue(new Date()) ;
      break;
    }
  }
  return;
};

function shortenURL(longURL) {
  var apiUrl = "http://tinyurl.com/api-create.php?url=" + encodeURI(longURL);
  var response = UrlFetchApp.fetch(apiUrl);
  return response.getContentText();
}

function getNotificationSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Notification');
  const data = sheet.getDataRange().getValues();
  const settings = [];
  
  for (let i = 1; i < data.length; i++) {
    settings.push({
      id: String(data[i][0]),
      type: data[i][1],
      token: data[i][2],
      chatId: data[i][3],
      status: data[i][4]
    });
  }

  return settings.filter(setting => setting.status === true);
}

function sendNotify(msg, setting, imageUrls = []) {
  const validImageUrls = imageUrls.filter(url => url && url.trim() !== "");

  if (setting.id === "1") {  // MessagingAPI
    if (validImageUrls.length > 0) {
      let payloadJson = {
        "to": setting.chatId,
        "messages": [
          {
            "type": "text",
            "text": msg
          },
          {
            "type": "image",
            "originalContentUrl": validImageUrls[0],
            "previewImageUrl": validImageUrls[0]
          }
        ]
      };
      let options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payloadJson),
        "headers": {
          "Authorization": "Bearer " + setting.token
        }
      };
      UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
    } else {
      let payloadJson = {
        "to": setting.chatId,
        "messages": [
          {
            "type": "text",
            "text": msg
          }
        ]
      };
      let options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payloadJson),
        "headers": {
          "Authorization": "Bearer " + setting.token
        }
      };
      UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
    }
  } 
  else if (setting.id === "2") { // Telegram
    if (validImageUrls.length > 0) {
      validImageUrls.forEach((imageUrl, index) => {
        let payloadJson = {
          "chat_id": setting.chatId,
          "photo": imageUrl,
          "caption": index === 0 ? msg : "",
          "parse_mode": "Markdown"
        };
        let options = {
          "method": "post",
          "contentType": "application/json",
          "payload": JSON.stringify(payloadJson)
        };
        UrlFetchApp.fetch("https://api.telegram.org/bot" + setting.token + "/sendPhoto", options);
      });
    } else {
      let payloadJson = {
        "chat_id": setting.chatId,
        "text": msg,
        "parse_mode": "Markdown"
      };
      let options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payloadJson)
      };
      UrlFetchApp.fetch("https://api.telegram.org/bot" + setting.token + "/sendMessage", options);
    }
  } 
  else if (setting.id === "3") { // Discord
    let payloadJson = {
      "content": msg
    };
    if (validImageUrls.length > 0) {
      payloadJson.embeds = validImageUrls.map(url => ({
        "image": {
          "url": url
        }
      }));
    }
    let options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payloadJson)
    };
    UrlFetchApp.fetch(setting.token, options);
  }
}

// function sendNotify(msg, tokens, imgUrl) {
//     let payloadJson = {
//         "message": msg
//     };
//     if (imgUrl) {
//         payloadJson.imageThumbnail = imgUrl;
//         payloadJson.imageFullsize = imgUrl;
//     }
//     let options = {
//         "method": "post",
//         "payload": payloadJson,
//         "headers": {
//             "Authorization": "Bearer " + tokens
//         }
//     };
//     UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
// }
