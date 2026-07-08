export async function uploadFile(file: File, bucket: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  
  const token = localStorage.getItem("kv_library_token");
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: formData
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.details || errData.error || `Upload failed with status ${res.status}`);
  }
  
  const data = await res.json();
  return data.publicUrl;
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
