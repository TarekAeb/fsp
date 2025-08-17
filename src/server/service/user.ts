import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { db } from "../database"
export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  const hashedPassword = await bcryptjs.hash(data.password, 12)
  
  return await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      emailVerified: true,
      image: true,
    }
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
      createdAt: true,
    }
  })
}

export async function updateUser(id: string, data: {
  name?: string
  email?: string
  image?: string
  emailVerified?: Date
}) {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
    }
  })
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id }
  })
}

export async function changePassword(id: string, newPassword: string) {
  const hashedPassword = await bcryptjs.hash(newPassword, 12)
  
  return await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: { id: true }
  })
}


export async function getSavedMoviesByUserId(userId: string) {
  try {
    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: userId
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            rating: true,
            durationMinutes: true,
            releaseDate: true,
            description: true,
            language: true,
            trailerUrl: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    })

    return favorites.map(favorite => ({
      id: favorite.movie.id,
      title: favorite.movie.title,
      posterUrl: favorite.movie.posterUrl,
      rating: favorite.movie.rating,
      durationMinutes: favorite.movie.durationMinutes,
      releaseDate: favorite.movie.releaseDate,
      description: favorite.movie.description,
      language: favorite.movie.language,
      trailerUrl: favorite.movie.trailerUrl,
      addedAt: favorite.addedAt
    }))
  } catch (error) {
    console.error("Error fetching saved movies:", error)
    throw new Error("Failed to fetch saved movies")
  }
}