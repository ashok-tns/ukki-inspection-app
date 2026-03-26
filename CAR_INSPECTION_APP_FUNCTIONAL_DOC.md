# Car Inspection App – Functional Documentation

> Source: Flutter project `form_app` (Car-dano Palapa Form App)
> Version: 2.3.23+1
> Generated for: React Native (Expo) rebuild reference

---

## 1. App Overview

| Field | Detail |
|---|---|
| **App Name** | Palapa Inspeksi |
| **Package** | `form_app` (Car-dano Palapa Form App) |
| **Purpose** | A mobile tool for professional vehicle inspectors to conduct, record, and submit structured car inspections to a backend API |
| **Target Users** | Certified vehicle inspectors employed by the "Palapa" inspection service |
| **Platform** | iOS + Android (portrait-only) |

### What the App Does

An inspector logs in with an email + PIN, then walks through a **20-step form** covering:
- Inspector and customer identity
- Vehicle data (make, model, year, plate, taxes)
- Mandatory photos grouped by area (general, exterior, interior, engine, undercarriage, tools/accessories)
- Additional (optional) annotated photos for each area
- Document photos (STNK / registration)
- Equipment checklist
- Inspection results and scores for each area
- Paint thickness measurements per body panel
- Detailed component-level assessments (features, engine, interior, exterior, tires, test drive, tools test)
- Finalization with a confirmation checkbox before submission

All data is persisted locally in JSON files on-device and submitted to a REST API when the inspector confirms submission. Image uploads are batched (10 per request) with resume support.

---

## 2. Tech Observations (from Flutter Project)

| Concern | Technology Used |
|---|---|
| **State Management** | Flutter Riverpod 3.1.0 — `NotifierProvider`, `FutureProvider`, `Provider`, family providers (`providerName(identifier)`) |
| **Networking** | Dio 5.8.0+ with `InterceptorsWrapper` for auto-token injection and 401 auto-refresh |
| **Local Storage (form data)** | File-based JSON via `path_provider` — a single `form_data.json` written to the app documents directory with a debounce timer |
| **Local Storage (images)** | File system (`path_provider`) — compressed JPEG files stored in app temp directory |
| **Secure Storage (tokens)** | `flutter_secure_storage` 10.0.0 — access token + refresh token stored in device keychain/keystore |
| **Architecture Pattern** | Feature-based layering: **Pages → Providers (Notifiers) → Services → Models**. Closest to MVVM: Pages = View, Providers/Notifiers = ViewModel, Services = Model/Repository |
| **Image Handling** | `camera` (custom multi-shot camera), `image_picker` (gallery fallback), `flutter_image_compress`, `gal` (save to gallery) |
| **Error Monitoring** | Firebase Crashlytics — global `FlutterError.onError` and `PlatformDispatcher.instance.onError` handlers |
| **Environment Config** | `flutter_dotenv` — `.env` file bundled as an asset; separate `API_BASE_URL` and `API_BASE_URL_DEBUG` |
| **Navigation** | Flutter `PageView` (swipe/programmatic) for the multi-step form; `CupertinoPageRoute` push for Login ↔ MultiStepForm ↔ Finished transitions |
| **Font** | Google Fonts — Rubik family |

---

## 3. Navigation Structure

### Type
- **Root**: `MaterialApp` with a `FutureBuilder` at `home` — checks token validity at startup
- **Multi-step form**: `PageView` with `PageController` (programmatic navigation via Riverpod `pageNavigationProvider`)
- **Screen transitions**: `CupertinoPageRoute` (iOS-style slide) for Login ↔ MultiStepFormScreen ↔ FinishedPage
- No tab bars, no drawer navigation

### Hierarchy & Flow

```
App Start
 └─ Splash Screen (native)
     └─ Token Check (async)
         ├─ Token VALID  →  MultiStepFormScreen (PageView, 20 pages)
         │                   Page 0:  Identitas (Identity)
         │                   Page 1:  Foto General Wajib (Mandatory General Photos)
         │                   Page 2:  Foto Eksterior Tambahan (Additional Exterior Photos)
         │                   Page 3:  Ketebalan Cat (Paint Thickness)
         │                   Page 4:  Foto Interior Tambahan
         │                   Page 5:  Foto Mesin Tambahan
         │                   Page 6:  Foto Kaki-kaki Tambahan
         │                   Page 7:  Foto Alat-alat Tambahan
         │                   Page 8:  Foto Dokumen (STNK)
         │                   Page 9:  Data Kendaraan (Vehicle Data)
         │                   Page 10: Kelengkapan (Equipment Checklist)
         │                   Page 11: Hasil Inspeksi (Inspection Summary Scores)
         │                   Page 12: Penilaian Fitur (Features Assessment)
         │                   Page 13: Penilaian Mesin (Engine Assessment)
         │                   Page 14: Penilaian Interior (Interior Assessment)
         │                   Page 15: Penilaian Eksterior (Exterior Assessment)
         │                   Page 16: Penilaian Ban & Kaki-kaki (Tires & Undercarriage)
         │                   Page 17: Penilaian Test Drive
         │                   Page 18: Penilaian Tools Test
         │                   Page 19: Finalisasi (Submit)
         │                       └─ On Success → FinishedPage (replace all)
         │
         └─ Token INVALID →  LoginPage
                              └─ Login Success → MultiStepFormScreen (replace all)
```

