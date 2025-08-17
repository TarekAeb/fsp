import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Function to calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Function to calculate similarity percentage
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;
}

// Function to normalize strings for better matching
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Function to check if query matches any word in the title
function matchesWords(query: string, title: string): boolean {
  const queryWords = normalizeString(query).split(' ');
  const titleWords = normalizeString(title).split(' ');
  
  return queryWords.some(queryWord => 
    titleWords.some(titleWord => 
      titleWord.includes(queryWord) || 
      queryWord.includes(titleWord) ||
      calculateSimilarity(queryWord, titleWord) >= 70
    )
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ query: string }> }
) {
  try {
    const params = await context.params;
    const query = decodeURIComponent(params.query);
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ movies: [] });
    }

    const normalizedQuery = normalizeString(query);

    // First, try exact and partial matches
    const exactMatches = await prisma.movie.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        posterUrl: true,
        rating: true,
        durationMinutes: true,
        releaseDate: true,
        description: true,
        language: true,
        trailerUrl: true,
        genres: {
          select: {
            genre: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: 20
    });

    // If we have enough exact matches, return them
    if (exactMatches.length >= 5) {
      const formattedMovies = exactMatches.map(movie => ({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        durationMinutes: movie.durationMinutes,
        releaseDate: movie.releaseDate,
        description: movie.description,
        language: movie.language,
        trailerUrl: movie.trailerUrl,
        genres: movie.genres.map(g => g.genre.name),
        relevanceScore: 100
      }));

      return NextResponse.json({ movies: formattedMovies });
    }

    // If not enough exact matches, get all movies for fuzzy matching
    const allMovies = await prisma.movie.findMany({
      select: {
        id: true,
        title: true,
        posterUrl: true,
        rating: true,
        durationMinutes: true,
        releaseDate: true,
        description: true,
        language: true,
        trailerUrl: true,
        genres: {
          select: {
            genre: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate relevance scores for all movies
    const moviesWithScores = allMovies.map(movie => {
      const titleSimilarity = calculateSimilarity(normalizedQuery, normalizeString(movie.title));
      const wordMatch = matchesWords(normalizedQuery, movie.title);
      const descriptionMatch = movie.description ? 
        normalizeString(movie.description).includes(normalizedQuery) : false;
      
      // Genre matching
      const genreMatch = movie.genres.some(g => 
        normalizeString(g.genre.name).includes(normalizedQuery) ||
        calculateSimilarity(normalizedQuery, normalizeString(g.genre.name)) >= 70
      );

      let relevanceScore = titleSimilarity;
      
      // Boost score for word matches
      if (wordMatch) relevanceScore += 20;
      
      // Boost score for description matches
      if (descriptionMatch) relevanceScore += 10;
      
      // Boost score for genre matches
      if (genreMatch) relevanceScore += 15;
      
      // Boost score for exact word starts
      if (normalizeString(movie.title).startsWith(normalizedQuery)) {
        relevanceScore += 30;
      }

      return {
        ...movie,
        genres: movie.genres.map(g => g.genre.name),
        relevanceScore: Math.min(relevanceScore, 100)
      };
    });

    // Filter and sort by relevance
    const relevantMovies = moviesWithScores
      .filter(movie => movie.relevanceScore >= 30) // Minimum threshold
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Limit results

    // Combine exact matches with fuzzy matches, removing duplicates
    const exactMatchIds = new Set(exactMatches.map(m => m.id));
    const fuzzyMatches = relevantMovies.filter(m => !exactMatchIds.has(m.id));
    
    const combinedResults = [
      ...exactMatches.map(movie => ({
        ...movie,
        genres: movie.genres.map(g => g.genre.name),
        relevanceScore: 100
      })),
      ...fuzzyMatches
    ].slice(0, 20);

    return NextResponse.json({ movies: combinedResults });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}