# AnaliticSaas Monorepo (Nx)

SaaS dashboard and CRM built with Angular (frontend) and NestJS (backend), using Prisma ORM with PostgreSQL.

## Requisitos

- Node.js v20+
- Docker (opcional, para base de datos Postgres local)

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

_(El proxy del frontend redirige automáticamente las peticiones `/api/_`al backend en el puerto`3000`)\*.

### Credenciales Demo (Modo Offline Automático)

Si el servidor no puede conectarse a la base de datos PostgreSQL en el inicio de la app, funcionará en modo offline demo. Usa los siguientes datos para ingresar o pulsa el botón "Acceder como Invitado" en la pantalla de login:

- **Organización:** `acme-corp`
- **Usuario:** `admin@empresa.com`
- **Contraseña:** `SecureP@ss123`

---

## Arquitectura y Funcionalidades Implementadas

El proyecto está diseñado bajo una arquitectura limpia y modular utilizando un monorepo administrado por **Nx**.

### 1. Librería Compartida (`libs/shared`)

- Ubicada en `@analitic-saas/shared`.
- Contiene todas las interfaces, DTOs compartidos y contratos de tipo de datos (Auth, Dashboard, KPIs y payloads de SSE), garantizando un acoplamiento seguro y type-safe entre el frontend y el backend.

### 2. Autenticación y Control de Acceso Granular (RBAC)

- **Backend (NestJS):**
  - Autenticación mediante tokens JWT y Refresh Tokens rotativos (cifrado con `bcryptjs`).
  - Sistema de validación granular con el decorador `@RequirePermissions('resource:action')` y un interceptor de metadatos `PermissionsGuard`.
- **Frontend (Angular):**
  - Gestión de estado global de sesión utilizando el nuevo **NgRx Signal Store** (`@ngrx/signals`).
  - Protección de rutas mediante Guards funcionales de Angular (`authGuard` y `permissionGuard`).
  - Interceptor HTTP funcional (`jwtInterceptor`) que adjunta los tokens Bearer y maneja la renovación de sesión automática ante errores `401`.

### 3. Dashboard Interactivo y Métricas en Vivo

- **Backend (NestJS):**
  - Endpoints agregadores para KPIs generales y series de tiempo de ingresos recurrentes (MRR).
  - Canal de comunicación en tiempo real a través de **Server-Sent Events (SSE)** en `/api/dashboard/stream` que empuja fluctuaciones de métricas y notificaciones de transacciones al instante.
- **Frontend (Angular):**
  - Métricas reactivas y dinámicas integradas con un `DashboardStore` de signals.
  - Visualización de gráficos de línea y área mediante **Chart.js nativo** integrado dentro de un `effect()` para actualizar y redibujar el canvas de manera fluida y sin parpadeos.
  - Conexión reactiva al flujo SSE para actualizar los KPIs en pantalla y disparar notificaciones de banner animadas.

### 4. CRM y Formulario de Cliente Corporativo

- **Backend (NestJS):**
  - Controlador y servicios CRUD para clientes corporativos con transacciones ACID de Prisma para persistir simultáneamente la información legal, dirección fiscal, contactos múltiples y especificaciones de plan.
  - Endpoints de validación asíncrona optimizados (`/check-tax-id`, `/check-domain`).
- **Frontend (Angular):**
  - Formulario reactivo avanzado (`ClientFormComponent`) estructurado con sub-grupos y un `FormArray` dinámico para agregar/quitar contactos asociados.
  - **Validadores Síncronos Personalizados:**
    - `requirePrimaryContact`: Exige al menos un contacto asignado como "Primario".
    - `userLimitByPlan`: Restringe el límite de usuarios según la cuota comercial del plan seleccionado (Starter: 10, Professional: 50, Enterprise: 500).
  - **Validadores Asíncronos con Debounce (RxJS):**
    - `taxIdExistsValidator` y `domainExistsValidator` que ejecutan llamadas a la API con un retardo de `500ms` para evitar spamming en el servidor, mostrando un loader de verificación (`🔍 Verificando...`) en tiempo real.

### 5. Módulos Auxiliares de Gestión

- **Usuarios:** Tabla premium que lista los miembros de la organización con sus respectivos roles del sistema.
- **Facturación:** Vista detallada de la cuota consumida de almacenamiento y usuarios, configuración de pago y tabla con el historial de facturas emitidas.
- **Configuración:** Panel para personalizar el nombre de la organización, idioma predeterminado y zona horaria.

---

## Comandos Útiles

- **Levantar base de datos PostgreSQL local:**
  ```bash
  docker-compose up -d
  ```
- **Construir el backend:**
  ```bash
  npx nx build api
  ```
- **Construir el frontend:**
  ```bash
  npx nx build web
  ```