### Navigation Rules
- The last page (Finalisasi, index 19) disables PageView swipe — `NeverScrollableScrollPhysics`
- All other pages use `PageScrollPhysics` (swipe-enabled)
- The app bar shows current page / total pages progress (e.g. "3 / 20")
- Bottom bar shows Back/Next buttons; on the last page, Next triggers `_submitForm()`
- If submission is loading, the Back button becomes a "Cancel" button
- Token expiry during submission (401) → force-navigate to LoginPage

---

## 4. Screens Breakdown

---

### Screen 1: Login Page
**File**: `lib/pages/login_page.dart`

**Purpose**
- Entry point for unauthenticated users. Collects email and a 6-digit PIN to authenticate the inspector.

**UI Components**
- App logo / branding image
- Email `TextFormField`
- 6-box PIN input widget (`PinInput`) — custom widget, each box is a single character
- "Login" button
- App version display (`AppVersionDisplay`)
- Error message display (from auth state)

**User Actions**
- Enter email address
- Enter 6-digit PIN (tapping each cell or keyboard entry)
- Tap Login

**Validations**
- Email: required, basic format check
- PIN: must be exactly 6 digits

**API Integration**
- **Endpoint**: `POST /auth/login/inspector`
- **Request body**:
  ```json
  { "email": "inspector@example.com", "pin": "123456" }
  ```
- **Response**:
  ```json
  {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { "id": "uuid", "name": "...", "email": "...", "inspectionBranchCity": "..." }
  }
  ```

**State Management**
- Auth state via `authProvider` (`AsyncNotifier`)
- On success: tokens saved to secure storage via `TokenManagerService`; user data saved to `userInfoProvider`
- Loading state shown on button during request

**Navigation**
- Comes from: App start (token invalid) or after 401 error during submission
- Goes to: `MultiStepFormScreen` (replaces entire navigation stack on success)

---

### Screen 2: Multi-Step Form Container
**File**: `lib/pages/multi_step_form_screen.dart`

**Purpose**
- Shell/container that hosts all 20 form pages in a `PageView`. Manages global form submission, validation, navigation, and progress display.

**UI Components**
- `MultiStepFormAppBar` — shows "Page X / 20", trailing area shows:
  - Page 0: `AppVersionDisplay` + `LogoutButton`
  - Tambahan photo pages (2, 4–8): `DeleteAllTambahanPhotosButton` (if photos exist)
- `PageView` with 20 child pages
- `MultiStepFormNavbar` — Back and Next/Submit buttons with loading state
- `CustomMessageOverlay` — floating toast-style messages (success, error, warning)

**User Actions**
- Swipe between pages (except last page — swipe locked)
- Tap Next to advance
- Tap Back to go back (or cancel submission on last page)
- Tap Logout on page 0

**Validations (triggered at submission)**
- Page 0 (Identitas): all required fields via Flutter `Form` validation
- Page 9 (DataKendaraan): all required fields via Flutter `Form` validation
- Image labels: Tambahan photos cannot have empty or default ("Foto Tambahan") labels

**State Management**
- `formStepProvider` — current page index (int)
- `pageNavigationProvider` — `PageController` wrapper
- `submissionStatusProvider` — `{isLoading, message, progress}` for UI feedback
- `submissionDataCacheProvider` — caches last submitted form data + uploaded image paths for resume

**Navigation**
- On successful submission: `Navigator.pushAndRemoveUntil → FinishedPage`
- On 401 during submission: `Navigator.pushAndRemoveUntil → LoginPage`

---

### Screen 3 — Page 0: Identitas (Identity)
**File**: `lib/pages/identitas_page.dart`

**Purpose**
- Captures inspector identity, customer name, inspection branch, and date.

**UI Components**
- Dropdown: Inspector name (populated from API — `inspectorProvider`)
- Text field: Customer name (`namaCustomer`)
- Dropdown: Inspection branch (`cabangInspeksi`) — from `inspectionBranchesProvider`
- Date picker: Inspection date (`tanggalInspeksi`)

**User Actions**
- Select inspector from dropdown
- Type customer name
- Select inspection branch
- Pick inspection date

**Validations**
- Inspector: required
- Customer name: required
- Branch: required
- Date: required

**API Integration**
- `GET /public/users/inspectors` — fetches inspector list
- `GET /inspection-branches` — fetches branch list

**State Management**
- `formProvider` — stores `namaInspektor`, `inspectorId`, `selectedInspector`, `namaCustomer`, `cabangInspeksi`, `tanggalInspeksi`
- Inspector dropdown cross-validated against `inspectorProvider` list on load

