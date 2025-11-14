# Thunder Client API Testing - Step by Step

Follow these steps in order to test all your APIs in Thunder Client.

## ✅ Step 1: Health Check (Already Working!)
- **Method:** GET
- **URL:** `http://localhost:3000/health`
- **Headers:** None
- **Body:** None

---

## 🔐 Step 2: Register a User (Get Your Token)

### POST /api/auth/register
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/register`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "test123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "HR_MANAGER"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "HR_MANAGER"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value from the response! You'll need it for all protected endpoints.

---

## 🔑 Step 3: Set Up Authorization Header

After getting your token, you have two options:

### Option A: Add Header to Each Request
In Thunder Client, for each protected endpoint:
- Go to **Headers** tab
- Add: `Authorization` = `Bearer YOUR_TOKEN_HERE`

### Option B: Use Environment Variables (Recommended)
1. In Thunder Client, click on **Environment** (top right)
2. Create a new environment or use default
3. Add variable: `token` = `YOUR_TOKEN_HERE` (paste your token)
4. In Headers, use: `Authorization` = `Bearer {{token}}`

---

## 📋 Step 4: Test Onboarding Checklist APIs

### 4.1 Create a Checklist
- **Method:** POST
- **URL:** `http://localhost:3000/api/onboarding/checklists`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (JSON):**
```json
{
  "name": "Software Engineer Onboarding",
  "description": "Checklist for new software engineers",
  "department": "Engineering",
  "position": "Software Engineer",
  "contractType": "FULL_TIME",
  "items": [
    {
      "name": "Complete background check",
      "description": "Submit all required documents",
      "category": "DOCUMENTATION",
      "assignedTo": "HR_EMPLOYEE",
      "isRequired": true,
      "dueDaysOffset": 0,
      "order": 1
    },
    {
      "name": "Setup system access",
      "description": "Provision access to company systems",
      "category": "SYSTEM_ACCESS",
      "assignedTo": "SYSTEM_ADMIN",
      "isRequired": true,
      "dueDaysOffset": 1,
      "order": 2
    },
    {
      "name": "Assign workspace",
      "description": "Reserve desk and equipment",
      "category": "RESOURCE_ALLOCATION",
      "assignedTo": "HR_EMPLOYEE",
      "isRequired": true,
      "dueDaysOffset": 2,
      "order": 3
    }
  ]
}
```

**Expected:** Status 201 with checklist object

### 4.2 Get All Checklists
- **Method:** GET
- **URL:** `http://localhost:3000/api/onboarding/checklists`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

**Expected:** Array of checklists

### 4.3 Get Checklist by ID
- **Method:** GET
- **URL:** `http://localhost:3000/api/onboarding/checklists/CHECKLIST_ID`
  - Replace `CHECKLIST_ID` with the `_id` from Step 4.1 response
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

---

## 👥 Step 5: Test Employee APIs

### 5.1 Get All Employees
- **Method:** GET
- **URL:** `http://localhost:3000/api/employees`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

**Expected:** Array of employees (might be empty initially)

### 5.2 Get All Contracts
- **Method:** GET
- **URL:** `http://localhost:3000/api/employees/contracts/all`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

---

## 📧 Step 6: Test Notification APIs

### 6.1 Get All Notifications
- **Method:** GET
- **URL:** `http://localhost:3000/api/notifications`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

**Expected:** Array of notifications

### 6.2 Get Unread Count
- **Method:** GET
- **URL:** `http://localhost:3000/api/notifications/unread-count`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

**Expected:**
```json
{
  "unreadCount": 0
}
```

---

## 🔐 Step 7: Test Login (Alternative to Register)

### POST /api/auth/login
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

**Expected:** Same as register - returns token and user info

---

## 🖥️ Step 8: Test System Access APIs

### 8.1 Create System Access
**Note:** You'll need an `onboardingId` for this. If you don't have one yet, skip this for now.

- **Method:** POST
- **URL:** `http://localhost:3000/api/system-access`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (JSON):**
```json
{
  "onboardingId": "ONBOARDING_ID_HERE",
  "systemName": "JIRA",
  "accessLevel": "READ_WRITE",
  "activationDate": "2024-01-15T00:00:00.000Z"
}
```

