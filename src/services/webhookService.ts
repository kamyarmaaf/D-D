import { WebhookRequest, WebhookResponse, N8nStoryResponse } from '../types/game';

class WebhookService {
  private readonly webhookUrl = 'https://n8nserver.zer0team.ir/webhook-test/dnd-event';

  async sendWebhookRequest(request: WebhookRequest): Promise<WebhookResponse> {
    try {
      console.log('Sending request to n8n:', request);
      console.log('URL:', this.webhookUrl);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response body:', errorText);
        return {
          success: false,
          message: `HTTP error! status: ${response.status}, body: ${errorText}`
        };
      }

      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return {
          success: false,
          message: `Invalid JSON response: ${responseText}`
        };
      }
      
      console.log('Parsed n8n response:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('N8N request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Parse n8n response and convert to game story format
  parseN8nResponse(n8nData: N8nStoryResponse[]): {
    stage: number;
    description: string;
    choices: Array<{ id: number; text: string; dc: number }>;
    isGameOver?: boolean;
    gameEnd?: {
      type: 'win' | 'lose' | 'timeout' | 'abandoned';
      reason: string;
      finalScore?: number;
      completedStages: number;
      totalStages: number;
      endMessage: string;
    };
  } | null {
    console.log('parseN8nResponse called with data:', n8nData);
    
    if (!n8nData || n8nData.length === 0) {
      console.log('parseN8nResponse: No data or empty array');
      return null;

    }

    const storyData = n8nData[0]; // Take the first item from the array
    console.log('parseN8nResponse: Processing story data:', storyData);
    
    // Parse choices from choice1, choice2, choice3
    const choices = [];
    if (storyData.choice1) {
      const choice1Parts = storyData.choice1.split('\n');
      console.log('Choice1 parts:', choice1Parts);
      choices.push({
        id: 1,
        text: choice1Parts[1] || choice1Parts[0], // Use text after \n or the whole string
        dc: parseInt(choice1Parts[0]) || 10 // DC is the number before \n
      });
    }
    if (storyData.choice2) {
      const choice2Parts = storyData.choice2.split('\n');
      console.log('Choice2 parts:', choice2Parts);
      choices.push({
        id: 2,
        text: choice2Parts[1] || choice2Parts[0],
        dc: parseInt(choice2Parts[0]) || 10
      });
    }
    if (storyData.choice3) {
      const choice3Parts = storyData.choice3.split('\n');
      console.log('Choice3 parts:', choice3Parts);
      choices.push({
        id: 3,
        text: choice3Parts[1] || choice3Parts[0],
        dc: parseInt(choice3Parts[0]) || 10
      });
    }

    // Check for game end conditions
    const isGameOver = storyData.stage_text?.toLowerCase().includes('game over') ||
                      storyData.stage_text?.toLowerCase().includes('victory') ||
                      storyData.stage_text?.toLowerCase().includes('defeat') ||
                      storyData.stage_text?.toLowerCase().includes('end') ||
                      storyData.stage >= 10; // Max stages reached

    let gameEnd = undefined;
    if (isGameOver) {
      const isWin = storyData.stage_text?.toLowerCase().includes('victory') ||
                   storyData.stage_text?.toLowerCase().includes('win') ||
                   storyData.stage >= 10;
      
      const isLose = storyData.stage_text?.toLowerCase().includes('defeat') ||
                    storyData.stage_text?.toLowerCase().includes('lose') ||
                    storyData.stage_text?.toLowerCase().includes('death');

      gameEnd = {
        type: (isWin ? 'win' : isLose ? 'lose' : 'timeout') as 'win' | 'lose' | 'timeout' | 'abandoned',
        reason: isWin ? 'Adventure completed successfully' : 
                isLose ? 'Adventure ended in defeat' : 
                'Maximum stages reached',
        finalScore: storyData.stage * 100, // Simple scoring
        completedStages: storyData.stage,
        totalStages: 10,
        endMessage: storyData.stage_text || storyData.description || 'The adventure has come to an end.'
      };
    }

    const result = {
      stage: storyData.stage,
      description: storyData.stage_text || storyData.description,
      choices,
      isGameOver,
      gameEnd
    };
    
    console.log('parseN8nResponse: Final result:', result);
    return result;
  }

  // Send initial story start request
  async sendStoryStart(roomId: string, genre: string): Promise<WebhookResponse> {
    return this.sendWebhookRequest({
      room_id: roomId,
      genre: genre,
      stage: 0,
      user_choice: '',
      user_dice: ''
    });
  }

  // Send story progression request
  async sendStoryProgress(
    roomId: string, 
    genre: string, 
    stage: number, 
    userChoice: string, 
    userDice: string
  ): Promise<WebhookResponse> {
    return this.sendWebhookRequest({
      room_id: roomId,
      genre: genre,
      stage: stage,
      user_choice: userChoice,
      user_dice: userDice
    });
  }
}

export const webhookService = new WebhookService();