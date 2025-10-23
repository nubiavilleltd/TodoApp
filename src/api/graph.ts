import axios from "axios";
import type { TodoItem } from "../types";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export async function fetchTodos(token: string, siteId: string, listId: string): Promise<TodoItem[]> {
  const res = await axios.get(`${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items?expand=fields`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.value.map((item: any) => ({
    id: item.id,
    title: item.fields.Title,
    description: item.fields.Description,
    status: item.fields.Status || "Pending",
    imageLink: item.fields.ImageLink,
  }));
}
