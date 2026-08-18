import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Error: SUPABASE_URL and SUPABASE_KEY environment variables are required");
  process.exit(1);
}

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
    name: "list_columns",
    description: "List all columns for a specific table",
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
        try {
          const { data, error } = await supabase.rpc("get_tables");
          if (error) {
            return {
              content: [
                {
                  type: "text",
                  text: "To list tables, create this SQL function in your Supabase project:\n\nCREATE OR REPLACE FUNCTION get_tables() RETURNS TABLE(table_name text) AS $$\n  SELECT t.table_name\n  FROM information_schema.tables t\n  WHERE t.table_schema = 'public'\n  ORDER BY t.table_name;\n$$ LANGUAGE SQL;\n\nOr manually query your database schema.",
                },
              ],
            };
          }
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: "Create a get_tables() function in Supabase to list tables, or query your database directly.",
              },
            ],
          };
        }
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

      case "list_columns": {
        try {
          const { data, error } = await supabase.rpc("get_columns", {
            table_name: input.table!,
          });
          if (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Create a get_columns() function:\n\nCREATE OR REPLACE FUNCTION get_columns(table_name text) RETURNS TABLE(column_name text, data_type text, is_nullable boolean) AS $$\n  SELECT c.column_name, c.data_type, c.is_nullable::boolean\n  FROM information_schema.columns c\n  WHERE c.table_name = $1 AND c.table_schema = 'public';\n$$ LANGUAGE SQL;`,
                },
              ],
            };
          }
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: "Create a get_columns() function in your Supabase project to list table columns.",
              },
            ],
          };
        }
      }

      case "get_table_schema": {
        try {
          const { data, error } = await supabase.rpc("get_table_schema", {
            table_name: input.table!,
          });
          if (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Create a get_table_schema() function:\n\nCREATE OR REPLACE FUNCTION get_table_schema(table_name text)\nRETURNS TABLE(column_name text, data_type text, is_nullable boolean, column_default text) AS $$\n  SELECT c.column_name, c.data_type, c.is_nullable::boolean, c.column_default\n  FROM information_schema.columns c\n  WHERE c.table_name = $1 AND c.table_schema = 'public'\n  ORDER BY c.ordinal_position;\n$$ LANGUAGE SQL;`,
                },
              ],
            };
          }
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        } catch (err) {
          return {
            content: [
              {
                type: "text",
                text: "Create a get_table_schema() function in your Supabase project for schema introspection.",
              },
            ],
          };
        }
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
