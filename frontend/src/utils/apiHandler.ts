export const apiHandler = async (
    url: string,
    method: string,
    contentType?: string,
    body?: { [key: string]: string | string[] }
  ) => {
    const options: {
      method: string;
      headers: {
        Authorization: string;
        "Content-Type"?: string
      };
      body?: string;
    } = {
      method: method,
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    };
  
    if (method !== "GET") {
      options.body = JSON.stringify(body);
      options.headers["Content-Type"] = contentType;
    }
  
    const raw = await fetch(url, options);
    if (raw.status === 401) {
      localStorage.removeItem("token");
    }
  
    return raw;
  };