const http = require("http");
const crypto = require("crypto");

const PORT = 8080;
const SECRET = "test-secret";

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log("=== Received Webhook ===");
      console.log("Timestamp:", new Date().toISOString());
      console.log("URL:", req.url);
      console.log("Headers:", req.headers);
      console.log("Body:", body);

      // Verify signature if present
      const signature = req.headers["x-nexavelosai-signature"];
      if (signature) {
        const computedSignature = crypto
          .createHmac("sha256", SECRET)
          .update(body)
          .digest("hex");

        console.log("Signature valid:", computedSignature === signature);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Webhook received" }));
    });
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
  }
});

server.listen(PORT, () => {
  console.log(`Test webhook endpoint listening on port ${PORT}`);
  console.log(`Use secret: ${SECRET}`);
  console.log(`Test URL: http://localhost:${PORT}/webhook`);
});
