# BlogWeb

ระบบ Blog แบบ Full-stack ที่พัฒนาด้วย Next.js และ Supabase สำหรับใช้ส่งงาน **Assignment A – ระบบ Blog** ตามโจทย์ตำแหน่ง Software Developer By Warakorn

---

## ภาพรวมของโปรเจกต์

ระบบนี้ประกอบด้วยฟีเจอร์หลักดังนี้

- หน้ารวมบทความ
- หน้ารายละเอียดบทความ
- ระบบคอมเมนต์ที่ต้องรอแอดมินอนุมัติก่อนแสดง
- ระบบล็อกอิน / สมัครสมาชิก
- Admin Panel สำหรับจัดการบทความและคอมเมนต์
- รองรับรูปภาพแบบ URL และอัปโหลดไฟล์
- Deploy ขึ้นใช้งานบน Vercel

ระบบนี้พัฒนาขึ้นเพื่อให้ครอบคลุมโจทย์ Assignment A ได้แก่
- แสดงรายการ Blog พร้อมรูปปก ชื่อ เนื้อหาย่อ และวันที่โพสต์
- ค้นหาจากชื่อ Blog ได้
- Pagination แสดงผลหน้าละ 10 รายการ
- หน้ารายละเอียดมีรูปปก รูปเพิ่มเติมได้ไม่เกิน 6 รูป เนื้อหาเต็ม และจำนวนผู้เข้าชม
- ระบบคอมเมนต์ที่ต้องกรอกชื่อผู้ส่ง และต้องผ่านการ approve ก่อนแสดง
- Admin Panel ที่ใช้จัดการข้อมูล Blog, slug, publish state และการ approve / reject comment 

---

## วิธีการรันโปรเจกต์

### 1) Clone โปรเจกต์

git clone https://github.com/FairFairFairFair/blogWeb.git
cd blogWeb

### 2) ติดตั้ง dependencies
npm install

### 3) สร้างไฟล์ environment
NEXT_PUBLIC_SUPABASE_URL= supaBase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=supaBase ANON Key

### 4) รันโปรเจกต์ในโหมดพัฒนา
npm run dev
เปิด broswer http://localhost:3000

---

## Tech Stack
Frontend
- Next.js 16.2.4
- React 19.2.4
- TypeScript
- CSS Modules

Backend / BaaS
- Supabase Auth สำหรับระบบสมัครสมาชิก / เข้าสู่ระบบ
- Supabase Database (PostgreSQL) สำหรับเก็บข้อมูลบทความ คอมเมนต์ และ role ของผู้ใช้
- Supabase Storage สำหรับเก็บรูปภาพที่อัปโหลด

Deployment
- Vercel

Tooling
- ESLint
- npm

---

## ฟีเจอร์หลักของระบบ
ฝั่งผู้ใช้ทั่วไป
- ดูรายการบทความทั้งหมด
- ค้นหาบทความจากชื่อ
- แสดงผลแบบแบ่งหน้า (หน้าละ 10 รายการ)
- ดูรายละเอียดบทความ
- เห็นจำนวนผู้เข้าชม
- เห็นเฉพาะคอมเมนต์ที่ผ่านการอนุมัติแล้ว
- ส่งคอมเมนต์ใหม่ได้
  
ฝั่งระบบสมาชิก
- สมัครสมาชิก
- เข้าสู่ระบบ
- ออกจากระบบ
  
ฝั่งแอดมิน
- จัดการบทความผ่านหน้า Admin Blogs
- สร้าง / แก้ไข / ลบบทความ
- เปลี่ยน slug
- Publish / Unpublish
- จัดการรูปปกและรูปเพิ่มเติม
- ตรวจสอบคอมเมนต์ในหน้า Admin Comments
- Approve / Reject คอมเมนต์

---

## โครงสร้างหน้าเว็บ
- / -> หน้ารวมบทความ
- /blog/[slug] -> หน้ารายละเอียดบทความ
- /login -> หน้าเข้าสู่ระบบ
- /register -> หน้าสมัครสมาชิก
- /admin/blogs -> หน้าจัดการบทความของแอดมิน
- /admin/comments -> หน้าจัดการคอมเมนต์ของแอดมิน

---
## Database Schema
โปรเจกต์นี้ออกแบบฐานข้อมูลเป็น 4 ตารางหลัก ตามแนวคิดของระบบ Blog ที่มีบทความ รูปเพิ่มเติม คอมเมนต์ และสิทธิ์ผู้ใช้

1) profiles
ใช้เก็บ role ของผู้ใช้ โดยเชื่อมกับ auth.users
- id (uuid, PK) → อ้างอิงจาก auth.users.id
- role (text) → เช่น admin, user
- created_at (timestamptz)
  
2) blogs
ใช้เก็บข้อมูลหลักของบทความ
- id (uuid, PK)
- title (text)
- slug (text)
- excerpt (text)
- content (text)
- cover_image_url (text)
- cover_image_mode (text) → url หรือ upload
- cover_image_path (text)
- is_published (bool)
- published_at (timestamptz)
- view_count (int4)
- created_at (timestamptz)
- updated_at (timestamptz)
  
3) blog_images
ใช้เก็บรูปเพิ่มเติมของแต่ละบทความ
- id (uuid, PK)
- blog_id (uuid, FK → blogs.id)
- image_url (text)
- image_mode (text) → url หรือ upload
- image_path (text)
- sort_order (int2)

