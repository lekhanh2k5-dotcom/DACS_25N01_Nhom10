# ⚠️ BẢO MẬT - ĐỌC TRƯỚC KHI DEPLOY

## 🔒 Checklist Bảo Mật

### ✅ ĐÃ HOÀN THÀNH:
- [x] Firestore Rules chặn user tự cộng coin
- [x] Firestore Rules chặn user tạo/sửa/xóa songs
- [x] Transactions chỉ được tạo khi mua hàng hợp lệ
- [x] Electron contextIsolation enabled
- [x] serviceAccountKey.json trong .gitignore

### ⚠️ CẦN LÀM TRƯỚC KHI PUBLIC:

#### 1. Xác nhận Firestore Rules đã deploy
```bash
# Vào Firebase Console → Firestore → Rules
# Paste nội dung từ firestore.rules.example
# Click "Publish"
```

#### 2. Set Admin Custom Claims
```bash
# Sửa UID trong setadmin.js
node setadmin.js
```

#### 3. Kiểm tra serviceAccountKey.json
```bash
# ⚠️ File này KHÔNG ĐƯỢC commit vào git
# ✅ Đã có trong .gitignore
# ✅ Khi build production, copy vào resourcesPath
```

#### 4. Test toàn bộ
- [ ] User thường KHÔNG vào được admin panel (hoặc không thao tác được)
- [ ] User thường KHÔNG tự cộng coin được
- [ ] User thường KHÔNG tạo/sửa/xóa songs được
- [ ] Mua hàng hoạt động bình thường
- [ ] Admin upload/edit/delete songs hoạt động

#### 5. Firebase API Key
```
✅ Client API Key (trong firebase.js) được phép public
✅ Bảo mật thực sự nằm ở Firestore Rules
```

## 🚀 Sẵn sàng Deploy khi:
- ✅ Tất cả checklist trên hoàn thành
- ✅ Test kỹ trên môi trường dev
- ✅ Firestore Rules đã publish
- ✅ serviceAccountKey.json được bảo vệ
