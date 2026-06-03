import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    avatar: `https://i.pravatar.cc/150?img=11`,
    role: "client",
    phone: "+57 300 123 4567",
    location: "Bogotá, Colombia",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Ana Sofía Ramírez",
    email: "ana@example.com",
    avatar: `https://i.pravatar.cc/150?img=47`,
    role: "client",
    phone: "+57 315 987 6543",
    location: "Medellín, Colombia",
    createdAt: "2024-02-20T08:30:00Z",
  },
  {
    id: "user-3",
    name: "Luis García",
    email: "luis@example.com",
    avatar: `https://i.pravatar.cc/150?img=33`,
    role: "technician",
    phone: "+57 310 456 7890",
    location: "Bogotá, Colombia",
    createdAt: "2023-11-05T14:00:00Z",
  },
];

/** Fake authenticated session user */
export const mockAuthUser: User = {
  id: "user-1",
  name: "Carlos Mendoza",
  email: "carlos@example.com",
  avatar: `https://i.pravatar.cc/150?img=11`,
  role: "client",
  phone: "+57 300 123 4567",
  location: "Bogotá, Colombia",
  createdAt: "2024-01-15T10:00:00Z",
};
