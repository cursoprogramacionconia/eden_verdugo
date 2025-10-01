import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const sanitizeUser = ({ password, ...usuario }) => usuario;

export async function POST(request) {
  try {
    const { nombre_usuario, password } = await request.json();

    if (!nombre_usuario || !password) {
      return NextResponse.json(
        { error: 'nombre_usuario y password son obligatorios.' },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { nombre_usuario },
    });

    if (!usuario || !usuario.activo || usuario.password !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o usuario inactivo.' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      mensaje: 'Inicio de sesión exitoso.',
      usuario: sanitizeUser(usuario),
    });
  } catch (error) {
    console.error('Error en login', error);
    return NextResponse.json({ error: 'Error al iniciar sesión.' }, { status: 500 });
  }
}
