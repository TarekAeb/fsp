export async function trackVideoView(movieId: number) {
    try {
        await fetch('/api/videos/track/view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movieId }),
        });
    } catch (error) {
        console.error('Failed to track video view:', error);
    }
}

export async function trackVideoSearch(query: string, movieId?: number) {
    try {
        await fetch('/api/videos/track/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, movieId }),
        });
    } catch (error) {
        console.error('Failed to track search:', error);
    }
}