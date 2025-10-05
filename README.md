# 🏢 Building Management and Payments

A full-stack building management and payments system. Users can easily track and manage apartment information and payments.

![.NET](https://img.shields.io/badge/.NET-8.0.413-blue)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![SQLite](https://img.shields.io/badge/SQLite-3.43.2-orange)

---

## ✨ Features

### 🏢 Apartments Tab
- Add, update, and delete apartments with Block, Floor, Number, and Occupied status  
- Import random apartments (`import-random`)  
- Health check API available (`/api/Apartments/health`)  

**Frontend Apartments Tab Example:**

| ID  | Block | Floor | Number | Occupied | Actions      |
|-----|-------|-------|--------|----------|-------------|
| 20  | A     | 3     | 5      | Occupied | Edit / Delete |
| 21  | F     | 8     | 11     | Vacant   | Edit / Delete |
| 22  | C     | 5     | 2      | Occupied | Edit / Delete |

---

### 💳 Payments Tab
- Track payments for apartments (`Amount` and `Paid/Unpaid`)  
- View payment creation date  
- Update or delete payments  

**Frontend Payments Tab Example:**

| ID  | Apartment  | Amount | Paid   | Actions                 | Date                  |
|-----|-----------|--------|--------|------------------------|---------------------|
| 23  | A-5       | $1000  | Paid   | Toggle Paid / Edit / Delete | 07.09.2025 19:47:24 |
| 24  | F-11      | $300   | Unpaid | Toggle Paid / Edit / Delete | 07.09.2025 20:01:18 |
| 25  | C-2       | $500   | Paid   | Toggle Paid / Edit / Delete | 07.09.2025 20:01:26 |

---

## ⚙️ Backend API

RESTful API with full CRUD operations:

### Apartments
- `GET /api/Apartments` – List all apartments  
- `POST /api/Apartments` – Add a new apartment  
- `GET /api/Apartments/{id}` – Get a specific apartment  
- `PUT /api/Apartments/{id}` – Update a specific apartment  
- `DELETE /api/Apartments/{id}` – Delete a specific apartment  
- `POST /api/Apartments/import-random` – Import random apartments  
- `GET /api/Apartments/health` – Health check  

### Payments
- `GET /api/Payments` – List all payments  
- `POST /api/Payments` – Add a new payment  
- `GET /api/Payments/{id}` – Get a specific payment  
- `PUT /api/Payments/{id}` – Update a payment  
- `DELETE /api/Payments/{id}` – Delete a payment  

### Models
- `ApartmentCreateDTO`  
- `ApartmentUpdateDTO`  
- `PaymentCreateDTO`  

---

## 🛠 Technologies

- Backend: .NET 8.0.413  
- Frontend: React 19.1.1  
- Database: SQLite 3.43.2 

---

## 🚀 Installation & Running

```bash
# 1. Clone the repository
git clone https://github.com/Asyayla/building-management-and-payments.git
cd building-management-and-payments

# 2. Backend setup and run
dotnet restore
dotnet run
# Backend will run at: http://127.0.0.1:5287/swagger/index.html

# 3. Frontend setup and run (in a new terminal)
cd frontend
npm install
npm start
# Frontend will run at: http://localhost:3001

---

## Future Plans
- Add user authentication and login system  
- Dashboard and statistics  
- Mobile responsive design
