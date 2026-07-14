# AnaliticSaas Monorepo (Nx)

SaaS dashboard and CRM built with Angular (frontend) and NestJS (backend), using Prisma ORM with PostgreSQL.

## Requisitos
* Node.js v20+
* Docker (opcional, para base de datos Postgres local)

## Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto basándote en la siguiente plantilla:
   ```env
   DATABASE_URL="postgresql://postgres:SecurePassword123@localhost:5432/analitic_saas?schema=public"
   JWT_SECRET="SuperSecureSecretKey1234567890!@#"
   JWT_REFRESH_SECRET="AnotherSuperSecureSecretKey1234567890!@#"
   ```

3. **Generar el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

## Servidor de Desarrollo (Local)

Para levantar el frontend Angular (puerto `4200`) y el backend NestJS (puerto `3000`) de forma simultánea:
```bash
npx nx serve web
```
*(El proxy del frontend redirige automáticamente las peticiones `/api/*` al backend en el puerto `3000`)*.

### Credenciales Demo (Modo Offline Automático)
Si el servidor no puede conectarse a la base de datos PostgreSQL en el inicio de la app, funcionará en modo offline demo. Usa los siguientes datos para ingresar:
* **Organización:** `acme-corp`
* **Usuario:** `admin@empresa.com`
* **Contraseña:** `SecureP@ss123`

## Comandos Útiles

* **Levantar base de datos PostgreSQL local:**
  ```bash
  docker-compose up -d
  ```
* **Construir el backend:**
  ```bash
  npx nx build api
  ```
* **Construir el frontend:**
  ```bash
  npx nx build web
  ```
