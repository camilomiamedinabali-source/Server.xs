# KINGZ CRM

A modern Customer Relationship Management system powered by Supabase and integrated with the Supabase MCP (Model Context Protocol) server for advanced AI-assisted operations.

## Features

- **Contact Management** - Store and manage customer information
- **Deal Tracking** - Track sales opportunities with stages and values
- **Notes System** - Add and organize notes for contacts and deals
- **Dashboard Stats** - Real-time CRM metrics and analytics
- **Supabase MCP Integration** - Use Claude AI with your CRM data
- **RESTful API** - Complete API for all CRM operations

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account and project

### Installation

```bash
cd kingz-crm
npm install
```

### Database Setup

1. Go to your Supabase project SQL Editor
2. Copy and run all commands from `SCHEMA.sql`
3. This creates tables for contacts, deals, and notes

### Environment Variables

Create a `.env` file or export these variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
export PORT=3000
```

### Run the Server

```bash
npm start

# Or for development with auto-reload:
npm run dev
```

Server will be available at `http://localhost:3000`

## API Endpoints

### Contacts

**Get all contacts**
```
GET /api/contacts
```

**Create contact**
```
POST /api/contacts
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "notes": "Important prospect"
}
```

**Update contact**
```
PUT /api/contacts/:id
{
  "name": "Jane Doe",
  "company": "New Company"
}
```

**Delete contact**
```
DELETE /api/contacts/:id
```

### Deals

**Get all deals**
```
GET /api/deals
```

**Create deal**
```
POST /api/deals
{
  "title": "Enterprise License",
  "contact_id": 1,
  "value": 50000,
  "stage": "negotiation",
  "notes": "High priority"
}
```

**Update deal**
```
PUT /api/deals/:id
{
  "stage": "closed_won",
  "value": 60000
}
```

### Notes

**Get notes**
```
GET /api/notes?contact_id=1
```

**Create note**
```
POST /api/notes
{
  "contact_id": 1,
  "deal_id": 5,
  "content": "Client prefers monthly billing"
}
```

### Dashboard

**Get stats**
```
GET /api/stats
```

Returns:
```json
{
  "success": true,
  "stats": {
    "totalContacts": 45,
    "totalDeals": 12,
    "totalValue": 425000
  }
}
```

## Supabase MCP Integration

Use the Supabase MCP server alongside KINGZ CRM for AI-assisted operations:

```bash
# In one terminal: run KINGZ CRM
npm start

# In another terminal: run Supabase MCP server
cd ../mcp-supabase-server
npm start
```

Claude can then:
- Query contacts and deals using MCP tools
- Generate reports and insights
- Automate data operations
- Suggest deal strategies based on CRM data

## Deal Stages

Standard deal pipeline stages:

- `lead` - New contact or opportunity
- `qualified` - Lead has been qualified
- `proposal` - Proposal sent
- `negotiation` - Terms being negotiated
- `closed_won` - Deal successfully closed
- `closed_lost` - Deal lost

## Architecture

```
KINGZ CRM
├── Express.js API
├── Supabase Backend
└── Supabase MCP Server (optional)
    ├── Database access
    ├── Schema introspection
    └── AI-assisted operations
```

## Database Schema

### contacts
- `id` - Primary key
- `name` - Contact full name
- `email` - Email address (unique)
- `phone` - Phone number
- `company` - Company name
- `notes` - Additional notes
- `created_at` - Timestamp
- `updated_at` - Timestamp

### deals
- `id` - Primary key
- `title` - Deal title
- `contact_id` - Reference to contact
- `value` - Deal value in currency
- `stage` - Current deal stage
- `notes` - Deal notes
- `created_at` - Timestamp
- `updated_at` - Timestamp

### notes
- `id` - Primary key
- `contact_id` - Reference to contact
- `deal_id` - Reference to deal (optional)
- `content` - Note text
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Security

- Row Level Security (RLS) enabled on all tables
- Policies configured for public access (customize as needed)
- Use service role keys for admin operations
- Use anon keys for client applications

## Development

### Add a new endpoint

```javascript
app.get('/api/new-endpoint', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
```

### Testing with curl

```bash
# Create a contact
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get all contacts
curl http://localhost:3000/api/contacts
```

## License

MIT
