## Expense Tracker Backend (Spring Boot + MySQL)

### Tech
- Spring Boot (Web, Validation)
- Spring Data JPA (Hibernate)
- MySQL

### Project structure
```
src/main/java/com/example/expensetracker
  ├─ ExpenseTrackerApplication.java
  ├─ common/exception
  │   ├─ ApiErrorResponse.java
  │   ├─ GlobalExceptionHandler.java
  │   └─ ResourceNotFoundException.java
  ├─ config
  │   └─ SampleDataLoader.java
  └─ expense
      ├─ controller/ExpenseController.java
      ├─ dto
      │   ├─ ExpenseReportResponse.java
      │   ├─ ExpenseRequest.java
      │   └─ ExpenseResponse.java
      ├─ model
      │   ├─ Expense.java
      │   └─ ExpenseCategory.java
      ├─ repository/ExpenseRepository.java
      └─ service
          ├─ ExpenseService.java
          └─ ExpenseServiceImpl.java
```

### Configure database
Edit `src/main/resources/application.properties`:
- `spring.datasource.username`
- `spring.datasource.password`

### Run
```bash
mvn spring-boot:run
```

### API endpoints
- `POST /expenses`
- `GET /expenses`
- `PUT /expenses/{id}`
- `DELETE /expenses/{id}`
- `GET /expenses/report`

### UI (browser)
- Open `http://localhost:8081/`

### Postman examples

Create expense
```http
POST http://localhost:8080/expenses
Content-Type: application/json

{
  "amount": 19.99,
  "category": "FOOD",
  "description": "Groceries",
  "date": "2026-04-01"
}
```

Get all expenses
```http
GET http://localhost:8080/expenses
```

Update expense
```http
PUT http://localhost:8080/expenses/1
Content-Type: application/json

{
  "amount": 25.00,
  "category": "TRAVEL",
  "description": "Metro card top-up",
  "date": "2026-04-01"
}
```

Delete expense
```http
DELETE http://localhost:8080/expenses/1
```

Report
```http
GET http://localhost:8081/expenses/report
```