**Navigation**
- First page in PageView
- Back: disabled (no previous page)
- Next: Page 1 (Foto General Wajib)

---

### Screen 4 — Page 1: Foto General Wajib (Mandatory General Photos)
**File**: `lib/pages/foto_wajib/foto_general_wajib_page.dart`

**Purpose**
- Collects mandatory photos for the "General" category — predefined slots (front, rear, left side, right side, etc.).

**UI Components**
- Grid/list of `ImageInputWidget` slots — each slot has:
  - A label (e.g. "Tampak Depan")
  - Preview thumbnail (shows captured/picked image)
  - Camera button to capture or replace
  - "Need attention" toggle (marks the photo as problematic)
  - Rotate button for orientation correction

**User Actions**
- Tap camera icon → opens `MultiShotCameraScreen` or image picker
- Toggle "Need Attention" on any photo
- Rotate captured image

**Validations**
- No strict validation preventing advance (mandatory but form can still proceed)

**API Integration**
- Images uploaded as part of `POST /inspections/:id/photos/multiple` during final submission

**State Management**
- `imageDataListProvider` (`NotifierProvider<List<ImageData>>`) — single flat list for all mandatory (Wajib) photos
- Each slot is identified by label + category
- Data persisted to JSON file

**Navigation**
- Comes from: Page 0 (Identitas)
- Goes to: Page 2 (Foto Eksterior Tambahan)

---

### Screens 5–10 — Pages 2, 4, 5, 6, 7, 8: Foto Tambahan Pages (Additional Photos)
**Files**: `lib/pages/foto_tambahan/foto_*_tambahan_page.dart`, `lib/pages/foto_dokumen_page.dart`

| Page Index | Screen Name | Identifier Key |
|---|---|---|
| 2 | Foto Eksterior Tambahan | `'Eksterior Tambahan'` |
| 4 | Foto Interior Tambahan | `'Interior Tambahan'` |
| 5 | Foto Mesin Tambahan | `'Mesin Tambahan'` |
| 6 | Foto Kaki-kaki Tambahan | `'Kaki-kaki Tambahan'` |
| 7 | Foto Alat-alat Tambahan | `'Alat-alat Tambahan'` |
| 8 | Foto Dokumen (STNK) | `'Foto Dokumen'` |

**Purpose**
- Collect annotated additional photos. Unlike mandatory photos, these are dynamic — the inspector can add as many photos as needed with a custom label per photo.

**UI Components**
- `TambahanImageSelection` widget — displays a scrollable list of photo cards
- Each card: thumbnail preview, editable label text field, "Need Attention" toggle, delete button
- "Add Photo" button at the bottom of the list (adds a new empty slot)
- `DeleteAllTambahanPhotosButton` in AppBar (appears when ≥1 photo exists)

**User Actions**
- Add new photo slot
- Capture or pick photo for each slot
- Edit label text for each photo
- Toggle "Need Attention"
- Delete individual photo
- Delete all photos (via AppBar button with confirmation dialog)

**Validations**
- Label must not be empty or equal to the default label (`'Foto Tambahan'` / `'Foto STNK'`) at submission time
- Empty photo slots (no imagePath) are skipped at submission

**State Management**
- `tambahanImageDataProvider(identifier)` — family `NotifierProvider<List<TambahanImageData>>` keyed by identifier string
- Data persisted per identifier in separate JSON files
- Pre-cached in `FormApp.initState` for performance

**Navigation**
- Each page: Next → next sequential page in the PageView

---

### Screen 11 — Page 3: Ketebalan Cat (Paint Thickness)
**File**: `lib/pages/ketebalan_cat_page.dart`

**Purpose**
- Records paint thickness measurements (in microns) for each body panel: front hood, rear trunk, rear bumper, right side (4 panels), left side (4 panels).

**UI Components**
- `PaintThicknessInputField` widgets — labeled numeric input for each panel:
  - Front: `catDepanKap`
  - Rear: `catBelakangTrunk`, `catBelakangBumper`
  - Right: FenderDepan, PintuDepan, PintuBelakang, FenderBelakang, SideSkirt
  - Left: same as right

**User Actions**
- Enter numeric value for each panel (keyboard input)

**Validations**
- No strict required validation (optional measurement)

**State Management**
- `formProvider` — stores all `catXxx` string fields

**Navigation**
- Comes from: Page 2 (Eksterior Tambahan)
- Goes to: Page 4 (Interior Tambahan)

---

### Screen 12 — Page 9: Data Kendaraan (Vehicle Data)
**File**: `lib/pages/data_kendaraan_page.dart`

**Purpose**
- Captures complete vehicle details.

**UI Components**
- Text field: Vehicle brand (`merekKendaraan`)
- Text field: Vehicle type/model (`tipeKendaraan`)
- Text field: Year (`tahun`)
- Dropdown: Transmission (`transmisi`) — e.g., Manual / Automatic
- Text field: Color (`warnaKendaraan`)
- Text field: Odometer reading (`odometer`) — formatted with thousands separator
- Text field: Ownership (`kepemilikan`)
- Text field: Plate number (`platNomor`) — auto-uppercased
- Date picker: 1-year tax expiry (`pajak1TahunDate`)
- Date picker: 5-year tax expiry (`pajak5TahunDate`)
- Text field: Tax cost (`biayaPajak`) — formatted with thousands separator

