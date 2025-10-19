# N8N Game End Integration Guide

## Overview
This document explains how to integrate game end detection with n8n webhooks to determine when a game should end and how to close/expire rooms.

## Game End Detection

### 1. Text-Based Detection
The system automatically detects game end conditions based on keywords in the story text:

**Win Conditions:**
- Keywords: `victory`, `win`, `success`, `completed`
- Example: "Congratulations! You have achieved victory!"

**Lose Conditions:**
- Keywords: `defeat`, `lose`, `death`, `failed`
- Example: "The adventure ends in defeat..."

**Timeout Conditions:**
- Maximum stages reached (default: 10 stages)
- Keywords: `timeout`, `time's up`

### 2. N8N Webhook Response Format

When your n8n workflow detects a game end condition, include these fields in the response:

```json
{
  "stage": 5,
  "stage_text": "Congratulations! You have completed the adventure successfully!",
  "description": "Final stage description",
  "choice1": "10\nThank you for playing!",
  "choice2": "10\nSee you next time!",
  "choice3": "10\nGame Over",
  "room_id": "room_123",
  "genre": "fantasy"
}
```

### 3. Game End Detection Logic

The system will automatically detect game end when:

1. **Text contains win keywords:**
   - `stage_text` includes: "victory", "win", "success", "completed"
   - Result: `gameEnd.type = "win"`

2. **Text contains lose keywords:**
   - `stage_text` includes: "defeat", "lose", "death", "failed"
   - Result: `gameEnd.type = "lose"`

3. **Maximum stages reached:**
   - `stage >= 10` (configurable)
   - Result: `gameEnd.type = "timeout"`

4. **Explicit game over:**
   - `stage_text` includes: "game over", "end"
   - Result: `gameEnd.type = "timeout"`

### 4. Automatic Room Expiration

When a game ends, the system will:

1. **Set room status to 'finished'** in the database
2. **Disable game interactions** (no more choices, dice rolls)
3. **Show game end modal** with results
4. **Prevent new players** from joining the room

### 5. N8N Workflow Recommendations

#### Option A: Text Analysis Node
```javascript
// In your n8n workflow, add a text analysis node
const storyText = $input.first().json.stage_text.toLowerCase();

const isWin = storyText.includes('victory') || 
              storyText.includes('win') || 
              storyText.includes('success');

const isLose = storyText.includes('defeat') || 
               storyText.includes('lose') || 
               storyText.includes('death');

const isGameOver = isWin || isLose || 
                   storyText.includes('game over') ||
                   $input.first().json.stage >= 10;

return {
  ...$input.first().json,
  is_game_over: isGameOver,
  game_end_type: isWin ? 'win' : isLose ? 'lose' : 'timeout'
};
```

#### Option B: AI Analysis Node
```javascript
// Use AI to analyze story context
const prompt = `Analyze this story text and determine if the game should end:
"${$input.first().json.stage_text}"

Respond with JSON:
{
  "isGameOver": boolean,
  "gameEndType": "win" | "lose" | "timeout" | "continue",
  "reason": "explanation"
}`;

// Process AI response and modify stage_text accordingly
```

### 6. Database Integration

The system automatically updates the room status:

```sql
UPDATE rooms 
SET status = 'finished', 
    is_game_active = false,
    updated_at = NOW()
WHERE id = 'room_id';
```

### 7. Frontend Behavior

When game ends:

1. **Game End Modal appears** with:
   - Victory/Defeat message
   - Final score
   - Completion percentage
   - Restart/Go Home buttons

2. **Game interactions disabled:**
   - No more choice buttons
   - No dice rolling
   - No message sending

3. **Room becomes read-only:**
   - Players can view history
   - Cannot make new actions
   - Room expires after 24 hours

### 8. Testing Game End

To test game end conditions:

1. **Win Test:** Include "victory" in stage_text
2. **Lose Test:** Include "defeat" in stage_text  
3. **Timeout Test:** Set stage >= 10
4. **Manual Test:** Include "game over" in stage_text

### 9. Customization

You can customize game end detection by modifying:

- **Keywords** in `webhookService.ts` (lines 118-122)
- **Max stages** in `webhookService.ts` (line 122)
- **Scoring system** in `webhookService.ts` (line 139)
- **Modal appearance** in `GameEndModal.tsx`

### 10. Error Handling

If game end detection fails:

1. **Fallback:** Game continues normally
2. **Logging:** Errors logged to console
3. **Recovery:** Players can manually end game
4. **Cleanup:** Room expires after timeout

## Example N8N Workflow

```
1. Webhook Trigger (receives story data)
2. Text Analysis Node (detects game end)
3. Conditional Node (if game over)
4. Database Update Node (set room status)
5. Response Node (return modified data)
```

This integration ensures smooth game endings and proper room management.
