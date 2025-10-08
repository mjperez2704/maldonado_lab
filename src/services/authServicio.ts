
"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function login({ email, contrasena }: { email: string; contrasena: string }) {
  // Cambiamos 'employees' por 'users' y seleccionamos 'role_id'
  const results = await executeQuery<any[]>('SELECT id, usuario, email, contrasena, rol_id FROM usuarios WHERE email = ?', [email]);

  if (results.length === 0) {
    return null; // Usuario no encontrado
  }

  const user = results[0];

  // Si no hay contraseña en la BD, denegar login
  if (!user.contrasena) {
    return null;
  }

  // Comparación de contraseña sin encriptación
  const isPasswordValid = contrasena === user.contrasena;

  if (!isPasswordValid) {
    return null; // Contraseña incorrecta
  }

  // Mapeamos 'role_id' a 'position' para mantener consistencia con el resto de la app
  const userWithRole = {
      ...user,
      position: user.rol_id === 1 ? 'Administrador' : 'Usuario' // Asignación de rol simple
  };


  // No devolver la contraseña ni role_id en el objeto de usuario final
  const { contrasena: _, rol_id, ...userWithoutPassword } = userWithRole;
  return userWithoutPassword;
}

