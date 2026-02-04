# our-app

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Firebase Setup

1. **Tạo Firebase Project** tại https://console.firebase.google.com
2. **Enable Services:**
   - Authentication (Email/Password)
   - Firestore Database (database name: `skysheet`)
   - Storage

3. **Cấu hình Firestore Rules:**
   Copy rules từ file `firestore.rules.example` vào Firebase Console → Firestore → Rules

4. **Download Service Account Key:**
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key → Save as `serviceAccountKey.json` (root folder)
   - ⚠️ **KHÔNG ĐƯỢC COMMIT FILE NÀY VÀO GIT**

5. **Set Admin User:**
   ```bash
   # Sửa UID trong setadmin.js
   node setadmin.js
   ```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Security Notes

- ✅ Firestore Rules kiểm soát quyền truy cập backend
- ✅ Admin privileges qua Custom Claims
- ✅ Electron contextIsolation enabled
- ⚠️ `serviceAccountKey.json` phải được bảo vệ (đã có trong .gitignore)

## Production Deployment

1. **Đảm bảo `serviceAccountKey.json` có trong build:**
   - Dev: Root folder
   - Production: Cùng thư mục với executable

2. **Verify Firestore Rules đã deploy**
3. **Set admin custom claims cho admin users**
4. **Test toàn bộ chức năng trước khi release**
