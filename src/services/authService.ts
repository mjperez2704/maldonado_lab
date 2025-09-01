"use server";
import { executeQuery } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function login({ email, password }: { email: string; password: string }) {
  // Asegúrate de seleccionar el campo 'position' que contiene el rol
  const results = await executeQuery<any[]>('SELECT * FROM employees WHERE email = ?', [email]);

  if (results.length === 0) {
    return null; // Usuario no encontrado
  }

  const user = results[0];

  // Si no hay contraseña en la BD (ej. semilla de datos sin hashear), denegar login
  if (!user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null; // Contraseña incorrecta
  }

  // No devolver la contraseña en el objeto de usuario
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
