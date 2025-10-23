// import type { TodoItem } from "../types";

// // CONFIGURATION - Update these with your SharePoint details
// const SHAREPOINT_TENANT = "nubiaville"; // e.g., 'contoso'
// const SITE_NAME = "NubiavilleModernPortal"; // e.g., 'TeamSite' or leave empty for root site
// const LIST_NAME = "Todos"; // Your SharePoint list name

// // Build the base URL
// const SITE_URL = SITE_NAME
//   ? `https://${SHAREPOINT_TENANT}.sharepoint.com/sites/${SITE_NAME}`
//   : `https://${SHAREPOINT_TENANT}.sharepoint.com`;

// const API_BASE = `${SITE_URL}/_api/web/lists/getbytitle('${LIST_NAME}')`;

// /**
//  * Get form digest value (required for POST/UPDATE/DELETE operations)
//  */
// async function getFormDigest(token: string): Promise<string> {
//   const response = await fetch(`${SITE_URL}/_api/contextinfo`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: "application/json;odata=verbose",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to get form digest: ${response.statusText}`);
//   }

//   const data = await response.json();
//   return data.d.GetContextWebInformation.FormDigestValue;
// }

// /**
//  * Fetch all todos from SharePoint list
//  */
// export async function fetchTodos(token: string): Promise<TodoItem[]> {
//   try {
//     const response = await fetch(`${API_BASE}/items?$select=Id,Title,Description,Status`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch todos: ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     return data.d.results.map((item: any) => ({
//       id: item.Id.toString(),
//       title: item.Title,
//       description: item.Description || "",
//       status: item.Status || "Pending",
//     }));
//   } catch (error) {
//     console.error("Error fetching todos:", error);
//     throw error;
//   }
// }

// /**
//  * Create a new todo item
//  */
// export async function createTodo(
//   token: string,
//   todo: Omit<TodoItem, "id">
// ): Promise<TodoItem> {
//   try {
//     const digest = await getFormDigest(token);

//     const response = await fetch(`${API_BASE}/items`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//         "Content-Type": "application/json;odata=verbose",
//         "X-RequestDigest": digest,
//       },
//       body: JSON.stringify({
//         __metadata: { type: "SP.Data.TodosListItem" }, // Adjust based on your list name
//         Title: todo.title,
//         Description: todo.description,
//         Status: todo.status,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to create todo: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return {
//       id: data.d.Id.toString(),
//       title: data.d.Title,
//       description: data.d.Description || "",
//       status: data.d.Status || "Pending",
//     };
//   } catch (error) {
//     console.error("Error creating todo:", error);
//     throw error;
//   }
// }

// /**
//  * Update an existing todo item
//  */
// export async function updateTodo(
//   token: string,
//   id: string,
//   updates: Partial<Omit<TodoItem, "id">>
// ): Promise<void> {
//   try {
//     const digest = await getFormDigest(token);

//     // First, get the item's etag
//     const getResponse = await fetch(`${API_BASE}/items(${id})`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//       },
//     });

//     if (!getResponse.ok) {
//       throw new Error(`Failed to fetch item for update: ${getResponse.statusText}`);
//     }

//     const itemData = await getResponse.json();
//     const etag = itemData.d.__metadata.etag;

//     const updateData: any = {
//       __metadata: { type: "SP.Data.TodosListItem" },
//     };

//     if (updates.title !== undefined) updateData.Title = updates.title;
//     if (updates.description !== undefined) updateData.Description = updates.description;
//     if (updates.status !== undefined) updateData.Status = updates.status;

//     const response = await fetch(`${API_BASE}/items(${id})`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//         "Content-Type": "application/json;odata=verbose",
//         "X-RequestDigest": digest,
//         "IF-MATCH": etag,
//         "X-HTTP-Method": "MERGE",
//       },
//       body: JSON.stringify(updateData),
//     });

