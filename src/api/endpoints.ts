import { api } from './client';
import type {
  AuthResponse,
  CreateTripBody,
  LoginRequestBody,
  RateTripBody,
  RegisterRequestBody,
  Trip,
  User,
} from './types';

// ---- Auth ----
export const register = (body: RegisterRequestBody) =>
  api.post<AuthResponse>('/auth/register', body).then((r) => r.data);

export const login = (body: LoginRequestBody) =>
  api.post<AuthResponse>('/auth/login', body).then((r) => r.data);

// ---- Users ----
export const getMe = () => api.get<User>('/users/me').then((r) => r.data);

export const getAvailableDrivers = () =>
  api.get<User[]>('/drivers/available').then((r) => r.data);

// ---- Trips (passenger) ----
export const createTrip = (body: CreateTripBody) =>
  api.post<Trip>('/trips', body).then((r) => r.data);

export const getMyTrips = () => api.get<Trip[]>('/trips').then((r) => r.data);

export const rateTrip = (id: number, body: RateTripBody) =>
  api.post<Trip>(`/trips/${id}/rate`, body).then((r) => r.data);

// ---- Trips (driver) ----
export const getPendingTrips = () =>
  api.get<Trip[]>('/trips/pending').then((r) => r.data);

export const getMyDriverTrips = () =>
  api.get<Trip[]>('/trips/my').then((r) => r.data);

export const acceptTrip = (id: number) =>
  api.patch<Trip>(`/trips/${id}/accept`).then((r) => r.data);

export const completeTrip = (id: number) =>
  api.patch<Trip>(`/trips/${id}/complete`).then((r) => r.data);

// ---- Trips (shared) ----
export const getTrip = (id: number) =>
  api.get<Trip>(`/trips/${id}`).then((r) => r.data);
