
"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function login({ email, contrasena }: { email: string; contrasena: string }) {
  // Cambiamos a 'empleados' y seleccionamos 'puesto'
  const results = await executeQuery<any[]>('SELECT id, usuario, email, contrasena, puesto FROM empleados WHERE email = ?', [email]);

  if (results.length === 0) {
    return null; // Usuario no encontrado
  }

  const user = results[0];

  // Si no hay contraseña en la BD, denegar login
  if (!user.contrasena) {
    return null;
  }

  // Comparación de contraseña encriptada
  const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

  if (!isPasswordValid) {
    return null; // Contraseña incorrecta
  }

  // Mantenemos la consistencia del objeto de usuario
  const { contrasena: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
