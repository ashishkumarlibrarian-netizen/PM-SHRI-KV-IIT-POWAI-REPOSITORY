import dotenv from "dotenv";
dotenv.config();

async function run() {
  console.log("Testing POST to achiever categories...");
  const r1 = await fetch("http://localhost:3000/api/admin/library-achievers/categories", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Bug Test", is_active: true })
  });
  console.log("R1 status:", r1.status);
  
  console.log("Now logging in to poison the global client...");
  const r2 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ashishkumar.librarian@gmail.com", password: "password123" }) // assuming dummy password or whatever
  });
  console.log("Login status:", r2.status);
  
  console.log("Testing POST again...");
  const r3 = await fetch("http://localhost:3000/api/admin/library-achievers/categories", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Bug Test 2", is_active: true })
  });
  console.log("R3 status:", r3.status, await r3.text());
}
run();