//     if (!response.ok && response.status !== 204) {
//       throw new Error(`Failed to update todo: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.error("Error updating todo:", error);
//     throw error;
//   }
// }

// /**
//  * Delete a todo item
//  */
// export async function deleteTodo(token: string, id: string): Promise<void> {
//   try {
//     const digest = await getFormDigest(token);

//     // Get the item's etag
//     const getResponse = await fetch(`${API_BASE}/items(${id})`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//       },
//     });

//     if (!getResponse.ok) {
//       throw new Error(`Failed to fetch item for deletion: ${getResponse.statusText}`);
//     }

//     const itemData = await getResponse.json();
//     const etag = itemData.d.__metadata.etag;

//     const response = await fetch(`${API_BASE}/items(${id})`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json;odata=verbose",
//         "X-RequestDigest": digest,
//         "IF-MATCH": etag,
//         "X-HTTP-Method": "DELETE",
//       },
//     });

//     if (!response.ok && response.status !== 204) {
//       throw new Error(`Failed to delete todo: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.error("Error deleting todo:", error);
//     throw error;
//   }
// }
import type { TodoItem, TodoStatus, SharePointUser } from "../types";

// CONFIGURATION - Update these with your SharePoint details
const SHAREPOINT_TENANT = "nubiaville";
const SITE_NAME = "NubiavilleModernPortal";
const LIST_NAME = "Todos";
const DOCUMENT_LIBRARY = "TodoUploads"; // Create this library in SharePoint

// Build the base URL
const SITE_URL = SITE_NAME
  ? `https://${SHAREPOINT_TENANT}.sharepoint.com/sites/${SITE_NAME}`
  : `https://${SHAREPOINT_TENANT}.sharepoint.com`;

const API_BASE = `${SITE_URL}/_api/web/lists/getbytitle('${LIST_NAME}')`;

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
 * Upload file to document library
 */
export async function uploadFile(
  token: string,
  file: File
): Promise<string> {
  try {
    const digest = await getFormDigest(token);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload file
    const uploadUrl = `${SITE_URL}/_api/web/lists/getbytitle('${DOCUMENT_LIBRARY}')/RootFolder/Files/add(url='${encodeURIComponent(file.name)}',overwrite=true)`;
    
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
    const response = await fetch(
      `${API_BASE}/items?$select=Id,Title,Description,Status,ImageLink,ApproverId,Approver/Id,Approver/Title,Approver/EMail&$expand=Approver`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json;odata=verbose",
        },
      }
    );

    console.log("Fetch Todos Response:", response);

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.statusText}`);
    }

    const data = await response.json();

    return data.d.results.map((item: any) => ({
      id: item.Id.toString(),
      title: item.Title,
      description: item.Description || "",
      status: (item.Status || "Pending") as TodoStatus,
      imageLink: item.ImageLink || undefined,
      approver: item.Approver
        ? {
            id: item.Approver.Id?.toString(),
            title: item.Approver.Title,
            email: item.Approver.EMail,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Error fetching todos:", error);
    throw error;
  }
}

/**
 * Create a new todo item
 */
export async function createTodo(
token: string,
todo: Omit<TodoItem, "id">
): Promise<TodoItem> {
  try {
    const digest = await getFormDigest(token);

    const body: any = {
      __metadata: { type: "SP.Data.TodosListItem" },
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

    console.log("Request body:", JSON.stringify(body, null, 2));

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

    console.log("Create Todos Response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      console.error("Request was:", body);
      throw new Error(`Failed to create todo: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    console.log("Created Todo Data:", data);
    
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
      imagePath: data.d.ImageLink || undefined,
      approver: approverData,
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
): Promise<void> {
  try {
    const digest = await getFormDigest(token);

    // First, get the item's etag
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
    if (updates.imagePath !== undefined) updateData.ImageLink = updates.imagePath;
    if (updates.approver !== undefined) {
      updateData.ApproverId = updates.approver ? parseInt(updates.approver.id) : null;
    }

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