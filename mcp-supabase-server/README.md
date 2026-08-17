# Supabase MCP Server

A Model Context Protocol (MCP) server that enables Claude to interact with Supabase databases through a comprehensive set of tools.

## Features

- **Query Tables** - Read data with filtering and pagination
- **Insert Records** - Add new data to tables
- **Update Records** - Modify existing records
- **Delete Records** - Remove records with filtering
- **List Tables** - Discover available tables and schemas
- **Get Schema** - View detailed column information
- **Count Records** - Get record counts with optional filtering
- **Execute SQL** - Run custom SQL queries

## Setup

### Prerequisites

- Node.js 18+
- Supabase project with API credentials

### Installation

```bash
cd mcp-supabase-server
npm install
npm run build
```

### Configuration

Set environment variables:

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
```

Or create a `.env` file:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Running the Server

```bash
npm start
```

For development with hot reload:

```bash
npm run dev
```

## Integration with Claude Code

Add to `.claude/config.json`:

```json
{
  "mcpServers": {
    "supabase-local": {
      "transport": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-supabase-server/build/index.js"]
    }
  }
}
```

Then authenticate and use with Claude Code CLI:

```bash
claude /mcp
```

## Tool Reference

### list_tables
Lists all tables in the public schema with their names.

### query_table
Query records from a table with optional filtering and pagination.

**Parameters:**
- `table` (required): Table name
- `select`: Columns to select (default: '*')
- `limit`: Max results (default: 100)
- `offset`: Pagination offset
- `match`: Filter conditions as key-value pairs

### insert_record
Insert a new record into a table.

**Parameters:**
- `table` (required): Table name
- `data` (required): Record data

### update_record
Update existing records matching criteria.

**Parameters:**
- `table` (required): Table name
- `data` (required): Updated values
- `match` (required): Filter conditions

### delete_record
Delete records matching criteria.

**Parameters:**
- `table` (required): Table name
- `match` (required): Filter conditions

### get_table_schema
Get detailed schema information for a table (columns, types, nullability).

**Parameters:**
- `table` (required): Table name

### count_records
Count records in a table with optional filtering.

**Parameters:**
- `table` (required): Table name
- `match`: Optional filter conditions

### execute_sql
Execute raw SQL queries (advanced usage).

**Parameters:**
- `query` (required): SQL query string

## Examples

### Query all users
```
Tool: query_table
table: "users"
```

### Get specific user by ID
```
Tool: query_table
table: "users"
match: { "id": 123 }
```

### Create new user
```
Tool: insert_record
table: "users"
data: { "email": "user@example.com", "name": "John Doe" }
```

### Update user profile
```
Tool: update_record
table: "users"
match: { "id": 123 }
data: { "name": "Jane Doe", "updated_at": "2026-08-17" }
```

### Delete old records
```
Tool: delete_record
table: "logs"
match: { "created_at": "2026-01-01" }
```

## Error Handling

The server includes comprehensive error handling. Errors from Supabase operations are returned with descriptive messages to help diagnose issues.

## Security Notes

- Use anon keys with Row Level Security (RLS) enabled for public queries
- Use service role keys only in secure server environments
- Never commit `.env` files with credentials
- Validate and sanitize input through Supabase's type-safe client

## Development

Build TypeScript:
```bash
npm run build
```

## License

MIT
