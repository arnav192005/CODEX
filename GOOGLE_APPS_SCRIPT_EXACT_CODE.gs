const SHEET_NAME = 'Sheet1';
const UPLOADS_SHEET_NAME = 'Uploads';
const SPREADSHEET_ID = '1rVO92e83uj0DNZjobcCrWdcU3GPYv2JBL4iNYml9hfA';
const DRIVE_FOLDER_ID = '1lk-AoXYU_W5irHtLyPLG9uybXU6M0P6T';

const USER_HEADERS = [
  'id',
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
  'department',
  'semester',
  'collegeIdNo',
  'college',
  'mobileNo',
  'gender',
  'permanentAddress',
  'createdAt'
];

const UPLOAD_HEADERS = [
  'id',
  'fileId',
  'fileName',
  'fileType',
  'fileSize',
  'uploadedByName',
  'uploadedByEmail',
  'uploadedByUsername',
  'uploadedAt',
  'viewUrl',
  'downloadUrl'
];

function doGet(e) {
  try {
    const action = ((e && e.parameter && e.parameter.action) || '').toLowerCase();

    if (action === 'getusers') {
      const users = getUsers_();
      return json_({ status: 'success', data: users, count: users.length });
    }

    if (action === 'getuploads') {
      const uploads = getUploads_();
      return json_({ status: 'success', data: uploads, count: uploads.length });
    }

    if (action === 'saveuser') {
      const payload = parsePayload_(e);
      const user = normalizeUser_(payload);

      if (!user.email) {
        return json_({ status: 'error', message: 'Email is required.' });
      }

      const sheet = getOrCreateSheet_();
      sheet.appendRow([
        user.id,
        user.firstName,
        user.lastName,
        user.username,
        user.email,
        user.password,
        user.department,
        user.semester,
        user.collegeIdNo,
        user.college,
        user.mobileNo,
        user.gender,
        user.permanentAddress,
        user.createdAt
      ]);

      return json_({ status: 'success', message: 'User saved to Google Sheet.', id: user.id });
    }

    if (action === 'migratepasswords') {
      const updated = migrateLegacyEncodedPasswords_();
      return json_({ status: 'success', message: 'Password migration completed.', updated: updated });
    }

    return json_({
      status: 'success',
      message: 'Google Apps Script is running. Use ?action=getUsers, ?action=saveUser, ?action=getUploads, ?action=migratePasswords.'
    });
  } catch (error) {
    return json_({ status: 'error', message: String(error) });
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const action = String(payload.action || '').toLowerCase();

    if (action === 'getusers') {
      const users = getUsers_();
      return json_({ status: 'success', data: users, count: users.length });
    }

    if (action === 'getuploads') {
      const uploads = getUploads_();
      return json_({ status: 'success', data: uploads, count: uploads.length });
    }

    if (action === 'migratepasswords') {
      const updated = migrateLegacyEncodedPasswords_();
      return json_({ status: 'success', message: 'Password migration completed.', updated: updated });
    }

    if (action === 'uploadfile') {
      const result = uploadFile_(payload);
      return json_({ status: 'success', message: 'File uploaded to Google Drive.', data: result });
    }

    if (action === 'deleteupload') {
      const uploadId = String(payload.id || '').trim();
      if (!uploadId) {
        return json_({ status: 'error', message: 'Upload id is required.' });
      }

      const deleted = deleteUpload_(uploadId);
      if (!deleted) {
        return json_({ status: 'error', message: 'Upload not found.' });
      }

      return json_({ status: 'success', message: 'Upload deleted successfully.' });
    }

    const user = normalizeUser_(payload);

    if (!user.email) {
      return json_({ status: 'error', message: 'Email is required.' });
    }

    const sheet = getOrCreateSheet_();
    sheet.appendRow([
      user.id,
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.password,
      user.department,
      user.semester,
      user.collegeIdNo,
      user.college,
      user.mobileNo,
      user.gender,
      user.permanentAddress,
      user.createdAt
    ]);

    return json_({ status: 'success', message: 'User saved to Google Sheet.', id: user.id });
  } catch (error) {
    return json_({ status: 'error', message: String(error) });
  }
}

