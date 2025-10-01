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

const parseId = (params) => {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function GET(_request, { params }) {
  const usuarioId = parseId(params);

  if (!usuarioId) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(sanitizeUser(usuario));
  } catch (error) {
    console.error('Error al obtener usuario', error);
    return NextResponse.json({ error: 'Error al obtener el usuario.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const usuarioId = parseId(params);

  if (!usuarioId) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  }

  try {
    const { correo, password, nombre_usuario, activo } = await request.json();

    const data = {};

    if (correo !== undefined) data.correo = correo;
    if (password !== undefined) data.password = password;
    if (nombre_usuario !== undefined) data.nombre_usuario = nombre_usuario;
    if (activo !== undefined) {
      const activoNormalizado = normalizeActivo(activo);
      if (activoNormalizado !== undefined) {
        data.activo = activoNormalizado;
      }
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar.' },
        { status: 400 },
      );
    }

    const usuarioActualizado = await prisma.usuarios.update({
      where: { usuario_id: usuarioId },
      data,
    });

    return NextResponse.json(sanitizeUser(usuarioActualizado));
  } catch (error) {
    console.error('Error al actualizar usuario', error);

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'El correo o nombre de usuario ya existe.' },
        { status: 409 },
      );
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar el usuario.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const usuarioId = parseId(params);

  if (!usuarioId) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  }

  try {
    await prisma.usuarios.delete({
      where: { usuario_id: usuarioId },
    });

    return NextResponse.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar el usuario.' },
      { status: 500 },
    );
  }
}
