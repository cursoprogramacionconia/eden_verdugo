import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const sanitizeUser = ({ password, ...usuario }) => usuario;

const normalizeActivo = (valor) => {
  if (valor === undefined) return undefined;
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor === 1;
  if (typeof valor === 'string') {
    const normalized = valor.trim().toLowerCase();

    if (['true', '1', 'si', 'sí', 'on', 'activo'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'off', 'inactivo'].includes(normalized)) {
      return false;
    }
  }

  return Boolean(valor);
};

export async function GET() {
  try {
    const usuarios = await prisma.usuarios.findMany({
      orderBy: { usuario_id: 'asc' },
    });

    return NextResponse.json(usuarios.map(sanitizeUser));
  } catch (error) {
    console.error('Error al listar usuarios', error);
    return NextResponse.json(
      { error: 'Error al obtener los usuarios.' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { correo, password, nombre_usuario, activo } = await request.json();

    if (!correo || !password || !nombre_usuario) {
      return NextResponse.json(
        { error: 'correo, password y nombre_usuario son obligatorios.' },
        { status: 400 },
      );
    }

    const activoNormalizado = normalizeActivo(activo);

    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        correo,
        password,
        nombre_usuario,
        ...(activoNormalizado !== undefined
          ? { activo: activoNormalizado }
          : {}),
      },
    });

    return NextResponse.json(sanitizeUser(nuevoUsuario), { status: 201 });
  } catch (error) {
    console.error('Error al crear usuario', error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'El correo o nombre de usuario ya existe.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el usuario.' },
      { status: 500 },
    );
  }
}