function getUsers_() {
  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headerRow = values[0].map(function (h) {
    return String(h || '').trim();
  });

  return values.slice(1).map(function (row) {
    const record = {};

    headerRow.forEach(function (key, index) {
      if (!key) {
        return;
      }
      record[key] = row[index];
    });

    return {
      id: String(record.id || ''),
      firstName: String(record.firstName || ''),
      lastName: String(record.lastName || ''),
      username: String(record.username || ''),
      email: String(record.email || '').toLowerCase(),
      password: normalizePassword_(record.password),
      department: String(record.department || ''),
      semester: String(record.semester || ''),
      collegeIdNo: String(record.collegeIdNo || ''),
      college: String(record.college || ''),
      mobileNo: String(record.mobileNo || ''),
      gender: String(record.gender || ''),
      permanentAddress: String(record.permanentAddress || ''),
      createdAt: String(record.createdAt || '')
    };
  }).filter(function (user) {
    return user.email;
  });
}

function getUploads_() {
  const sheet = getOrCreateUploadsSheet_();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return [];
  }

  const headerRow = values[0].map(function (h) {
    return String(h || '').trim();
  });

  return values.slice(1).map(function (row) {
    const record = {};

    headerRow.forEach(function (key, index) {
      if (!key) {
        return;
      }
      record[key] = row[index];
    });

    return {
      id: String(record.id || ''),
      fileId: String(record.fileId || ''),
      fileName: String(record.fileName || ''),
      fileType: String(record.fileType || ''),
      fileSize: Number(record.fileSize || 0),
      uploadedByName: String(record.uploadedByName || ''),
      uploadedByEmail: String(record.uploadedByEmail || ''),
      uploadedByUsername: String(record.uploadedByUsername || ''),
      uploadedAt: String(record.uploadedAt || ''),
      viewUrl: String(record.viewUrl || ''),
      downloadUrl: String(record.downloadUrl || '')
    };
  }).filter(function (item) {
    return item.id;
  });
}

function uploadFile_(payload) {
  const fileName = String(payload.fileName || '').trim();
  const fileType = String(payload.fileType || 'application/octet-stream').trim();
  const base64Data = String(payload.base64Data || '').trim();

  if (!fileName || !base64Data) {
    throw new Error('fileName and base64Data are required for upload.');
  }

  const folder = getTargetDriveFolder_();
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, fileType, fileName);
  const driveFile = folder.createFile(blob);

  const uploadRecord = {
    id: 'upload-' + new Date().getTime(),
    fileId: driveFile.getId(),
    fileName: driveFile.getName(),
    fileType: fileType,
    fileSize: Number(payload.fileSize || blob.getBytes().length || 0),
    uploadedByName: String(payload.uploadedByName || '').trim(),
    uploadedByEmail: String(payload.uploadedByEmail || '').trim().toLowerCase(),
    uploadedByUsername: String(payload.uploadedByUsername || '').trim(),
    uploadedAt: String(payload.uploadedAt || new Date().toISOString()),
    viewUrl: driveFile.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + driveFile.getId()
  };

  const uploadsSheet = getOrCreateUploadsSheet_();
  uploadsSheet.appendRow([
    uploadRecord.id,
    uploadRecord.fileId,
    uploadRecord.fileName,
    uploadRecord.fileType,
    uploadRecord.fileSize,
    uploadRecord.uploadedByName,
    uploadRecord.uploadedByEmail,
    uploadRecord.uploadedByUsername,
    uploadRecord.uploadedAt,
    uploadRecord.viewUrl,
    uploadRecord.downloadUrl
  ]);

  return uploadRecord;
}

function deleteUpload_(uploadId) {
  const sheet = getOrCreateUploadsSheet_();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return false;
  }

  for (var rowIndex = 2; rowIndex <= values.length; rowIndex++) {
    var row = values[rowIndex - 1];
    var id = String(row[0] || '');
    if (id !== uploadId) {
      continue;
    }

    var fileId = String(row[1] || '');
    if (fileId) {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (error) {
        // Ignore file delete failures and still remove metadata row.
      }
    }

    sheet.deleteRow(rowIndex);
    return true;
  }

  return false;
}

function getOrCreateSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeaderRow_(sheet, USER_HEADERS);
  return sheet;
}

