# E2E Rides — Frontend

## Integrantes
Arana Chiong, Jean Piere Milan
Saavedra Clavijo, Itta Zhair
Torres Chafloque, Enrique Eusebio

Frontend en **React + TypeScript + Vite** para la app de viajes (estilo Uber) del backend Spring Boot `cs2031-2026-1-week14-e2e`.

## Requisitos

- Node 18+
- El backend corriendo en `http://localhost:8080` (`./mvnw spring-boot:run`)

## Cómo correr

```bash
npm install
npm run dev        # http://localhost:5173
```

La URL del backend se configura con `VITE_API_URL` (ver `.env.example`). Por defecto apunta a `http://localhost:8080`.

## Usuarios de prueba (seed del backend)

| Rol       | Email             | Contraseña |
|-----------|-------------------|-----------|
| Pasajero  | `ana@uber.com`    | `pass123` |
| Conductor | `carlos@uber.com` | `pass123` |

## Estructura

```
src/
├── api/          # cliente axios, tipos y endpoints
├── auth/         # AuthContext (JWT en localStorage)
├── components/   # Layout, StatusBadge, StarRating, ProtectedRoute
├── pages/        # Login, dashboards, RequestTrip, TripDetail, History
├── App.tsx       # rutas por rol
└── main.tsx
```

## Pantallas y endpoints consumidos

| # | Pantalla | Endpoints |
|---|----------|-----------|
| 1 | Login / Registro | `POST /auth/register` · `POST /auth/login` · `GET /users/me` |
| 2 | Dashboard pasajero | `GET /users/me` · `GET /trips` |
| 3 | Solicitar viaje | `GET /drivers/available` · `POST /trips` |
| 4 | Detalle (pasajero) + rating + polling | `GET /trips/{id}` · `POST /trips/{id}/rate` |
| 5 | Dashboard conductor | `GET /users/me` · `GET /trips/pending` · `GET /trips/my` · `PATCH /trips/{id}/accept` |
| 6 | Detalle (conductor) + completar | `GET /trips/{id}` · `PATCH /trips/{id}/complete` |
| 7 | Historial con filtro | `GET /trips` · `GET /trips/my` |

## Detalles de implementación

- **JWT**: se guarda en `localStorage` y un interceptor de axios lo añade como `Authorization: Bearer <token>`. Ante un `401` borra el token y redirige a `/login`.
- **Rol**: se detecta con `GET /users/me` y se renderiza la vista de pasajero o conductor.
- **Polling**: el detalle de viaje refresca `GET /trips/{id}` cada 4 s mientras el estado sea `PENDING` o `IN_PROGRESS`.
- **Errores**: los mensajes `{ "error": "..." }` (y los de validación por campo) se muestran al usuario.
- Campos nulables (`driver`, `acceptedAt`, `completedAt`, `passengerRating`) se manejan con optional chaining.
