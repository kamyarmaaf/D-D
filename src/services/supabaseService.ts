import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fxumrywaxagueiqlovgg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dW1yeXdheGFndWVpcWxvdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzQ4MDAsImV4cCI6MjA1MTU1MDgwMH0.YourAnonKey';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface N8nRequest {
  room_id: string;
  genre: string;
  stage: number;
  user_choice: string;
  user_dice: string;
}

export interface N8nResponse {
  id: number;
  created_at: string;
  stage: number;
  room_id: string;
  genre: string;
  choice1: string;
  choice2: string;
  choice3: string;
  description: string;
  stage_text: string;
}

class SupabaseService {
  // Store n8n request in Supabase
  async storeN8nRequest(request: N8nRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('n8n_requests')
        .insert([request])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Store request error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get n8n response from Supabase
  async getN8nResponse(roomId: string, stage: number): Promise<{ success: boolean; data?: N8nResponse[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('n8n_responses')
        .select('*')
        .eq('room_id', roomId)
        .eq('stage', stage)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Get response error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Simulate n8n response for testing
  async simulateN8nResponse(request: N8nRequest): Promise<{ success: boolean; data?: N8nResponse[]; error?: string }> {
    // This is a mock response based on your n8n data
    const mockResponse: N8nResponse[] = [
      {
        id: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        stage: request.stage === 0 ? 1 : request.stage,
        room_id: request.room_id,
        genre: request.genre,
        choice1: "14\nبه آرامی دروازه را از داخل بررسی کنید تا تله‌ها یا نگهبانان مخفی را شناسایی کنید.",
        choice2: "12\nبا شمشیر در دست، به سرعت به داخل شلیک کنید و هر مانعی را از میان ببرید.",
        choice3: "16\nیک طلسم نورانی از دست خود بزنید تا مسیر را روشن کند و موجودات مخفی را آشکار سازد.",
        description: "\nدر دل جنگل مه‌آلود ایفلور، جایی که درختان با نورهای جادویی می‌درخشند، یک معبد باستانی نصفه‌روکش بر فراز سنگ‌های مخفی قرار دارد. صدای زنگ‌های بلندی از دل معبد می‌پیچد و بوی عطرهای مخفی به هوا می‌چسبد. دروازه سنگی معبد به آرامی باز شده و یک نور سبز سوزان از داخل آن می‌تابد. شما در آستانه ورود به این مکان رازآلود ایستاده‌اید و باید تصمیم بگیرید که چگونه پیش بروید.",
        stage_text: "در دل جنگل مه‌آلود ایفلور، جایی که درختان با نورهای جادویی می‌درخشند، یک معبد باستانی نصفه‌روکش بر فراز سنگ‌های مخفی قرار دارد. صدای زنگ‌های بلندی از دل معبد می‌پیچد و بوی عطرهای مخفی به هوا می‌چسبد. دروازه سنگی معبد به آرامی باز شده و یک نور سبز سوزان از داخل آن می‌تابد. شما در آستانه ورود به این مکان رازآلود ایستاده‌اید و باید تصمیم بگیرید که چگونه پیش بروید."
      }
    ];

    // Store the mock response in Supabase
    const { error } = await supabase
      .from('n8n_responses')
      .insert(mockResponse);

    if (error) {
      console.error('Supabase error storing mock response:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: mockResponse };
  }
}

export const supabaseService = new SupabaseService();
