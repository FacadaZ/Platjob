# Guía de Rutas de la API y Formatos de Body (JSON)

Este documento detalla todas las rutas de la API de PlatJob que aceptan un **Request Body (JSON)**. Úsalo como referencia para estructurar tus peticiones desde el frontend o clientes de API (como Postman o Thunder Client).

---

## 1. Autenticación y Registro (`/api/auth`)

### 🔑 Registro de Usuario
* **Ruta:** `POST /api/auth/register`
* **Descripción:** Registra un nuevo usuario (sea Cliente o Técnico).
* **Autenticación:** Ninguna (Público).
* **Campos del Body:**
  * `name` *(string, requerido)*: Nombre completo (mín. 2 caracteres).
  * `email` *(string, requerido)*: Correo electrónico válido y único.
  * `password` *(string, requerido)*: Contraseña (mín. 6 caracteres).
  * `role` *(string, requerido)*: Debe ser `"CLIENT"` o `"TECHNICIAN"`.
  * `phone` *(string, opcional)*: Teléfono de contacto.
  * `location` *(string, opcional)*: Ubicación o ciudad del usuario.
  * `avatarUrl` *(string, opcional)*: URL válida de la imagen de avatar.
  * **Campos específicos para Técnicos (`role: "TECHNICIAN"`) [Todos son opcionales en el registro]:**
    * `category` *(string, opcional)*: Categoría de servicio (por defecto: `"General"`).
    * `specialties` *(array de strings, opcional)*: Especialidades del técnico (por defecto: `[]`).
    * `bio` *(string, opcional)*: Biografía o descripción.
    * `hourlyRate` *(number, opcional)*: Tarifa por hora (debe ser no negativa; por defecto: `0`).

#### 📝 Ejemplo de Body (Cliente):
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "CLIENT",
  "phone": "3001234567",
  "location": "Bogotá, Colombia"
}
```

#### 📝 Ejemplo de Body (Técnico):
```json
{
  "name": "Carlos Construye",
  "email": "carlos@example.com",
  "password": "password123",
  "role": "TECHNICIAN",
  "phone": "3009876543",
  "location": "Medellín, Colombia"
}
```

---

### 🔓 Iniciar Sesión
* **Ruta:** `POST /api/auth/login`
* **Descripción:** Autentica a un usuario y devuelve su token JWT.
* **Autenticación:** Ninguna (Público).
* **Campos del Body:**
  * `email` *(string, requerido)*: Correo electrónico registrado.
  * `password` *(string, requerido)*: Contraseña correspondiente.

#### 📝 Ejemplo de Body:
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

---

## 2. Gestión de Técnicos (`/api/technicians`)

### ✏️ Actualizar Mi Perfil Técnico
* **Ruta:** `PUT /api/technicians/profile/me`
* **Descripción:** Permite a un Técnico actualizar los datos de su perfil profesional y de usuario básico.
* **Autenticación:** Requerida (Bearer Token en cabecera `Authorization`).
* **Restricción:** Solo usuarios con rol `"TECHNICIAN"`.
* **Campos del Body (Todos son opcionales):**
  * `name` *(string, opcional)*: Actualizar nombre completo del usuario.
  * `phone` *(string, opcional)*: Actualizar teléfono.
  * `location` *(string, opcional)*: Actualizar ubicación.
  * `category` *(string, opcional)*: Categoría principal del servicio.
  * `specialties` *(array de strings, opcional)*: Lista de especialidades.
  * `bio` *(string, opcional)*: Biografía / descripción sobre su experiencia.
  * `hourlyRate` *(number, opcional)*: Tarifa por hora (debe ser no negativa).
  * `isAvailable` *(boolean, opcional)*: Estado de disponibilidad (`true` / `false`).
  * `responseTime` *(string, opcional)*: Tiempo estimado de respuesta (ej: `"Menos de 2 horas"`).

#### 📝 Ejemplo de Body:
```json
{
  "name": "Carlos Construye S.A.S",
  "phone": "3115551234",
  "category": "Plomería",
  "specialties": ["Fugas de agua", "Instalación de griferías", "Destape de tuberías"],
  "bio": "Plomero profesional certificado con más de 8 años de experiencia en emergencias domésticas.",
  "hourlyRate": 35.0,
  "isAvailable": true,
  "responseTime": "En menos de 1 hora"
}
```

---

### 🖼️ Agregar Elemento al Portafolio
* **Ruta:** `POST /api/technicians/portfolio`
* **Descripción:** Agrega un nuevo proyecto u obra realizada al portafolio del técnico.
* **Autenticación:** Requerida (Bearer Token).
* **Restricción:** Solo usuarios con rol `"TECHNICIAN"`.
* **Campos del Body:**
  * `imageUrl` *(string, requerido)*: URL válida de la imagen del proyecto.
  * `title` *(string, requerido)*: Título descriptivo de la obra (mín. 3 caracteres).
  * `description` *(string, opcional)*: Descripción del trabajo realizado.

#### 📝 Ejemplo de Body:
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1581094288338-2314dddb7eed",
  "title": "Renovación completa de baño",
  "description": "Se cambiaron tuberías de cobre viejas por tuberías de PVC de alta resistencia y se instalaron nuevos sanitarios."
}
```

