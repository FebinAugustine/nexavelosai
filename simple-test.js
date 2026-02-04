const fs = require("fs");
const path = require("path");

// Check if test-widget.html exists
const testFile = path.join(__dirname, "test-widget.html");
if (!fs.existsSync(testFile)) {
  console.error("Error: test-widget.html not found");
  process.exit(1);
}

// Read the file
const htmlContent = fs.readFileSync(testFile, "utf8");

console.log("=== test-widget.html content ===");
console.log(htmlContent);
console.log("================================");

// Check for script tag
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const match = scriptRegex.exec(htmlContent);

if (!match) {
  console.error("Error: No script tag found");
  process.exit(1);
}

console.log("=== Script content ===");
console.log(match[1]);
console.log("======================");

// Try to evaluate the script (safely)
try {
  // Extract function definition
  const functionMatch = match[1].match(/function testWidget[\s\S]*?}/);
  if (functionMatch) {
    console.log("Function definition found");
    console.log("Test page is valid");
  } else {
    console.error("Error: No testWidget function found");
    process.exit(1);
  }
} catch (error) {
  console.error("Error evaluating script:", error);
  process.exit(1);
}

console.log("✅ Test page is valid");
