export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const targetHost = "bloxcraft-ubg.pages.dev";
    const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "follow"
    });

    newRequest.headers.set("Host", targetHost);

    let response = await fetch(newRequest);

    const newHeaders = new Headers(response.headers);
    newHeaders.delete("content-security-policy");
    newHeaders.delete("content-security-policy-report-only");
    newHeaders.delete("x-frame-options");
    newHeaders.delete("cross-origin-opener-policy");
    newHeaders.delete("cross-origin-embedder-policy");
    newHeaders.delete("cross-origin-resource-policy");
    newHeaders.delete("permissions-policy");
    newHeaders.set("access-control-allow-origin", "*"); 

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};