---

## 3. Solicitudes de Servicio (`/api/service-requests`)

### 🛠️ Crear Solicitud de Servicio
* **Ruta:** `POST /api/service-requests`
* **Descripción:** Permite a un cliente enviar una nueva solicitud de servicio dirigida a un técnico específico.
* **Autenticación:** Requerida (Bearer Token).
* **Restricción:** Solo usuarios con rol `"CLIENT"`.
* **Campos del Body:**
  * `technicianId` *(number, requerido)*: El ID numérico del técnico que recibirá la solicitud.
  * `category` *(string, requerido)*: Categoría del servicio solicitado (ej: `"Plomería"`).
  * `title` *(string, requerido)*: Título breve del problema (mín. 5 caracteres).
  * `description` *(string, requerido)*: Explicación detallada del trabajo necesario (mín. 10 caracteres).
  * `address` *(string, requerido)*: Dirección donde se realizará el servicio.
  * `scheduledDate` *(string, opcional)*: Fecha y hora programadas en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).
  * `budget` *(number, opcional)*: Presupuesto estimado que ofrece el cliente (debe ser no negativo).

#### 📝 Ejemplo de Body:
```json
{
  "technicianId": 3,
  "category": "Plomería",
  "title": "Fuga de agua en lavaplatos",
  "description": "El tubo de abasto del lavaplatos gotea de manera continua y está inundando la cocina. Necesito reparación inmediata.",
  "address": "Calle 45 # 12-34, Apto 402",
  "scheduledDate": "2026-05-29T10:00:00.000Z",
  "budget": 50.0
}
```

---

### 🔄 Actualizar Estado de la Solicitud
* **Ruta:** `PATCH /api/service-requests/:id/status`
* **Descripción:** Cambia el estado de una solicitud de servicio (por ejemplo, cuando el técnico la acepta, inicia el trabajo, lo termina o la cancela).
* **Autenticación:** Requerida (Bearer Token).
* **Restricción:** Involucra a los participantes de la solicitud.
* **Campos del Body:**
  * `status` *(string, requerido)*: Debe ser uno de los siguientes estados válidos:
    * `"ACCEPTED"` (Aceptada por el técnico)
    * `"IN_PROGRESS"` (Trabajo iniciado)
    * `"COMPLETED"` (Trabajo terminado)
    * `"CANCELLED"` (Solicitud cancelada)
  * `agreedRate` *(number, opcional)*: Tarifa final acordada entre las partes para el servicio (debe ser no negativa).

#### 📝 Ejemplo de Body:
```json
{
  "status": "ACCEPTED",
  "agreedRate": 45.0
}
```

---

## 4. Reseñas y Calificaciones (`/api/reviews`)

### ⭐ Publicar una Reseña
* **Ruta:** `POST /api/reviews`
* **Descripción:** Permite a un cliente calificar y comentar sobre una solicitud de servicio que ya ha sido completada (`COMPLETED`).
* **Autenticación:** Requerida (Bearer Token).
* **Restricción:** Solo el `"CLIENT"` dueño de la solicitud original.
* **Campos del Body:**
  * `requestId` *(number, requerido)*: El ID numérico de la solicitud de servicio completada.
  * `rating` *(number, requerido)*: Puntuación entera del 1 al 5.
  * `comment` *(string, requerido)*: Detalle de la experiencia con el servicio (mín. 5 caracteres).

#### 📝 Ejemplo de Body:
```json
{
  "requestId": 1,
  "rating": 5,
  "comment": "Excelente servicio de Carlos. Llegó a tiempo, solucionó la fuga rápidamente y fue muy educado."
}
```

---

## 5. Chats y Mensajes (`/api/conversations`)

### 💬 Iniciar o Recuperar Chat
* **Ruta:** `POST /api/conversations`
* **Descripción:** Obtiene la conversación existente entre el usuario autenticado y el destinatario, o crea una nueva si no existía.
* **Autenticación:** Requerida (Bearer Token).
* **Campos del Body:**
  * `recipientId` *(number, requerido)*: ID del usuario con el que se desea chatear.

#### 📝 Ejemplo de Body:
```json
{
  "recipientId": 2
}
```
