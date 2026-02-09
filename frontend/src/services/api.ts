
export interface FileMetadata {
  full_unc_path: string;
  file_path: string;
  file_name: string;
  shared_folder_name: string;
  file_size: number;
  is_file: boolean;
  host: boolean;
  host_ip: string; // Assuming string based on download requirement
}

// Use current origin in production (relative path), or localhost:8000 in dev
const API_BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8000' : '';

export const refreshFiles = async (): Promise<{ message: string }> => {
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

export const findFiles = async (filename: string): Promise<FileMetadata[]> => {
  const url = `${API_BASE_URL}/find?fileName=${encodeURIComponent(filename)}`;
  console.log('[API] Finding files...', url);
  try {
    const response = await fetch(url);
    console.log('[API] Find response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Find failed:', response.status, errorText);
      throw new Error(`Failed to find files: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[API] Find success. Items found:', data.length, data);
    return data;
  } catch (error) {
    console.error('[API] Find error:', error);
    throw error;
  }
};

export const downloadFile = async (host_ip: string, shared_folder_name: string, file_path: string): Promise<void> => {
  const url = `${API_BASE_URL}/download`;
  const body = {
    host_ip,
    shared_folder_name,
    file_path,
  };
  console.log('[API] Downloading file...', url, body);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    console.log('[API] Download response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Download failed:', response.status, errorText);
      throw new Error(`Failed to download file: ${response.status} ${errorText}`);
    }

    // Handle blob download
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    // Try to get filename from Content-Disposition header, or use file_path's basename
    const contentDisposition = response.headers.get('Content-Disposition');
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
  } catch (error) {
    console.error('[API] Download error:', error);
    throw error;
  }
};