**User Actions**
- Type in each field
- Select dates for tax expiry
- Select transmission type

**Validations**
- All fields required (validated at submission via `FormKey`)
- Plate number: sent to API as uppercase

**State Management**
- `formProvider` — stores all vehicle data fields
- Custom `ThousandsSeparatorInputFormatter` applied to odometer and tax cost fields

**Navigation**
- Comes from: Page 8 (Foto Dokumen)
- Goes to: Page 10 (Kelengkapan)

---

### Screen 13 — Page 10: Kelengkapan (Equipment Checklist)
**File**: `lib/pages/kelengkapan_page.dart`

**Purpose**
- Binary checklist for 9 vehicle accessories/documents.

**UI Components**
- `ToggleOptionWidget` for each item — two-state toggle: "Lengkap" (Complete) / "Tidak Lengkap" (Incomplete)
- Items: Buku Service, Kunci Serep, Buku Manual, Ban Serep, BPKB, Dongkrak, Toolkit, No Rangka, No Mesin

**User Actions**
- Toggle each item between Lengkap / Tidak Lengkap

**Validations**
- No strict validation — all items optional

**State Management**
- `formProvider` — stores each item as nullable string (`"Lengkap"` or `"Tidak Lengkap"`)
- API serializes as boolean: `item == "Lengkap"` → `true`

**Navigation**
- Comes from: Page 9 (Data Kendaraan)
- Goes to: Page 11 (Hasil Inspeksi)

---

### Screen 14 — Page 11: Hasil Inspeksi (Inspection Summary)
**File**: `lib/pages/hasil_inspeksi_page.dart`

**Purpose**
- High-level scoring for 4 main inspection areas + flag indicators + tire info + repair estimations + overall description.

**UI Components**
- `ToggleableNumberedButtonList` for each area score (1–5 scale):
  - Interior score
  - Eksterior score
  - Kaki-kaki score
  - Mesin score
- Toggle buttons for indicators:
  - Indikasi Tabrakan (crash indication) — "Terindikasi" / "Tidak Terindikasi"
  - Indikasi Banjir (flood indication)
  - Indikasi Odometer Reset
- Text fields: Posisi Ban, Merk Ban, Tipe Velg, Ketebalan Ban
- `RepairEstimation` widget — dynamic list of repair items with name + price fields
- `ExpandableTextField` — "Deskripsi Keseluruhan" (overall description, bullet-list formatted)
- Score notes (`ExpandableTextField`) for each of the 4 areas

**User Actions**
- Select score (1–5) for each area
- Toggle crash/flood/odometer indicators
- Fill in tire information
- Add/remove repair estimations with part name and price
- Write overall description and per-area notes

**State Management**
- `formProvider` — stores all scores, indicators, tire fields, `repairEstimations: List<Map<String, String>>`, description lists

**Navigation**
- Comes from: Page 10 (Kelengkapan)
- Goes to: Page 12 (Penilaian Fitur)

---

### Screens 15–21 — Pages 12–18: Penilaian (Detailed Assessments)
**Files**: `lib/pages/penilaian/penilaian_*.dart`

All Penilaian pages share the same structural pattern:

**UI Components**
- `ToggleableNumberedButtonList` for each component — score 0–5 (0 = not assessed)
- `ExpandableTextField` — catatan (notes) in bullet-list format
- `PageTitle` widget

**Scoring Scale**: 0 (N/A) through 5 (Excellent) — integer values

| Page Index | Screen | Components Scored |
|---|---|---|
| 12 | Penilaian Fitur | Airbag, Sistem Audio, Power Window, Sistem AC, Central Lock, Electric Mirror, Rem ABS |
| 13 | Penilaian Mesin | 27 components (getaran mesin, suara mesin, transmisi, pompa power steering, timing chain cover, oli, accu, kompressor AC, fan, selang, karter oli, oil rem, kabel, kondensor, radiator, cylinder head, oli mesin, air radiator, cover klep, alternator, water pump, belt, oli transmisi, cylinder block, bushing besar/kecil, tutup radiator) |
| 14 | Penilaian Interior | 25 components (stir, rem tangan, pedal, switch wiper, lampu hazard, panel dashboard, pembuka kap mesin, pembuka bagasi, jok depan, aroma interior, handle pintu, console box, spion tengah, tuas persneling, jok belakang, panel indikator, switch lampu, karpet dasar, klakson, sun visor, tuas tangki bensin, sabuk pengaman, trim interior, plafon) |
| 15 | Penilaian Eksterior | 30 body panels (bumper depan/belakang, kap mesin, lampu utama/belakang/foglamp, panel atap, grill, kaca depan/belakang/jendela, wiper, trunklid, fender kanan/kiri, quarter panel kanan/kiri, pintu depan/belakang kanan/kiri, spion kanan/kiri, lisplang kanan/kiri, side skirt kanan/kiri, daun wiper) |
| 16 | Penilaian Ban & Kaki-kaki | 17 components (ban depan/belakang, velg depan/belakang, disc brake, master rem, tie rod, gardan, brake pad, crossmember, knalpot, ball joint, rack steer, karet boot, upper/lower arm, shock breaker, link stabilizer) |
| 17 | Penilaian Test Drive | 7 items (bunyi getaran, performa stir, perpindahan transmisi, stir balance, performa suspensi, performa kopling, RPM) |
| 18 | Penilaian Tools Test | 8 items (tebal cat body depan/kiri/kanan/belakang/atap, temperature AC, OBD scanner, test accu) |

