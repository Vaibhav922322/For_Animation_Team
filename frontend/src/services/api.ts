export interface FileMetadata {
  full_unc_path: string;
  file_path: string;
  file_name: string;
  parent_path: string;
  shared_folder_name: string;
  file_size: number;
  is_file: boolean;
  host: boolean;
  host_ip: string; // Assuming string based on download requirement
  host_name?: string;
}

// Runtime configuration — reads IP & port from server_connection.json
// (copied into dist/ by run_frontend.bat at launch time)

let cachedConfig: { API_BASE_URL: string } | null = null;

const getConfig = async (): Promise<{ API_BASE_URL: string }> => {
  if (cachedConfig) return cachedConfig;

  console.log("[API] getConfig called. Resolving backend URL...");

  // 1. Check window.__CONFIG__ (injected by config.js in dist/)
  const win = window as any;
  if (win.__CONFIG__?.API_URL) {
    const url = win.__CONFIG__.API_URL;
    console.log("[API] CONNECTED via window.__CONFIG__:", url);
    cachedConfig = { API_BASE_URL: url };
    return cachedConfig;
  }

  // 2. Fetch server_connection.json (copied into dist/ by run_frontend.bat)
  const potentialPaths = [
    '/server_connection.json',
    './server_connection.json',
  ];

  for (const path of potentialPaths) {
    try {
      console.log(`[API] Trying ${path}...`);
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        if (data.SERVER_IP && data.PORT) {
          const url = `http://${data.SERVER_IP}:${data.PORT}`;
          console.log(`[API] CONNECTED via ${path}:`, url);
          cachedConfig = { API_BASE_URL: url };
          return cachedConfig;
        }
      }
    } catch (e) {
      console.warn(`[API] Could not fetch ${path}:`, e);
    }
  }

  // 3. No config found — throw clear error instead of scanning
  const errMsg = "Backend not found. Make sure the backend is running and server_connection.json exists.";
  console.error(`[API] ${errMsg}`);
  throw new Error(errMsg);
};

export const refreshFiles = async (): Promise<any> => {
  const { API_BASE_URL } = await getConfig();
  console.log('[API] Refreshing files...', `${API_BASE_URL}/refresh/`);
  try {
    const response = await fetch(`${API_BASE_URL}/refresh/`, {
      method: 'POST',
    });
    console.log('[API] Refresh response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Refresh failed:', response.status, errorText);
      throw new Error(`Failed to refresh files: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[API] Refresh success:', data);
    return data;
  } catch (error) {
    console.error('[API] Refresh error:', error);
    throw error;
  }
};

export const findFiles = async (filename?: string, directory_path?: string): Promise<FileMetadata[]> => {
  const { API_BASE_URL } = await getConfig();
  const params = new URLSearchParams();
  if (filename && filename.trim()) params.append('fileName', filename);
  if (directory_path) params.append('directory_path', directory_path);

  const url = `${API_BASE_URL}/find?${params.toString()}`;
  console.log('[API] Finding files...', url);
  try {
    const response = await fetch(url);
    if (response.status === 404 && !filename && !directory_path) {
      // Return empty list if root search returns 404
      return [];
    }
    console.log('[API] Find response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Find failed:', response.status, errorText);
      throw new Error(`Failed to find files: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[API] Find success. Items found:', data.length);
    return data;
  } catch (error) {
    console.error('[API] Find error:', error);
    throw error;
  }
};

export const downloadFile = async (
  host_ip: string,
  shared_folder_name: string,
  file_path: string,
  onStart?: () => void,
  onEnd?: () => void,
  onProgress?: (percent: number) => void
): Promise<void> => {
  const { API_BASE_URL } = await getConfig();
  const url = `${API_BASE_URL}/download/`;
  const body = { host_ip, shared_folder_name, file_path };
  console.log('[API] Downloading file...', url, body);

  onStart?.();

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        console.log(`[API] Download progress: ${percent}%`);
        onProgress?.(percent);
      } else {
        const mb = (event.loaded / 1024 / 1024).toFixed(1);
        console.log(`[API] Downloaded ${mb} MB`);
        onProgress?.(-1); // indeterminate
      }
    };

    xhr.onload = () => {
      console.log('[API] XHR Download status:', xhr.status);
      if (xhr.status === 200) {
        const blob = xhr.response;
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;

        // Try to get filename from Content-Disposition header
        const contentDisposition = xhr.getResponseHeader('Content-Disposition');
        let fileName = file_path.split('\\').pop()?.split('/').pop() || 'download';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch?.[1]) {
            fileName = filenameMatch[1];
          }
        }

        console.log('[API] Starting download for:', fileName);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(urlBlob);
        document.body.removeChild(a);
        console.log('[API] Download completed successfully');
        onEnd?.();
        resolve();
      } else {
        console.error('[API] Download failed:', xhr.status, xhr.statusText);
        onEnd?.();
        reject(new Error(`Download failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      console.error('[API] XHR Download network error');
      onEnd?.();
      reject(new Error('Network error during download'));
    };

    xhr.ontimeout = () => {
      console.error('[API] XHR Download timeout');
      onEnd?.();
      reject(new Error('Download timed out'));
    };

    xhr.send(JSON.stringify(body));
  });
};

export const previewFile = async (
  host_ip: string,
  shared_folder_name: string,
  file_path: string
): Promise<Blob> => {
  const { API_BASE_URL } = await getConfig();
  const url = `${API_BASE_URL}/download/`;
  const body = { host_ip, shared_folder_name, file_path };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch preview');
  }

  return response.blob();
};