4) comments
ใช้เก็บคอมเมนต์และสถานะการอนุมัติ
- id (uuid, PK)
- blog_id (uuid, FK → blogs.id)
- author_name (text)
- content (text)
- status (text) → pending, approved, rejected
- created_at (timestamptz)
- approved_at (timestamptz)
- approved_by (uuid)

<img width="855" height="806" alt="webBlog" src="https://github.com/user-attachments/assets/76285694-ebf1-49de-a59e-423bb458d9c2" />

---

## คำอธิบายการตัดสินใจออกแบบ
### 1) ทำไมเลือกใช้ Next.js
เลือกใช้ Next.js เพราะเหมาะกับงานเว็บที่มีหลายหน้า, รองรับ routing แบบเป็นระบบ, แยก public page / auth page / admin page ได้ชัดเจน และ deploy ขึ้น Vercel ได้ง่าย

### 2) ทำไมเลือกใช้ Supabase
เลือกใช้ Supabase เพราะรวมหลายอย่างไว้ในที่เดียว ได้แก่
- authentication
- PostgreSQL database
- storage

---
## Assumption และข้อจำกัดที่กำหนดเอง
### Assumption
- ผู้ใช้ทั่วไปสามารถอ่านบทความได้โดยไม่ต้อง login
- เฉพาะผู้ใช้ที่มี profiles.role = 'admin' เท่านั้นที่เข้า admin panel ได้
- ระบบค้นหาค้นหาจากชื่อบทความ
- แสดงผลบทความหน้าละ 10 รายการ ตามโจทย์
- บทความหนึ่งมีรูปเพิ่มเติมได้ไม่เกิน 6 รูป ตามโจทย์
- published_at และ view_count ไม่เปิดให้แก้ไขตรง ๆ ในหน้า admin ตามโจทย์ที่ระบุว่าแอดมินแก้ข้อมูลทั้งหมดของ Blog ได้ ยกเว้นวันที่โพสต์และจำนวนผู้เข้าชม
- รูปภาพที่อัปโหลดจะถูกเก็บใน Supabase Storage

### ข้อจำกัด
- การนับ view count ยังเป็นการนับแบบง่าย ไม่ใช่ unique visitor
- ระบบ editor ของบทความยังเป็น plain text ยังไม่มี rich text editor
- ระบบค้นหายังเป็นแบบ title matching ธรรมดา ยังไม่ใช่ full-text search
- คอมเมนต์ยังเป็นการ approve แบบ manual
- ยังไม่มีระบบ automated tests
- ถ้าเปิด email confirmation ใน Supabase การสมัครสมาชิกอาจได้รับผลจาก rate limit ของระบบอีเมล

---
## ทำถึงไหนแล้ว
- ส่วนที่ทำเสร็จแล้ว
- หน้ารวม Blog
- ค้นหาจากชื่อ Blog
- Pagination
- หน้ารายละเอียด Blog
- ระบบแสดง view count
- ระบบคอมเมนต์
- ระบบ approve / reject comment
- ระบบ login / register / logout
- ระบบ admin แยกสิทธิ์ด้วย role
- ระบบจัดการ Blog
- ระบบจัดการรูปปกและรูปเพิ่มเติม
- รองรับทั้ง URL และอัปโหลดไฟล์
- Deploy ขึ้น Vercel
- ตั้งค่า metadata, favicon, opengraph image, twitter image, manifest
## ส่วนที่ยังสามารถพัฒนาต่อได้
- เพิ่ม server-side validation ให้รัดกุมขึ้น
- เพิ่มระบบ test
- ปรับ UX ของ admin ให้ลื่นขึ้นอีก
- ทำ audit log สำหรับการ approve / reject comment
- ทำ unique view count ที่แม่นยำขึ้น
- เพิ่ม rich text editor สำหรับบทความ

## จะต่ออย่างไรถ้ามีเวลาเพิ่ม
### ถ้ามีเวลาเพิ่ม ผมจะพัฒนาต่อในลำดับนี้
#### 1) เพิ่ม validation ฝั่ง server ให้ครบ
- ตอนนี้แนวทาง validate comment ถูกออกแบบไว้แล้ว แต่หากมีเวลาเพิ่มควรบังคับตรวจที่ฝั่ง server หรือ database layer ด้วย เพื่อกันข้อมูลไม่ตรง requirement หลุดเข้า DB

#### 2) ปรับปรุงระบบนับผู้เข้าชม
- แยกตาราง analytics หรือใช้แนวทางนับแบบ session / unique user เพื่อให้ view count แม่นยำขึ้น

#### 3) เพิ่ม test
- unit tests
- integration tests
- end-to-end tests สำหรับ flow สำคัญ เช่น login, publish blog, approve comment

#### 4) ปรับระบบจัดการบทความ
- rich text editor
- drag-and-drop สำหรับรูป
- preview ก่อน publish

#### 5) ปรับปรุง production readiness
- ใช้ custom SMTP แทนค่า default
- เพิ่ม logging / monitoring
- ตรวจสอบ RLS และ authorization ให้เข้มขึ้น

---
# Deployment

## Production URL:
https://blog-web-roan.vercel.app

## Repository:
https://github.com/FairFairFairFair/blogWeb

ผู้จัดทำ
ชื่อ: Warakorn Chanthawong
