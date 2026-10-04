# 🧪 Complete Manual Testing Guide & Sample Test Data

This guide provides test datasets and pre-generated mock documents located in the [`test-documents/`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents) folder to test all features of **LexVerify** end-to-end.

---

## 📂 Pre-Generated Sample Document Files

The following sample files are generated in the `test-documents/` folder in your project root:

| File Name | Document Type | Purpose / Expected Extraction |
|---|---|---|
| [`01_Registration_Certificate_ApexGlobal.png`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents/01_Registration_Certificate_ApexGlobal.png) | **Registration Certificate** | Extracts: `Apex Global Solutions Pvt Ltd`, CIN: `U72200MH2021PTC365412`, Address |
| [`02_GST_Certificate_ApexGlobal.png`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents/02_GST_Certificate_ApexGlobal.png) | **GST Certificate** | Extracts: `Apex Global Solutions Pvt Ltd`, GSTIN: `27AAACA1234A1Z5`, Address |
| [`03_Bank_Document_ApexGlobal.png`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents/03_Bank_Document_ApexGlobal.png) | **Bank Document** | Extracts: `Apex Global Solutions Pvt Ltd`, Account: `987654321098`, IFSC: `HDFC0001234` |
| [`04_Mismatched_Tax_Doc.png`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents/04_Mismatched_Tax_Doc.png) | **GST Certificate (Mismatch)** | Extracts differing company name & registration number to trigger **Cross-Document Mismatch** |

---

## 📋 Scenario 1: Golden Path – Full Vendor Verification (Match & Approve)

### 1.1 Vendor Onboarding Form Data
Click **"+ Onboard New Vendor"** on [http://localhost:3000](http://localhost:3000) and enter:

| Field | Test Value |
|---|---|
| **Company Name** | `Apex Global Solutions Pvt Ltd` |
| **Registration Number** | `U72200MH2021PTC365412` |
| **Tax ID / GST Number** | `27AAACA1234A1Z5` |
| **Jurisdiction / Country** | `India` |
| **Contact Person** | `Rajesh Kumar` |
| **Contact Email** | `rajesh.kumar@apexsolutions.com` |
| **Contact Phone** | `+91 98765 43210` |
| **Address** | `402, Cyber Heights, Tech Park Road, Mumbai 400051` |

### 1.2 Document Upload
On the vendor detail page, upload the following documents from [`test-documents/`](file:///d:/Freelance_work/Lextigress%20Assesment/test-documents):
1. **Registration Certificate**: Upload `01_Registration_Certificate_ApexGlobal.png`
2. **GST Certificate**: Upload `02_GST_Certificate_ApexGlobal.png`
3. **Bank Document**: Upload `03_Bank_Document_ApexGlobal.png`

### 1.3 Features to Verify:
- [ ] **AI Extraction**: Multi-modal AI extracts Company Name, CIN, GSTIN, Bank Account, IFSC, and Address.
- [ ] **Cross-Document Comparison**: Status shows `MATCH` with green badges across all matching fields.
- [ ] **Workflow Transition**: Status moves from `Draft` to `Under Review`.
- [ ] **Approval**: Click **"Approve Vendor"** to move workflow to `Approved`.

---

## 📋 Scenario 2: Cross-Document Discrepancy & Mismatch Detection

### 2.1 Vendor Form Data
Click **"+ Onboard New Vendor"** and enter:

| Field | Test Value |
|---|---|
| **Company Name** | `Apex Global Solutions Pvt Ltd` |
| **Registration Number** | `U72200MH2021PTC365412` |
| **Tax ID / GST Number** | `27AAACA1234A1Z5` |
| **Jurisdiction / Country** | `India` |
| **Contact Person** | `Priya Sharma` |
| **Contact Email** | `priya@apexsolutions.com` |
| **Contact Phone** | `+91 98111 22233` |
| **Address** | `402, Cyber Heights, Tech Park Road, Mumbai 400051` |

### 2.2 Document Upload (Intentionally conflicting documents):
1. **Registration Certificate**: Upload `01_Registration_Certificate_ApexGlobal.png`
2. **GST Certificate**: Upload `04_Mismatched_Tax_Doc.png` (Contains *Apex Technologies Corp* instead)

### 2.3 Features to Verify:
- [ ] **AI Discrepancy Detection**: The Cross-Document Comparison table flags `companyName` and `registrationNumber` with red `MISMATCH` badges.
- [ ] **Auto State Transition**: Workflow transitions to `Action Required`.
- [ ] **Auto Task Creation**: A task is automatically created in the **"Pending Tasks"** queue indicating the mismatch.

---

## 📋 Scenario 3: Missing Documents & Automated Email Trigger

### 3.1 Vendor Form Data
Create a vendor:

| Field | Test Value |
|---|---|
| **Company Name** | `Zenith Logistics LLC` |
| **Registration Number** | `LLC-98442-DE` |
| **Tax ID / GST Number** | `US-EIN-129485721` |
| **Jurisdiction / Country** | `United States` |
| **Contact Person** | `Michael Vance` |
| **Contact Email** | `michael@zenithlogistics.com` |
| **Contact Phone** | `+1 (555) 234-5678` |
| **Address** | `1209 Orange Street, Wilmington, DE 19801` |

### 3.2 Actions & Features to Verify:
1. Upload only **Registration Certificate** (leave GST Certificate & Bank Document missing).
2. Click **"Request Missing Documents"** or trigger document verification check.
3. Verify:
   - [ ] Document Checklist displays `Available` for Registration and `Missing` for GST & Bank documents.
   - [ ] Automated missing document email is sent (logged in `email_logs` table).
   - [ ] Workflow status updates to `Action Required`.

---

## 📋 Scenario 4: Live OpenCorporates Company Registry Verification

Test live real-time registry verification against OpenCorporates API:

### 4.1 Test Profile 1 (Live Public US Entity)
- **Company Name**: `Microsoft Corporation`
- **Registration Number**: `600413485`
- **Jurisdiction**: `United States`

### 4.2 Test Profile 2 (Live UK Entity)
- **Company Name**: `DeepMind Technologies Limited`
- **Registration Number**: `07386357`
- **Jurisdiction**: `United Kingdom`

### 4.3 Features to Verify:
- [ ] Click **"Verify with OpenCorporates"** in the Registry Verification card.
- [ ] System calls OpenCorporates API, compares normalized company name & company number.
- [ ] Status updates to `Verified` (or `Unable_to_Verify` / `Mismatch` if data differs).
- [ ] Registry data payload is stored and displayed in the audit history.

---

## 📋 Scenario 5: Version History, Audit Log & Rollback

### 5.1 Actions:
1. Open any existing vendor profile.
2. Click **"Edit Details"** and change the **Address** or **Contact Person**.
3. Save changes.
4. Navigate to the **"Version History"** tab.

### 5.2 Features to Verify:
- [ ] New version entry (e.g. `v2`) appears in the append-only version history.
- [ ] Diff viewer highlights modified fields.
- [ ] Click **"Restore this version"** -> restores previous state with an updated version increment (`v3`).
- [ ] Workflow audit logs record all user interactions and state transitions.
