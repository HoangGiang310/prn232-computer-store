# PostgreSQL Setup for Computer Store Backend

This backend uses PostgreSQL and a dedicated database named `computerstore`.

## 1. Create the database using psql

If you have `psql` installed, run:

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE computerstore;"
```

If your PostgreSQL superuser has a different password, add `-W` and enter the password when prompted.

## 2. Verify connection

```bash
psql -U postgres -h localhost -p 5432 -d computerstore -c "SELECT current_database();"
```

## 3. Use the existing backend connection string

The backend uses the connection string in `backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=computerstore;Username=postgres;Password=123456"
}
```

## 4. Run the backend

When the backend starts, it will ensure tables are created and seed default users for:

- `admin` / `Admin@123`
- `staff` / `Staff@123`
- `customer` / `Customer@123`

Use `dotnet run` from the `backend` folder after the database is ready.