### 8.2 Get All System Access
- **Method:** GET
- **URL:** `http://localhost:3000/api/system-access`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

---

## 💰 Step 9: Test Payroll APIs

### 9.1 Get All Payroll Initiations
- **Method:** GET
- **URL:** `http://localhost:3000/api/payroll`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

### 9.2 Initiate Payroll
**Note:** Requires a signed contract. Skip if you don't have one yet.

- **Method:** POST
- **URL:** `http://localhost:3000/api/payroll/initiate`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (JSON):**
```json
{
  "contractId": "CONTRACT_ID_HERE"
}
```

---

## 📦 Step 10: Test Resource APIs

### 10.1 Get All Resources
- **Method:** GET
- **URL:** `http://localhost:3000/api/resources`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

### 10.2 Create Resource
**Note:** Requires an `onboardingId`. Skip if you don't have one yet.

- **Method:** POST
- **URL:** `http://localhost:3000/api/resources`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (JSON):**
```json
{
  "onboardingId": "ONBOARDING_ID_HERE",
  "resourceType": "LAPTOP",
  "name": "MacBook Pro 16-inch",
  "description": "Company laptop for new employee",
  "serialNumber": "MBP-2024-001",
  "location": "Building A, Floor 3, Desk 15"
}
```

---

## 📄 Step 11: Test Document APIs

### 11.1 Get All Documents
- **Method:** GET
- **URL:** `http://localhost:3000/api/documents`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** None

### 11.2 Upload Document
**Note:** This uses file upload (multipart/form-data)

- **Method:** POST
- **URL:** `http://localhost:3000/api/documents/upload`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body:** 
  - Select **Form-Data** or **Multipart** tab
  - Add field:
    - **Key:** `file`
    - **Type:** File
    - **Value:** Select a file (PDF, image, etc.)
  - Optional fields:
    - `onboardingId` (Text)
    - `documentType` (Text) - e.g., "ID", "CONTRACT"
    - `description` (Text)

---

## 🎯 Quick Test Checklist

Use this checklist to track your progress:

- [ ] ✅ Health Check (GET /health)
- [ ] Register User (POST /api/auth/register)
- [ ] Login (POST /api/auth/login)
- [ ] Create Checklist (POST /api/onboarding/checklists)
- [ ] Get Checklists (GET /api/onboarding/checklists)
- [ ] Get Employees (GET /api/employees)
- [ ] Get Contracts (GET /api/employees/contracts/all)
- [ ] Get Notifications (GET /api/notifications)
- [ ] Get Unread Count (GET /api/notifications/unread-count)
- [ ] Get System Access (GET /api/system-access)
- [ ] Get Resources (GET /api/resources)
- [ ] Get Payroll (GET /api/payroll)
- [ ] Get Documents (GET /api/documents)

---

## 💡 Tips

1. **Save Your Token:** Use Thunder Client's environment variables to store your token
2. **Copy IDs:** When you create resources, copy the `_id` from responses to use in other requests
3. **Check Status Codes:**
   - `200` = Success
   - `201` = Created
   - `400` = Bad Request (check your JSON body)
   - `401` = Unauthorized (check your token)
   - `403` = Forbidden (check your role permissions)
   - `404` = Not Found (check the ID)
4. **Test Error Cases:** Try requests without token, with invalid token, with wrong IDs

---

## 🔍 Common Issues

**401 Unauthorized:**
- Make sure you added `Authorization: Bearer YOUR_TOKEN_HERE` header
- Check that your token is valid (not expired)
- Try logging in again to get a new token

**400 Bad Request:**
- Check your JSON body format
- Make sure all required fields are present
- Verify field types match (string, number, boolean, etc.)

**404 Not Found:**
- Verify the endpoint URL is correct
- Check that IDs in the URL exist in your database

**403 Forbidden:**
- Some endpoints require specific roles (HR_MANAGER, SYSTEM_ADMIN, etc.)
- Make sure your user has the correct role

---

Happy Testing! 🚀

