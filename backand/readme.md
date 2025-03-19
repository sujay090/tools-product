# 📌 Backend API Documentation

## 📍 Base URL

```
http://localhost:3000/
```

---

## 📝 Authentication Endpoints

### 1️⃣ **User Registration**

**Endpoint:**

```
POST /users/register
```

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "createUser": "User Registration Data",
  "token": "JWT-TOKEN"
}
```

---

### 2️⃣ **User Login**

**Endpoint:**

```
POST /users/login
```

**Request Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "user": "Login data",
  "token": "JWT-TOKEN"
}
```

---

### 3️⃣ **User Logout**

**Endpoint:**

```
POST /users/logout
```

**Headers:**

```json
{
  "Authorization": "Bearer JWT-TOKEN"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 📝 User Profile

### 4️⃣ **Get User Profile**

**Endpoint:**

```
GET /users/profile
```

**Headers:**

```json
{
  "Authorization": "Bearer JWT-TOKEN"
}
```

**Response:**

```json
{
  "user": "user data"
}
```

---
This is the complete of the User End Points ✅
---


## 📝 Image upload Endpoints

### 1️⃣ **Image upload**

**Endpoint:**

```
POST /tools/image-uploads
```

**Request Body:**

```json
{
  "image": "image file",
}
```

**Response:**

```json
{
  "message": "File compressed successfully",
  "originalSize": `(${(originalSize / 1024).toFixed(
        2
      )} KB)`
  "compressedSize":`bytes (${(
        compressedSize / 1024
      ).toFixed(2)} KB)`
  "bytesReduced": `(${(bytesReduced / 1024).toFixed(
        2
      )} KB)`
  "originalImage":"originalBase64"
  "compressedImage": "compressedBase64",
  "format": "format",
}
```
Complete the image compresser endpoints ✅
---

