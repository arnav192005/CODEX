# 📊 Google Sheets Data Collection Setup Guide

## ✅ What I've Implemented:

1. **Automatic Google Sheets Integration** - User signups are automatically saved to your Google Sheet
2. **Local CSV Export** - Press `Ctrl + Shift + E` on signup page to download all user data as CSV
3. **Dual Storage** - Data saves both locally (localStorage) and to Google Sheets
4. **Admin Dashboard Sync** - Dashboard can fetch users directly from Google Sheets via `action=getUsers`

---

## ✅ Use Exact Script From Project

Use this file as the source code in Apps Script:

- `GOOGLE_APPS_SCRIPT_EXACT_CODE.gs`

This script supports:

- `POST` to save signup users
- `GET ?action=getUsers` for admin dashboard sync

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create new spreadsheet
3. Name it **"CODEX User Signups"**
4. In the first row, add these headers:
   ```
   ID | First Name | Last Name | Email | Department | Semester | College | Created At
   ```

### Step 2: Create Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste the full content of `GOOGLE_APPS_SCRIPT_EXACT_CODE.gs`

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Prepare row data
    var rowData = [
      data.id,
      data.firstName,
      data.lastName,
      data.email,
      data.department,
      data.semester,
      data.college,
      data.createdAt
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Return success
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **💾 Save** (name it "SignupHandler")
5. Click **Deploy** → **New deployment**
6. Click the gear icon ⚙️ next to "Select type"
7. Choose **Web app**
8. Configure:
   - **Description**: "CODEX Signup Handler"
   - **Execute as**: Me
   - **Who has access**: Anyone
9. Click **Deploy**
10. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/ABC.../exec`)
11. Click **Done**

### Step 3: Update Your Website

1. Open `signup.html`
2. Find this line (near line 271):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your Web App URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABC.../exec';
   ```
4. Save the file

### Step 4: Connect Admin Dashboard

1. Open `admin-dashboard.html`
2. Click **Connect Sheet**
3. Paste the same Apps Script Web App URL
4. Click **Sync Sheet**

The dashboard calls:

- `YOUR_WEB_APP_URL?action=getUsers`

---

## 🎯 How to Use

### For Users (Regular Signups):
- Users fill the signup form normally
- Data automatically saves to your Google Sheet
- Data also saves locally in browser

### For Admin (You):

**Method 1: View Google Sheet**
- Open your Google Sheet anytime
- All signups appear automatically
- Can sort, filter, analyze data

**Method 2: Export CSV**
1. Open `signup.html` in browser
2. Press `Ctrl + Shift + E`
3. CSV file downloads with all user data
4. Open in Excel or Google Sheets

---

## 📋 Data Collected

Each signup saves:
- **ID**: Unique user identifier
- **First Name**: User's first name
- **Last Name**: User's last name
- **Email**: User's email address
- **Department**: Selected department (CSE, ECE, ME, etc.)
- **Semester**: Current semester (1-8)
- **College**: College name
- **Created At**: Timestamp of signup

---

## 🔒 Security Notes

⚠️ **Important**: 
- Passwords are stored with basic encoding (btoa), which is NOT secure
- For production, consider:
  1. Using proper authentication services (Firebase, Auth0)
  2. Not storing passwords in Google Sheets
  3. Implementing proper encryption

---

## 🐛 Troubleshooting

### Data not appearing in Google Sheet?

1. **Check Script URL**: Make sure you replaced `YOUR_GOOGLE_SCRIPT_URL_HERE` in signup.html
2. **Check Browser Console**: Press F12, go to Console tab, look for errors
3. **Verify Permissions**: Apps Script must have access to your Google Sheet
4. **Test Script**: In Apps Script editor, click "Test deployments" to verify it works

### CSV export not working?

- Make sure you're on the signup.html page
- Press exactly: `Ctrl + Shift + E` (hold Ctrl, hold Shift, press E)
- Check your Downloads folder

---

## 📊 Viewing Your Data

### In Google Sheets:
- Sort by Created At to see newest signups
- Filter by Department to see specific branches
- Use formulas to count signups per department
- Create charts for visualizations

### In Excel:
- Export CSV using `Ctrl + Shift + E`
- Open in Excel
- Format as table for easy analysis

---

## 🎉 You're All Set!

Now when students sign up:
1. ✅ Data saves to browser (offline backup)
2. ✅ Data automatically sends to your Google Sheet
3. ✅ You can export anytime with Ctrl+Shift+E

**Need help?** Check the troubleshooting section above or test with a dummy signup!