function getOrCreateUploadsSheet_() {
  const spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(UPLOADS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(UPLOADS_SHEET_NAME);
  }

  ensureHeaderRow_(sheet, UPLOAD_HEADERS);
  return sheet;
}

function getTargetDriveFolder_() {
  if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID !== 'YOUR_DRIVE_FOLDER_ID_HERE') {
    return DriveApp.getFolderById(DRIVE_FOLDER_ID);
  }

  return DriveApp.getRootFolder();
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureHeaderRow_(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0].map(function (h) {
    return String(h || '').trim();
  });

  const needsUpdate = expectedHeaders.some(function (header, index) {
    return currentHeaders[index] !== header;
  });

  if (needsUpdate) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  }
}

function parsePayload_(e) {
  const defaultData = {};

  if (!e) {
    return defaultData;
  }

  const queryPayload = e.parameter || defaultData;

  if (!(e.postData && e.postData.contents)) {
    return queryPayload;
  }

  const rawBody = String(e.postData.contents || '').trim();
  if (!rawBody) {
    return queryPayload;
  }

  // Support JSON and x-www-form-urlencoded request bodies.
  try {
    const jsonBody = JSON.parse(rawBody);
    return Object.assign({}, queryPayload, jsonBody || {});
  } catch (error) {
    const formBody = parseFormEncodedBody_(rawBody);
    return Object.assign({}, queryPayload, formBody);
  }
}

function parseFormEncodedBody_(rawBody) {
  const payload = {};

  String(rawBody || '').split('&').forEach(function (pair) {
    if (!pair) {
      return;
    }

    const parts = pair.split('=');
    const rawKey = parts.shift();
    if (!rawKey) {
      return;
    }

    const rawValue = parts.join('=');
    const key = decodeURIComponent(String(rawKey).replace(/\+/g, ' '));
    const value = decodeURIComponent(String(rawValue || '').replace(/\+/g, ' '));
    payload[key] = value;
  });

  return payload;
}

function normalizeUser_(payload) {
  return {
    id: String(payload.id || ('user-' + new Date().getTime())),
    firstName: String(payload.firstName || '').trim(),
    lastName: String(payload.lastName || '').trim(),
    username: String(payload.username || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    password: normalizePassword_(payload.password),
    department: String(payload.department || '').trim(),
    semester: String(payload.semester || '').trim(),
    collegeIdNo: String(payload.collegeIdNo || '').trim(),
    college: String(payload.college || '').trim(),
    mobileNo: String(payload.mobileNo || '').trim(),
    gender: String(payload.gender || '').trim(),
    permanentAddress: String(payload.permanentAddress || '').trim(),
    createdAt: String(payload.createdAt || new Date().toISOString())
  };
}

function normalizePassword_(value) {
  const password = String(value || '').trim();
  const decoded = tryDecodeLegacyBase64_(password);
  return decoded == null ? password : decoded;
}

function migrateLegacyEncodedPasswords_() {
  const sheet = getOrCreateSheet_();
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return 0;
  }

  const headers = values[0].map(function (h) { return String(h || '').trim(); });
  const passwordIndex = headers.indexOf('password');

  if (passwordIndex === -1) {
    return 0;
  }

  let updatedCount = 0;

  for (var rowIndex = 2; rowIndex <= values.length; rowIndex++) {
    const original = String(values[rowIndex - 1][passwordIndex] || '').trim();
    const normalized = normalizePassword_(original);

    if (original !== normalized) {
      sheet.getRange(rowIndex, passwordIndex + 1).setValue(normalized);
      updatedCount++;
    }
  }

  return updatedCount;
}

function tryDecodeLegacyBase64_(value) {
  if (!value || value.length < 8 || value.indexOf('=') === -1) {
    return null;
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(value) || value.length % 4 !== 0) {
    return null;
  }

  try {
    const bytes = Utilities.base64Decode(value);
    const decoded = Utilities.newBlob(bytes).getDataAsString('UTF-8');
    if (!decoded || /[\x00-\x08\x0E-\x1F]/.test(decoded)) {
      return null;
    }

    const reEncoded = Utilities.base64Encode(decoded).replace(/=+$/, '');
    const original = value.replace(/=+$/, '');
    return reEncoded === original ? decoded : null;
  } catch (error) {
    return null;
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
