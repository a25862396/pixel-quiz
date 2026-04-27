function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    const count = parseInt(e.parameter.count) || 5;
    return ContentService.createTextOutput(JSON.stringify(getRandomQuestions(count)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const passThreshold = data.passThreshold || 3;
    const questionCount = data.questionCount || 5;
    const result = calculateScoreAndSave(data.userId, data.answers, passThreshold, questionCount);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getRandomQuestions(count) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
  const data = sheet.getDataRange().getValues();
  
  // 移除標題列
  const headers = data.shift();
  
  // 隨機打亂題目
  const shuffled = data.sort(() => 0.5 - Math.random());
  
  // 取前 count 題 (不回傳解答欄位, 假設解答在最後一欄索引為 6)
  const selected = shuffled.slice(0, count).map(row => {
    return {
      id: row[0],
      question: row[1],
      options: [row[2], row[3], row[4], row[5]]
    };
  });
  
  return selected;
}

function calculateScoreAndSave(userId, userAnswers, passThreshold, questionCount) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("題目");
  const data = sheet.getDataRange().getValues();
  data.shift(); // 移除標題
  
  // 建立解答字典
  const answerDict = {};
  data.forEach(row => {
    answerDict[row[0]] = row[6]; // id -> 解答
  });
  
  // 計算分數與對錯明細
  let correctCount = 0;
  const reviewData = [];
  userAnswers.forEach(ans => {
    const isCorrect = answerDict[ans.qId] === ans.answer;
    if (isCorrect) {
      correctCount++;
    }
    reviewData.push({
      qId: ans.qId,
      correctAnswer: answerDict[ans.qId],
      isCorrect: isCorrect
    });
  });
  
  const score = Math.round((correctCount / questionCount) * 100);
  const isPassed = correctCount >= passThreshold;
  
  // 寫入紀錄
  saveRecord(userId, score, isPassed);
  
  return {
    score: score,
    correctCount: correctCount,
    isPassed: isPassed,
    reviewData: reviewData
  };
}

function saveRecord(userId, score, isPassed) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("回答");
  const data = sheet.getDataRange().getValues();
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == userId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const now = new Date();
  
  if (rowIndex !== -1) {
    // 已存在的玩家
    const range = sheet.getRange(rowIndex, 1, 1, 7);
    const rowData = range.getValues()[0];
    
    const playCount = rowData[1] + 1;
    const totalScore = rowData[2] + score;
    const highScore = Math.max(rowData[3], score);
    
    // 如果之前沒通關過，且這次通關了，才更新
    let firstPassScore = rowData[4];
    let passAttempts = rowData[5];
    
    if (!firstPassScore && isPassed) {
      firstPassScore = score;
      passAttempts = playCount;
    }
    
    range.setValues([[userId, playCount, totalScore, highScore, firstPassScore, passAttempts, now]]);
  } else {
    // 新玩家
    const playCount = 1;
    const firstPassScore = isPassed ? score : "";
    const passAttempts = isPassed ? 1 : "";
    
    sheet.appendRow([userId, playCount, score, score, firstPassScore, passAttempts, now]);
  }
}
