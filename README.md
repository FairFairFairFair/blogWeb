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
/ -> หน้ารวมบทความ
/blog/[slug] -> หน้ารายละเอียดบทความ
/login -> หน้าเข้าสู่ระบบ
/register -> หน้าสมัครสมาชิก
/admin/blogs -> หน้าจัดการบทความของแอดมิน
/admin/comments -> หน้าจัดการคอมเมนต์ของแอดมิ