**State Management**
- All scores stored as `int?` fields in `formProvider`
- Notes stored as `List<String>?` in `formProvider`

**Navigation**
- Sequential: each page leads to the next
- Page 18 (Tools Test) → Page 19 (Finalisasi)

---

### Screen 22 — Page 19: Finalisasi (Finalization)
**File**: `lib/pages/finalisasi_page.dart`

**Purpose**
- Final review page before submission. Displays a summary and requires inspector to check a declaration checkbox.

**UI Components**
- Summary/review of key inspection data
- Declaration checkbox (`isChecked` state in parent)
- Progress indicator (shown during submission from `submissionStatusProvider`)
- Submission status message and progress bar

**User Actions**
- Review inspection summary
- Check the declaration checkbox
- Tap "Submit" (Next button in navbar)
- Tap "Cancel" (Back button while uploading)

**Validations**
- Checkbox must be checked to proceed
- Image processing must be complete (no active processing jobs)
- No active submission already in progress

**State Management**
- `submissionStatusProvider` — `{isLoading: bool, message: String, progress: double}`
- `submissionDataCacheProvider` — caches `lastSubmittedFormData` + `uploadedImagePaths` for upload resume
- `isChecked` — managed in `MultiStepFormScreen` parent state

**Navigation**
- Comes from: Page 18 (Tools Test)
- On success: `FinishedPage` (replaces all)
- On 401: `LoginPage` (replaces all)

---

### Screen 23: Finished Page
**File**: `lib/pages/finished.dart`

**Purpose**
- Success confirmation screen shown after successful form + image upload.

**UI Components**
- Success illustration/icon
- "Selesai" (Done) message
- Button to start a new inspection (resets all form data and navigates back to MultiStepFormScreen)

**User Actions**
- Tap "Mulai Inspeksi Baru" (Start New Inspection) → clears all state and returns to page 0

**State Management**
- All providers are reset: `formProvider.resetFormData()`, `imageDataListProvider.clearImageData()`, all `tambahanImageDataProvider(id).clearAll()`

**Navigation**
- Comes from: Finalisasi (after successful submission)
- Goes to: MultiStepFormScreen (page 0) — replaces all routes

---

### Screen 24: Multi-Shot Camera Screen
**File**: `lib/pages/multi_shot_camera_screen.dart`

**Purpose**
- Custom in-app camera screen using the `camera` package. Supports accelerometer-based level indicator to help the inspector take level photos.

**UI Components**
- `CameraPreviewWidget` — live camera feed
- Accelerometer level indicator (horizontal/vertical balance)
- Capture button
- Flip camera button
- Flash toggle
- Close/cancel button
- Image preview carousel after capture

**User Actions**
- Point camera and capture photo
- Retake or accept captured photo
- Choose from gallery as alternative

**State Management**
- Local `StatefulWidget` state for camera controller, flash mode, selected camera
- Captured images returned to calling page via `Navigator.pop(result)`

---

## 5. Core Features

### 5.1 Inspection Creation Flow
1. Inspector logs in → tokens stored securely
2. Multi-step form auto-loads persisted draft from `form_data.json`
3. Inspector fills 20 pages in order (can navigate back freely)
4. On final page, checks declaration and taps Submit
5. Validation runs on required pages (0 and 9) — errors jump to offending page
6. Form data POSTed to `/inspections` → returns `inspectionId`
7. All collected images uploaded in batches of 10 to `/inspections/:id/photos/multiple`
8. On complete: all local data cleared, navigated to Finished screen

### 5.2 Image Capture / Upload
- **Mandatory photos** (`FotoGeneralWajibPage` + per-area wajib pages): Fixed slots with predefined labels and categories
- **Additional photos** (Tambahan pages): Dynamic slots; inspector adds as many as needed with custom labels
- **Document photos** (Foto Dokumen): Treated as Tambahan with default label "Foto STNK"
- Images compressed via `flutter_image_compress` before storage
- Images stored in app's temp/documents directory, managed by `ManagedImageStorage`
- `originalRawPath` preserved alongside compressed `imagePath`
- Orphaned generated images cleaned up on app start

