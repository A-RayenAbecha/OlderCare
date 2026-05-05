# OlderCare Health Profile

Responsive Spring Boot + Thymeleaf web application for a passwordless personal health space, backed by Supabase PostgreSQL.

## What Is Included

- Passwordless access flow using QR/code entry and device session
- Patient signup collects hospital ID, civil data, and contact details before generating an access code and QR code
- Caregiver signup collects hospital ID and professional details before generating an access code and QR code
- Caregivers can consult and update only patients from their own hospital ID
- Caregivers create appointments for patients
- Patients can fill vaccine history; caregivers from the same hospital can edit it
- Optional patient medical profile screens for chronic history, surgery, OB/GYN, allergies, and lifestyle
- Mobile-first dashboard screens:
  - Medications
  - Appointments
  - Vaccines
- JPA entities and repositories for Supabase/PostgreSQL
- Docker and docker-compose files

## Project Structure

```text
src/main/java/com/oldercare
  config/
  controller/
  dto/
  entity/
  repository/
  security/
  service/
  util/

src/main/resources
  application.yml
  static/css/style.css
  static/js/main.js
  templates/
```

## Requirements

- Java 17 or newer
- Maven 3.6 or newer
- Supabase PostgreSQL database

## Configuration

Copy `.env.example` to `.env` or set these environment variables:

```text
SUPABASE_DB_URL=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=your_supabase_database_password
JWT_SECRET=your-super-secret-key-change-in-production-this-must-be-at-least-256-bits-long
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=http://localhost:8080
```

`src/main/resources/application.yml` already reads those values.

Database schema is managed by Flyway migrations in `src/main/resources/db/migration`. Hibernate validates the schema at startup instead of silently changing tables.

## Run

Run with Supabase:

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The `dev` profile does not use H2. The app imports `.env` automatically and connects to Supabase.

You can also run:

```powershell
mvn spring-boot:run
```

Open:

```text
http://localhost:8080/auth/welcome
```

## Build

```powershell
mvn clean package
java -jar target/oldercare-app-1.0.0.jar
```

## Main Routes

- `/auth/welcome`
- `/auth/login-code-page`
- `/auth/signup/patient`
- `/auth/signup/caregiver`
- `/dashboard`
- `/dashboard/appointments`
- `/dashboard/medications`
- `/dashboard/vaccines`
- `/caregiver/patients`

## Notes

Maven is required for normal builds. If `mvn` is not recognized on Windows, install Maven and add its `bin` directory to `PATH`.
