import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convertir el archivo a ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    
    // Enviar directamente el audio a OpenRouter Whisper
    const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter Whisper error:', errorText);
      return NextResponse.json(
        { error: 'Error transcribing audio', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text });

  } catch (error) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