### 5.3 Image Processing Queue
- `ImageProcessingQueueService` / `ImageCaptureQueueService` — ensures images are processed serially
- `imageProcessingServiceProvider` — tracks active processing jobs
- Submission is blocked if `isAnyProcessing == true`

### 5.4 Offline / Draft Support
- Form data auto-saved to `form_data.json` via debounced timer in `FormNotifier`
- Image paths persisted in separate JSON files per category
- On app restart, draft is re-loaded automatically
- Upload cache (`submissionDataCacheProvider`) tracks already-uploaded image paths — upload resumes from where it left off if interrupted

### 5.5 Sync / Upload Resume Logic
1. On submit: check if form data has changed vs. cached `lastSubmittedFormData`
2. If unchanged AND `lastSubmittedInspectionId` exists → skip form POST, reuse existing ID
3. Filter `allImages` by removing paths already in `uploadedImagePaths` cache
4. Upload remaining images in batches, updating cache after each batch
5. On full success: clear all caches and form data
6. On cancellation: state preserved — next submit attempt resumes from cached state

### 5.6 Auto-Update Check
- `UpdateService` checks for app updates on `MultiStepFormScreen` initialization
- Shows `UpdateDialog` if a newer version is available

---

## 6. Data Models

### FormData
> 200+ fields. Summarized by section.

| Section | Key Fields | Types |
|---|---|---|
| **Identity** | `namaInspektor`, `inspectorId`, `selectedInspector`, `namaCustomer`, `cabangInspeksi`, `tanggalInspeksi` | `String?`, `Inspector?`, `InspectionBranch?`, `DateTime?` |
| **Vehicle** | `merekKendaraan`, `tipeKendaraan`, `tahun`, `transmisi`, `warnaKendaraan`, `odometer`, `kepemilikan`, `platNomor`, `pajak1TahunDate`, `pajak5TahunDate`, `biayaPajak` | `String`, `DateTime?` |
| **Equipment Checklist** | `bukuService`, `kunciSerep`, `bukuManual`, `banSerep`, `bpkb`, `dongkrak`, `toolkit`, `noRangka`, `noMesin` | `String?` (`"Lengkap"` / `"Tidak Lengkap"`) |
| **Inspection Summary** | `indikasiTabrakan`, `indikasiBanjir`, `indikasiOdometerReset`, `posisiBan`, `merk`, `tipeVelg`, `ketebalan` | `String?` |
| **Area Scores** | `interiorSelectedValue`, `eksteriorSelectedValue`, `kakiKakiSelectedValue`, `mesinSelectedValue` | `int?` |
| **Area Notes** | `keteranganInterior`, `keteranganEksterior`, `keteranganKakiKaki`, `keteranganMesin`, `deskripsiKeseluruhan` | `List<String>?` |
| **Repair Estimations** | `repairEstimations` | `List<Map<String, String>>` — `{repair, price}` |
| **Paint Thickness** | `catDepanKap`, `catBelakangTrunk`, `catBelakangBumper`, `catKanan*` (×5), `catKiri*` (×5) | `String?` |
| **Features** | `airbagSelectedValue`, `sistemAudioSelectedValue`, `powerWindowSelectedValue`, `sistemAcSelectedValue`, `centralLockSelectedValue`, `electricMirrorSelectedValue`, `remAbsSelectedValue` + `fiturCatatanList` | `int?`, `List<String>?` |
| **Engine** | 27× `*SelectedValue` + `mesinCatatanList` | `int?`, `List<String>?` |
| **Interior** | 25× `*SelectedValue` + `interiorCatatanList` | `int?`, `List<String>?` |
| **Exterior** | 30× `*SelectedValue` + `eksteriorCatatanList` | `int?`, `List<String>?` |
| **Tires & Undercarriage** | 17× `*SelectedValue` + `banDanKakiKakiCatatanList` | `int?`, `List<String>?` |
| **Test Drive** | 7× `*SelectedValue` + `testDriveCatatanList` | `int?`, `List<String>?` |
| **Tools Test** | 8× `*SelectedValue` + `toolsTestCatatanList` | `int?`, `List<String>?` |

---

### ImageData (Mandatory Photos)
```
label: String           // e.g. "Tampak Depan"
imagePath: String       // path to compressed JPEG on device
needAttention: bool     // inspector flagged this photo
category: String        // e.g. "General", "Eksterior"
isMandatory: bool       // always true for this model
rotationAngle: int      // 0, 90, 180, 270
originalRawPath: String // path to uncompressed original
```

---

### TambahanImageData (Additional Photos)
```
label: String           // user-provided label
imagePath: String       // path to compressed JPEG
category: String        // e.g. "Eksterior Tambahan"
needAttention: bool
isMandatory: bool       // always false
```

---

### UploadableImage (Upload Payload DTO)
```
imagePath: String
label: String
needAttention: bool
category: String
isMandatory: bool
```
`toJson()` → metadata object sent alongside photo in multipart form data.

---

### UserData / AuthResponse
```
UserData:
  id: String
  name: String
  email: String
  inspectionBranchCity: String?

AuthResponse:
  accessToken: String
  refreshToken: String
  user: UserData
```

