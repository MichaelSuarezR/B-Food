# API Test Commands

**Note:** Replace `<user-id>`, `<trade-id>`, `<message-id>`, `<conversation-id>`, `<offer-id>`, `<looking-for-id>`, `<rating-id>` with actual UUIDs from your database.

## Health Check

```bash
# Health check
curl http://localhost:3001/api/health

# API info
curl http://localhost:3001/api
```

## Users API

```bash
# List users (with search)
curl "http://localhost:3001/api/users?search=john&limit=10"

# Get user by ID
curl "http://localhost:3001/api/users/<user-id>"

# Update user profile
curl -X PATCH "http://localhost:3001/api/users/<user-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "New Name",
    "email": "newemail@example.com",
    "bio": "Updated bio description"
  }'
```

## Trades API

```bash
# List all trades
curl "http://localhost:3001/api/trades?limit=20"

# List trades with filters
curl "http://localhost:3001/api/trades?category=Events&limit=10"

# Search trades
curl "http://localhost:3001/api/trades?search=rideshare&limit=10"

# Filter by price range
curl "http://localhost:3001/api/trades?price_min=10&price_max=50&limit=10"

# Filter by tag
curl "http://localhost:3001/api/trades?tag=photography&limit=10"

# Get user's trades
curl "http://localhost:3001/api/trades?offerer_user_id=<user-id>&limit=10"

# Get single trade
curl "http://localhost:3001/api/trades/<trade-id>"

# Create a trade
curl -X POST "http://localhost:3001/api/trades" \
  -H "Content-Type: application/json" \
  -d '{
    "offerer_user_id": "<user-id>",
    "skill_offered": "Tutoring",
    "title": "Math Tutoring for Calc I",
    "description": "Experienced tutor offering help with Calculus I",
    "category": "Events",
    "price": 25,
    "tags": ["math", "tutoring", "calculus"],
    "image_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
  }'

# Update a trade
curl -X PATCH "http://localhost:3001/api/trades/<trade-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "price": 30,
    "tags": ["updated", "tags"]
  }'

# Accept a trade
curl -X POST "http://localhost:3001/api/trades/<trade-id>/accept"

# Cancel a trade
curl -X POST "http://localhost:3001/api/trades/<trade-id>/cancel"

# Delete a trade
curl -X DELETE "http://localhost:3001/api/trades/<trade-id>"
```

## Messages API

```bash
# Create a message
curl -X POST "http://localhost:3001/api/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "<user-id-1>",
    "receiver_id": "<user-id-2>",
    "conversation_id": "<conversation-id>",
    "content": "Hello! I am interested in your listing.",
    "attachment_url": "https://example.com/file.pdf"
  }'

# List messages by conversation
curl "http://localhost:3001/api/messages?conversation_id=<conversation-id>&limit=50"

# List messages between two users
curl "http://localhost:3001/api/messages?sender_id=<user-id-1>&receiver_id=<user-id-2>&limit=50"

# Get single message
curl "http://localhost:3001/api/messages/<message-id>"

# Delete a message
curl -X DELETE "http://localhost:3001/api/messages/<message-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "<user-id>"
  }'
```

## Conversations API

```bash
# Create or find a conversation
curl -X POST "http://localhost:3001/api/conversations" \
  -H "Content-Type: application/json" \
  -d '{
    "participant_a": "<user-id-1>",
    "participant_b": "<user-id-2>"
  }'

# List user's conversations (with unread counts)
curl "http://localhost:3001/api/conversations?user_id=<user-id>&limit=20"

# Get single conversation (with unread count)
curl "http://localhost:3001/api/conversations/<conversation-id>?user_id=<user-id>"

# Delete a conversation
curl -X DELETE "http://localhost:3001/api/conversations/<conversation-id>"
```

## Looking For API

```bash
# Get user's "looking for" items
curl "http://localhost:3001/api/looking-for/<user-id>"

# Create a "looking for" item
curl -X POST "http://localhost:3001/api/looking-for" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "<user-id>",
    "item_name": "Rideshare to LAX"
  }'

# Delete a "looking for" item
curl -X DELETE "http://localhost:3001/api/looking-for/<looking-for-id>"
```

## Ratings API

```bash
# Create or update a rating
curl -X POST "http://localhost:3001/api/ratings" \
  -H "Content-Type: application/json" \
  -d '{
    "rater_id": "<user-id-1>",
    "rated_user_id": "<user-id-2>",
    "rating": 5
  }'

# Get user's average rating
curl "http://localhost:3001/api/ratings/<user-id>"
```

## Offers API

```bash
# Create an offer for a trade
curl -X POST "http://localhost:3001/api/offers" \
  -H "Content-Type: application/json" \
  -d '{
    "trade_id": "<trade-id>",
    "offerer_user_id": "<user-id>",
    "message": "I would like to make an offer",
    "price": 20
  }'

# List offers for a trade
curl "http://localhost:3001/api/offers?trade_id=<trade-id>&limit=20"

# List offers by user
curl "http://localhost:3001/api/offers?offerer_user_id=<user-id>&limit=20"

# Update offer status (accept/reject)
curl -X PATCH "http://localhost:3001/api/offers/<offer-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accepted"
  }'
```

## Quick Test Sequence

Here's a quick sequence to test the full flow:

```bash
# 1. Get a user ID (you'll need to replace this with an actual UUID from your database)
USER_ID="<your-user-id-here>"

# 2. Create a trade
curl -X POST "http://localhost:3001/api/trades" \
  -H "Content-Type: application/json" \
  -d "{
    \"offerer_user_id\": \"$USER_ID\",
    \"skill_offered\": \"Photography\",
    \"title\": \"Headshots at Royce\",
    \"description\": \"Professional headshots for LinkedIn\",
    \"category\": \"Events\",
    \"price\": 10,
    \"tags\": [\"photography\", \"headshots\", \"professional\"]
  }" | jq

# 3. Get the trade ID from the response above, then:
TRADE_ID="<trade-id-from-response>"

# 4. Get the trade
curl "http://localhost:3001/api/trades/$TRADE_ID" | jq

# 5. Create an offer
curl -X POST "http://localhost:3001/api/offers" \
  -H "Content-Type: application/json" \
  -d "{
    \"trade_id\": \"$TRADE_ID\",
    \"offerer_user_id\": \"$USER_ID\",
    \"message\": \"I am interested in this!\",
    \"price\": 8
  }" | jq
```

