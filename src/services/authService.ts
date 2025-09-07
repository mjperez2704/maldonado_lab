
"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function login({ email, password }: { email: string; password: string }) {
  // Cambiamos 'employees' por 'users' y seleccionamos 'role_id'
  const results = await executeQuery<any[]>('SELECT id, users.username, email, password, role_id FROM users WHERE email = ?', [email]);

  if (results.length === 0) {
    return null; // Usuario no encontrado
  }

  const user = results[0];

  // Si no hay contraseña en la BD, denegar login
  if (!user.password) {
    return null;
  }

  // Comparación de contraseña sin encriptación
  const isPasswordValid = password === user.password;

  if (!isPasswordValid) {
    return null; // Contraseña incorrecta
  }

  // Mapeamos 'role_id' a 'position' para mantener consistencia con el resto de la app
  const userWithRole = {
      ...user,
      position: user.role_id === 1 ? 'Administrator' : 'User' // Asignación de rol simple
  };


  // No devolver la contraseña ni role_id en el objeto de usuario final
  const { password: _, role_id, ...userWithoutPassword } = userWithRole;
  return userWithoutPassword;
}