---

### Inspector
```
id: String
name: String
email: String
```

---

### InspectionBranch
```
id: String
city: String  (or name — Assumption, field name from fromJson)
```

---

### ApiException
```
message: String
statusCode: int?
responseData: dynamic
```

---

## 7. Business Logic

### Submission Rules
1. **Checkbox required**: Cannot submit without checking the declaration checkbox on the Finalisasi page
2. **Image processing must be idle**: `imageProcessingServiceProvider.isAnyProcessing` must be `false`
3. **No concurrent submissions**: if already loading, show warning and abort
4. **Required field validation**: Pages 0 (Identitas) and 9 (DataKendaraan) must pass Flutter `Form` validation
5. **Tambahan label validation**: Every Tambahan photo that has an image path must have a non-empty, non-default label
6. **Inspector ID required**: `userInfoProvider` must return a valid user with an ID — submission aborted otherwise

### Upload Resume Logic
- Form data is cached (`submissionDataCacheProvider`) after first successful POST to `/inspections`
- If the exact same `FormData` (equality via `Equatable`) is re-submitted, the existing `inspectionId` is reused
- Image paths uploaded in previous (interrupted) sessions are tracked; only unuploaded images are sent
- This allows the inspector to retry a failed submission without duplicating form data

### Token Lifecycle
- Access token injected into all requests via Dio interceptor
- On 401: interceptor calls `authService.checkTokenValidity()` → tries refresh → retries request
- If refresh fails: `authService.logout()` called, tokens cleared
- During form submission: 401 → force navigate to Login

### Overall Rating Calculation
- `calculateOverallRating(formData)` from `lib/utils/calculation_utils.dart`
- Likely a weighted average of `interiorSelectedValue`, `eksteriorSelectedValue`, `kakiKakiSelectedValue`, `mesinSelectedValue` (Assumption — function not fully read)

### Inspection Date
- `inspectionDate` sent to API is `DateTime.now().toIso8601String()` at submission time, not `tanggalInspeksi` from form — the form date appears to be for scheduling/display purposes

---

## 8. Assets & Integrations

### Camera
- **Package**: `camera` 0.11.3 (custom `MultiShotCameraScreen`) + `image_picker` 1.2.1 (gallery fallback)
- **Usage**: Each photo slot can open the custom camera or pick from gallery
- **Sensor**: `sensors_plus` 7.0.0 — accelerometer data used for level indicator in camera screen
- **Save to gallery**: `gal` 2.3.2 — inspectors can save captured photos to device gallery

### File Uploads
- **Format**: `multipart/form-data`
- **Fields per batch**: `photos[]` (up to 10 files) + `metadata` (JSON string array of `UploadableImage.toJson()`)
- **MIME detection**: `mime` package for content type
- **Compression**: `flutter_image_compress` before saving to disk

### Permissions Required
| Permission | Why |
|---|---|
| Camera | Photo capture |
| Photo Library / Media | Gallery access for image picker + save to gallery |
| Storage (Android) | Write compressed images to app directory |

### Firebase Crashlytics
- `firebase_crashlytics` 5.0.6
- Global error handlers: `FlutterError.onError` + `PlatformDispatcher.instance.onError`
- Per-service error recording in `AuthService`, `InspectionService`, `FormNotifier`
- Non-fatal errors (e.g., image pre-cache failure) recorded with `fatal: false`

### Environment Variables (`.env`)
```
API_BASE_URL=https://production.api.url
API_BASE_URL_DEBUG=https://staging.api.url
```

---

## 9. Edge Cases & Observations

### Missing / Weak Validations
- **No mandatory photo enforcement**: Mandatory photo pages have no validation gate — inspector can advance with empty photo slots
- **No date range validation**: Tax dates and inspection date have no min/max constraints
- **Tambahan label validation only at submit**: Inspector can leave labels empty throughout the form and only discovers the error at the very end
- **No network-offline detection**: The app has no explicit offline mode indicator or queue for when connectivity is unavailable during submission

### Performance Concerns
- **FormData is a single massive Equatable object** with 200+ fields — every state change rebuilds the entire object via `copyWith`. In React Native, consider slicing state into per-section stores
- **Image pre-caching on app start**: All Tambahan images are pre-cached synchronously in `initState` post-frame — could delay perceived readiness on devices with many stored images
- **20-page PageView with all pages mounted**: Flutter builds all 20 pages at once in the PageView. In React Native, prefer lazy-loaded screens

### Architecture Notes
- `switchLampuSelectedValue` is mapped to both `switchLampu` and `switchLampuInterior` in the API payload — this appears to be a **duplication bug** (same field sent twice under different keys)
- `repairEstimations` uses `price.replaceAll('.', '')` to strip thousands separators before sending — the formatter must always use `.` as the thousands separator
- `inspectorId` in the identity form section is used as `namaInspektor` in the API payload — the field semantics are inverted in the API mapping (`"namaInspektor": formData.inspectorId`) — likely the API expects the inspector's ID string in that field

