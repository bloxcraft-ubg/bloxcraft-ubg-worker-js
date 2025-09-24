export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetHost = "bloxcraft-ubg.pages.dev";
    const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

    const newHeaders = new Headers(request.headers);
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) newHeaders.set("cookie", cookieHeader);

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "follow",
    });

    newRequest.headers.set("Host", targetHost);

    let response = await fetch(newRequest);

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-security-policy");
    resHeaders.delete("content-security-policy-report-only");
    resHeaders.delete("x-frame-options");
    resHeaders.delete("cross-origin-opener-policy");
    resHeaders.delete("cross-origin-embedder-policy");
    resHeaders.delete("cross-origin-resource-policy");
    resHeaders.delete("permissions-policy");
    resHeaders.set("access-control-allow-origin", "*");

    const setCookies = response.headers.get("set-cookie");
    if (setCookies) {
      resHeaders.set("set-cookie", setCookies);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  }
};
