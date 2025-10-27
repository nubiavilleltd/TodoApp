import type {
  TodoItem,
  TodoStatus,
  SharePointUser,
  ApprovalStatus,
} from "../types";

// CONFIGURATION - Update these with your SharePoint details
const SHAREPOINT_TENANT = "nubiaville";
const SITE_NAME = "NubiavilleModernPortal";
const LIST_NAME = "Todos";
const DOCUMENT_LIBRARY = "TodoUploads"; // Create this library in SharePoint
const TODO_ADMIN_LIST = "TodoAppAdmins";

// Build the base URL
const SITE_URL = SITE_NAME
  ? `https://${SHAREPOINT_TENANT}.sharepoint.com/sites/${SITE_NAME}`
  : `https://${SHAREPOINT_TENANT}.sharepoint.com`;

const API_BASE = `${SITE_URL}/_api/web/lists/getbytitle('${LIST_NAME}')`;
const ADMIN_API_BASE = `${SITE_URL}/_api/web/lists/getbytitle('${TODO_ADMIN_LIST}')`;

/**
 * Get form digest value (required for POST/UPDATE/DELETE operations)
 */
async function getFormDigest(token: string): Promise<string> {
  const response = await fetch(`${SITE_URL}/_api/contextinfo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=verbose",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get form digest: ${response.statusText}`);
  }

  const data = await response.json();
  return data.d.GetContextWebInformation.FormDigestValue;
}

/**
 * Search for users (People Picker)
 */