### Improvements for React Native Migration
- Break `FormData` into smaller per-section state slices (Zustand stores or Redux slices)
- Implement `react-native-vision-camera` for the custom camera screen (closer parity to Flutter's `camera` package)
- Use `expo-file-system` for file storage and `expo-secure-store` for token storage
- Add offline queue using `react-native-queue` or similar for resilient uploads
- Replace the 20-page `PageView` with `React Navigation` stack navigator (lazy screen loading)

---

## 10. Suggested React Native (Expo) Mapping

### Flutter → React Native Equivalents

| Flutter | React Native / Expo |
|---|---|
| `PageView` (20-page form) | `react-navigation` Stack or a custom `FlatList`/`ScrollView` with page indices |
| `Riverpod NotifierProvider` | **Zustand** store (closest match — simple, no boilerplate) or Redux Toolkit slice |
| `Riverpod FutureProvider` | React Query (`useQuery`) or SWR |
| `Riverpod family provider` | Zustand with a Map/dictionary keyed by identifier |
| `Dio` + interceptors | **Axios** with interceptors, or `ky` |
| `flutter_secure_storage` | `expo-secure-store` |
| `path_provider` + File JSON | `expo-file-system` (read/write JSON to `FileSystem.documentDirectory`) |
| `image_picker` | `expo-image-picker` |
| `camera` package | `react-native-vision-camera` (or `expo-camera` for simpler use) |
| `flutter_image_compress` | `expo-image-manipulator` |
| `gal` (save to gallery) | `expo-media-library` |
| `sensors_plus` (accelerometer) | `expo-sensors` (`Accelerometer`) |
| `firebase_crashlytics` | `@react-native-firebase/crashlytics` |
| `flutter_dotenv` | `expo-constants` + `app.config.js` extra env vars, or `react-native-dotenv` |
| `flutter_native_splash` | `expo-splash-screen` |
| `package_info_plus` | `expo-application` |
| `open_file` | `expo-sharing` or `Linking.openURL` |
| `flutter_markdown_plus` | `react-native-markdown-display` |
| `TextFormField` + `FormKey` validation | `react-hook-form` with `yup` / `zod` schema validation |
| `ExpandableTextField` (bullet list) | Custom `TextInput` with `BulletListInputFormatter` logic |
| `ThousandsSeparatorInputFormatter` | Custom `onChangeText` handler or `react-native-masked-text` |
| `DateInputFormatter` | `react-native-date-picker` or `@react-native-community/datetimepicker` |
| `Google Fonts (Rubik)` | `expo-font` with `@expo-google-fonts/rubik` |
| `Equatable` | Custom equality check or Zustand's `shallow` comparator |
| `CancelToken` (Dio) | Axios `CancelToken` / `AbortController` |
| `ToggleableNumberedButtonList` | Custom `TouchableOpacity` row component with selected index state |
| `ToggleOptionWidget` (binary) | Custom two-button toggle or `@react-native-community/segmented-control` |
| `CustomMessageOverlay` | Custom toast component, or `react-native-toast-message` |
| `CupertinoPageRoute` | `react-navigation` default `stack` transition |
| `UpdateDialog` | Custom modal + `expo-updates` for OTA, or `react-native-in-app-review` for store updates |
| Material 3 Theme | `react-native-paper` (Material 3 support) |

### Suggested Core Libraries

```json
{
  "navigation": "expo-router (file-based) OR @react-navigation/native + @react-navigation/stack",
  "state": "zustand",
  "server-state": "@tanstack/react-query",
  "forms": "react-hook-form + zod",
  "http": "axios",
  "camera": "react-native-vision-camera",
  "image": "expo-image-picker + expo-image-manipulator",
  "storage": "expo-file-system + expo-secure-store",
  "crashlytics": "@react-native-firebase/crashlytics",
  "ui": "react-native-paper OR @shopify/restyle",
  "fonts": "@expo-google-fonts/rubik + expo-font",
  "sensors": "expo-sensors",
  "gallery": "expo-media-library",
  "splash": "expo-splash-screen",
  "appInfo": "expo-application",
  "toast": "react-native-toast-message",
  "markdown": "react-native-markdown-display"
}
```

### Suggested Zustand Store Structure

```typescript
// Mirrors Flutter's provider architecture
useFormStore          // formData (all 200+ fields, split into sub-slices)
  useIdentityStore    // Page 0 fields
  useVehicleStore     // Page 9 fields
  useEquipmentStore   // Page 10 fields
  useAssessmentStore  // Pages 11-18 scores and notes
  usePaintStore       // Page 3 paint thickness

useAuthStore          // token, user info, login/logout actions
useImageStore         // mandatory photos (wajib) — flat list
useTambahanStore      // additional photos — Map<identifier, TambahanImage[]>
useSubmissionStore    // { isLoading, message, progress, cache }
useNavigationStore    // currentPageIndex, pageController equivalent
```

---

*Document generated from source code analysis — 2026-03-26*
