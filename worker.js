export default {
  async fetch(request, env, ctx) {
    const targetHost = "bloxcraft-ubg.pages.dev";
    const url = new URL(request.url);
    const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

    const newHeaders = new Headers(request.headers);
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) newHeaders.set("cookie", cookieHeader);

    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "follow",
      cf: { cacheEverything: false, cacheTtl: 0 }, 
    });

    newRequest.headers.set("Host", targetHost);

    let response = await fetch(newRequest);

    const resHeaders = new Headers(response.headers);
    resHeaders.delete("content-security-policy");
    resHeaders.delete("x-frame-options");
    resHeaders.delete("cross-origin-opener-policy");
    resHeaders.delete("cross-origin-embedder-policy");
    resHeaders.delete("cross-origin-resource-policy");
    resHeaders.delete("permissions-policy");
    resHeaders.set("access-control-allow-origin", "*");

    
    const setCookies = response.headers.get("set-cookie");
    if (setCookies) resHeaders.set("set-cookie", setCookies);

  
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      let html = await response.text();

     // INJECTS ADS... Just Kidding lol
      const script = `
        <script>
          document.addEventListener("DOMContentLoaded", () => {
            document.querySelectorAll("a").forEach(a => {
              // If no target="_blank", force link to open in browser
              if (a.target !== "_blank") {
                a.href = a.href.replace(window.location.origin, "https://${targetHost}");
                a.target = "_self";
              }
            });
          });
        </script>
      `;

 
      html = html.replace("</body>", `${script}</body>`);

      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    }

  
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  }
};
