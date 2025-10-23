// Update your TodoItem type to match the statuses you're using in SharePoint

export type TodoStatus = "Pending" | "In Progress" | "Completed";

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  imagePath?: string;
  approver?: {
    id: string;
    title: string; // Display name
    email: string;
  };
}

export interface SharePointUser {
  Id: number;
  Title: string;
  EMail: string;
}