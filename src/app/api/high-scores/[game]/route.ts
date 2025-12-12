import { NextRequest, NextResponse } from 'next/server'
import { highScoresDb } from '@/lib/database-unified'

// GET /api/high-scores/[game] - Get high score for a specific game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  try {
    const { game } = await params
    const highScore = await highScoresDb.getByGame(game)
    
    if (!highScore) {
      return NextResponse.json({ 
        score: 0, 
        username: 'Set a high score!',
        exists: false 
      })
    }

    return NextResponse.json({
      score: highScore.score,
      username: highScore.username,
      exists: true,
      createdAt: highScore.createdAt
    })
  } catch (error) {
    console.error('Error fetching high score:', error)
    return NextResponse.json(
      { error: 'Failed to fetch high score' },
      { status: 500 }
    )
  }
}

// POST /api/high-scores/[game] - Create or update high score for a game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  try {
    const { game } = await params
    const body = await request.json()
    const { username, score } = body

    if (!username || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Username and score are required' },
        { status: 400 }
      )
    }

    const id = await highScoresDb.createOrUpdate(game, username, score)

    return NextResponse.json({
      id,
      message: 'High score updated successfully'
    })
  } catch (error) {
    console.error('Error updating high score:', error)
    return NextResponse.json(
      { error: 'Failed to update high score' },
      { status: 500 }
    )
  }
}
