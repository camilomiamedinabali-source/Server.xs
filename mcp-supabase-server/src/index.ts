import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

interface ToolInput {
  table?: string;
  query?: string;
  data?: Record<string, unknown>;
  match?: Record<string, unknown>;
  limit?: number;
  offset?: number;
  select?: string;
  order_by?: string;
  ascending?: boolean;
  function_name?: string;
  function_args?: Record<string, unknown>;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const server = new Server({
  name: "supabase-mcp-server",
  version: "1.0.0",
});

const tools: Tool[] = [
  {
    name: "list_tables",
    description: "List all tables in the Supabase database with column information",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "query_table",
    description: "Query records from a Supabase table with filtering and pagination",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name to query",
        },
        select: {
          type: "string",
          description: "Columns to select (default: '*')",
        },
        limit: {
          type: "number",
          description: "Limit number of results (default: 100)",
        },
        offset: {
          type: "number",
          description: "Offset for pagination",
        },
        match: {
          type: "object",
          description: "Filter conditions as key-value pairs",
        },
      },
      required: ["table"],
    },
  },
  {
    name: "insert_record",
    description: "Insert a new record into a Supabase table",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name",
        },
        data: {
          type: "object",
          description: "Record data to insert",
        },
      },
      required: ["table", "data"],
    },
  },
  {
    name: "update_record",
    description: "Update records in a Supabase table",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name",
        },
        data: {
          type: "object",
          description: "Updated record data",
        },
        match: {
          type: "object",
          description: "Filter conditions to match records",
        },
      },
      required: ["table", "data", "match"],
    },
  },
  {
    name: "delete_record",
    description: "Delete records from a Supabase table",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name",
        },
        match: {
          type: "object",
          description: "Filter conditions to match records for deletion",
        },
      },
      required: ["table", "match"],
    },
  },
  {
    name: "execute_sql",
    description: "Execute raw SQL query against the database",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "SQL query to execute",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_table_schema",
    description: "Get detailed schema information for a specific table",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name",
        },
      },
      required: ["table"],
    },
  },
  {
    name: "count_records",
    description: "Count total records in a table with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        table: {
          type: "string",
          description: "The table name",
        },
        match: {
          type: "object",
          description: "Optional filter conditions",
        },
      },
      required: ["table"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const input = args as ToolInput;

  try {
    switch (name) {
      case "list_tables": {
        const { data, error } = await supabase
          .from("information_schema.tables")
          .select("table_name, table_schema")
          .eq("table_schema", "public");

        if (error) throw error;
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "query_table": {
        let query = supabase.from(input.table!).select(input.select || "*");

        if (input.match) {
          for (const [key, value] of Object.entries(input.match)) {
            query = query.eq(key, value);
          }
        }

        if (input.limit) query = query.limit(input.limit);
        if (input.offset) query = query.range(input.offset, input.offset + (input.limit || 100) - 1);

        const { data, error } = await query;

        if (error) throw error;
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "insert_record": {
        const { data, error } = await supabase
          .from(input.table!)
          .insert([input.data!])
          .select();

        if (error) throw error;
        return {
          content: [
            {
              type: "text",
              text: `Record inserted successfully: ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case "update_record": {
        const { data, error } = await supabase
          .from(input.table!)
          .update(input.data!)
          .match(input.match!)
          .select();

        if (error) throw error;
        return {
          content: [
            {
              type: "text",
              text: `Updated ${data?.length || 0} record(s): ${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case "delete_record": {
        const { data, error } = await supabase
          .from(input.table!)
          .delete()
          .match(input.match!)
          .select();

        if (error) throw error;
        return {
          content: [
            {
              type: "text",
              text: `Deleted ${data?.length || 0} record(s)`,
            },
          ],
        };
      }

      case "execute_sql": {
        const { data, error } = await supabase.rpc("execute_sql", {
          query: input.query,
        });

        if (error) throw error;
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "get_table_schema": {
        const { data, error } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type, is_nullable, column_default")
          .eq("table_name", input.table!)
          .eq("table_schema", "public");

        if (error) throw error;
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      }

      case "count_records": {
        let query = supabase
          .from(input.table!)
          .select("*", { count: "exact", head: true });

        if (input.match) {
          for (const [key, value] of Object.entries(input.match)) {
            query = query.eq(key, value);
          }
        }

        const { count, error } = await query;

        if (error) throw error;
        return {
          content: [
            {
              type: "text",
              text: `Total records: ${count}`,
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Supabase MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