export async function searchUsers(
  token: string,
  searchText: string
): Promise<SharePointUser[]> {
  try {
    const response = await fetch(
      `${SITE_URL}/_api/web/siteusers?$filter=substringof('${searchText}',Title) or substringof('${searchText}',Email)&$select=Id,Title,Email`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.d.results.map((user: any) => ({
      Id: user.Id,
      Title: user.Title,
      EMail: user.Email,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 *
 * @param token
 * @returns
 */
export async function getCurrentUser(token: string) {
  const response = await fetch(`${SITE_URL}/_api/web/currentuser`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=verbose",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get current user: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.d.Id,
    title: data.d.Title,
    email: data.d.Email,
  };
}

/**
 * Upload file to document library
 */
export async function uploadFile(token: string, file: File): Promise<string> {
  try {
    const digest = await getFormDigest(token);

    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload file
    const uploadUrl = `${SITE_URL}/_api/web/lists/getbytitle('${DOCUMENT_LIBRARY}')/RootFolder/Files/add(url='${encodeURIComponent(
      file.name
    )}',overwrite=true)`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.d.ServerRelativeUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Fetch all todos from SharePoint list
 */
export async function fetchTodos(token: string): Promise<TodoItem[]> {
  try {
    const userId = await getCurrentUser(token);
    const ID = userId.id;

    const response = await fetch(
      `${API_BASE}/items?$filter=Author/Id eq ${ID} or Approver/Id eq ${ID}&$select=ID,Id,Title,Description,Status,ImagePath,ApprovalStatus,Author/Id,Author/Title,Author/EMail,ApproverId,Approver/Id,Approver/Title,Approver/EMail&$expand=Author,Approver`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }

    const data = await response.json();

    return data.d.results.map((item: any) => ({
      id: item.ID?.toString(),
      title: item.Title,
      description: item.Description || "",
      status: (item.Status || "Pending") as TodoStatus,
      imagePath: item.ImagePath || undefined,
      approver: item.Approver
        ? {
            id: item.Approver.Id?.toString(),
            title: item.Approver.Title,
            email: item.Approver.EMail,
          }
        : undefined,
      approvalStatus: (item.ApprovalStatus ||
        "Awaiting Approval") as ApprovalStatus,
    }));
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
}

/**
 * Fetch SIngle Todo by id
 * @param token
 * @param id
 * @returns
 */
export async function fetchTodoById(
  token: string,
  id: string
): Promise<TodoItem> {
  try {
    const response = await fetch(
      `${API_BASE}/items(${id})?$select=ID,Id,Title,Description,Status,ImagePath,ApprovalStatus,Author/Id,Author/Title,Author/EMail,ApproverId,Approver/Id,Approver/Title,Approver/EMail&$expand=Author,Approver`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch todo: ${response.statusText}`);
    }

    const data = await response.json();
    const item = data.d;

    return {
      id: item.ID?.toString(),
      title: item.Title,
      description: item.Description || "",
      status: (item.Status || "Pending") as TodoStatus,
      imagePath: item.ImagePath || undefined,
      approver: item.Approver
        ? {
            id: item.Approver.Id?.toString(),
            title: item.Approver.Title,
            email: item.Approver.EMail,
          }
        : undefined,
      author: item.Author
        ? {
            id: item.Author.Id,
            title: item.Author.Title,
            email: item.Author.EMail,
          }
        : undefined,
      approvalStatus: item.ApprovalStatus,
    };
  } catch (error) {
    console.error("Error fetching todo by ID:", error);
    throw error;
  }
}

/**
 * Create a new todo item
 */
export async function createTodo(
  token: string,
  todo: TodoItem
): Promise<TodoItem> {
  try {
    const digest = await getFormDigest(token);

    const body: any = {
      __metadata: { type: "SP.Data.TodosListItem" },
      RequestID: todo.id,
      Title: todo.title,
      Description: todo.description,
      Status: todo.status,
    };

    if (todo.imagePath) {
      body.ImagePath = todo.imagePath;
    }

    if (todo.approver) {
      body.ApproverId = parseInt(todo.approver.id);
    }

    // console.log("Request body:", JSON.stringify(body, null, 2));

    const response = await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      console.error("Request was:", body);
      throw new Error(
        `Failed to create todo: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    let approverData = todo.approver;
    if (data.d.Approver) {
      approverData = {
        id: data.d.Approver.Id?.toString() || todo.approver?.id || "",
        title: data.d.Approver.Title || todo.approver?.title || "",
        email: data.d.Approver.EMail || todo.approver?.email || "",
      };
    }

    return {
      id: data.d.Id.toString(),
      title: data.d.Title,
      description: data.d.Description || "",
      status: (data.d.Status || "Pending") as TodoStatus,
      imagePath: data.d.ImagePath || undefined,
      approver: approverData,
      approvalStatus: (data.d.ApprovalStatus ||
        "Pending Approval") as ApprovalStatus,
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    throw error;
  }
}

/**
 * Update an existing todo item
 */
export async function updateTodo(
  token: string,
  id: string,
  updates: Partial<Omit<TodoItem, "id">>
): Promise<TodoItem> {
  try {
    const digest = await getFormDigest(token);

    // Get current item to retrieve its ETag
    const getResponse = await fetch(`${API_BASE}/items(${id})`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
      },
    });

    if (!getResponse.ok) {
      throw new Error(
        `Failed to fetch item for update: ${getResponse.statusText}`
      );
    }

    const itemData = await getResponse.json();
    const etag = itemData.d.__metadata.etag;

    const updateData: any = {
      __metadata: { type: "SP.Data.TodosListItem" },
    };

    if (updates.title !== undefined) updateData.Title = updates.title;
    if (updates.description !== undefined)
      updateData.Description = updates.description;
    if (updates.status !== undefined) updateData.Status = updates.status;
    if (updates.imagePath !== undefined)
      updateData.ImagePath = updates.imagePath;
    if (updates.approver !== undefined) {
      updateData.ApproverId = updates.approver
        ? parseInt(updates.approver.id)
        : null;
    }
    if (updates.approvalStatus !== undefined)
      updateData.ApprovalStatus = updates.approvalStatus;

    // Perform the update
    const response = await fetch(`${API_BASE}/items(${id})`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "IF-MATCH": etag,
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to update todo: ${response.statusText}`);
    }

    const updatedResponse = await fetch(
      `${API_BASE}/items(${id})?$select=Id,Title,Description,Status,ApprovalStatus,Approver/Id,Approver/Title,Approver/EMail&$expand=Approver`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    if (!updatedResponse.ok) {
      throw new Error(
        `Failed to fetch updated item: ${updatedResponse.statusText}`
      );
    }

    const updatedItem = await updatedResponse.json();
    const d = updatedItem.d;

    return {
      id: d.Id.toString(),
      title: d.Title,
      description: d.Description || "",
      status: (d.Status || "Pending") as TodoStatus,
      imagePath: d.ImagePath || undefined,
      approver: d.Approver
        ? {
            id: d.Approver.Id.toString(),
            title: d.Approver.Title,
            email: d.Approver.EMail,
          }
        : undefined,
      approvalStatus: d.ApprovalStatus,
    };
  } catch (error) {
    console.error("Error updating todo:", error);
    throw error;
  }
}

/**
 * Delete a todo item
 */
export async function deleteTodo(token: string, id: string): Promise<void> {
  try {
    const digest = await getFormDigest(token);

    // Get the item's etag
    const getResponse = await fetch(`${API_BASE}/items(${id})`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
      },
    });

    if (!getResponse.ok) {
      throw new Error(
        `Failed to fetch item for deletion: ${getResponse.statusText}`
      );
    }

    const itemData = await getResponse.json();
    const etag = itemData.d.__metadata.etag;

    const response = await fetch(`${API_BASE}/items(${id})`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "IF-MATCH": etag,
        "X-HTTP-Method": "DELETE",
      },
    });

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete todo: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
}

/**
 * Check if User is an Admin
 */
export async function checkIfAdmin(token: string, userEmail: string) {
  const res = await fetch(
    `${ADMIN_API_BASE}/items?$select=Id,User/Id,User/EMail&$expand=User&$filter=User/EMail eq '${userEmail}'`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
      },
    }
  );

  if (!res.ok) {
    console.error("Error fetching admin data:", await res.text());
    return false;
  }

  const data = await res.json();
  return data.d?.results?.length > 0;
}

/**
 * Fetch All todos
 */
export async function fetchAllTodos(token: string) {
  const res = await fetch(
    `${API_BASE}/items?$select=Id,Title,Description,Status,ApprovalStatus,Approver/Id,Approver/Title,Approver/EMail,Author/Id,Author/Title,Author/EMail,ImagePath&$expand=Approver,Author&$orderby=Created desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
      },
    }
  );

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  return data.d.results.map((item: any) => ({
    id: item.ID?.toString(),
    title: item.Title,
    description: item.Description || "",
    status: (item.Status || "Pending") as TodoStatus,
    imagePath: item.ImagePath || undefined,
    approver: item.Approver
      ? {
          id: item.Approver.Id?.toString(),
          title: item.Approver.Title,
          email: item.Approver.EMail,
        }
      : undefined,
    author: item.Author
      ? {
          id: item.Author.Id?.toString(),
          title: item.Author.Title,
          email: item.Author.EMail,
        }
      : undefined,
    approvalStatus: (item.ApprovalStatus ||
      "Awaiting Approval") as ApprovalStatus,
  }))
}

/**
 * Fetch Admins from List
 * @param token
 * @returns
 */
export async function fetchAdmins(token: string) {
  const res = await fetch(
    `${ADMIN_API_BASE}/items?$select=Id,User/Id,User/Title,User/EMail&$expand=User`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=verbose",
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.d?.results || [];
}

/**
 * Add Admins
 * @param token
 * @param userId
 * @returns
 */
export async function addAdmin(token: string, userId: number) {
  const res = await fetch(`${ADMIN_API_BASE}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
    },
    body: JSON.stringify({
      __metadata: { type: "SP.Data.TodoAppAdminsListItem" },
      UserId: userId,
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.d;
}

/**
 * Delete Admin
 * @param token
 * @param id
 */
export async function deleteAdmin(token: string, id: number) {
  const res = await fetch(`${ADMIN_API_BASE}/items(${id})`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "IF-MATCH": "*",
      "X-HTTP-Method": "DELETE",
    },
  });

  if (!res.ok) throw new Error(await res.text());
}
