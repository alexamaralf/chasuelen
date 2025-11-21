function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var result = [];

  // Pula cabeçalho (linha 1)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Só adiciona se tiver ID (evita linhas vazias fantasmas)
    if (row[0] !== "") {
      result.push({
        id: row[0],
        nome: row[1],
        tipo: row[2],
        doador: row[3]
      });
    }
  }
  return responseJSON(result);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var body = JSON.parse(e.postData.contents);
  var action = body.action; // 'escolher', 'admin_reset', 'admin_delete', 'admin_add'
  var data = sheet.getDataRange().getValues();

  // --- AÇÃO: ADICIONAR ITEM (ADMIN) ---
  if (action === "admin_add") {
    var maxId = 0;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] > maxId) maxId = data[i][0];
    }
    sheet.appendRow([maxId + 1, body.nome, body.tipo, ""]);
    return responseJSON({ status: "success" });
  }

  // Para as outras ações, precisamos achar o item pelo ID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == body.id) {
      var rowNum = i + 1;

      // --- AÇÃO: ESCOLHER (SITE) ---
      if (action === "escolher") {
        if (data[i][3] !== "") return responseJSON({ status: "error", message: "Já escolhido" });
        sheet.getRange(rowNum, 4).setValue(body.nome);
      }
      
      // --- AÇÃO: LIBERAR/RESETAR (ADMIN) ---
      else if (action === "admin_reset") {
        sheet.getRange(rowNum, 4).setValue("");
      }

      // --- AÇÃO: EXCLUIR (ADMIN) ---
      else if (action === "admin_delete") {
        sheet.deleteRow(rowNum);
      }

      return responseJSON({ status: "success" });
    }
  }
  return responseJSON({ status: "error", message: "Item não encontrado" });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
