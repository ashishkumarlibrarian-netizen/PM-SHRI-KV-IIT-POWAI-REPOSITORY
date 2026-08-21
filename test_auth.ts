import dotenv from "dotenv";
dotenv.config();

async function run() {
  console.log("1. Testing unauthenticated POST...");
  const r1 = await fetch("http://localhost:3000/api/admin/library-achievers/categories", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauth Test", is_active: true })
  });
  console.log("Unauthenticated status:", r1.status);
  
  console.log("\n2. Logging in as admin...");
  const r2 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ashishkumar.librarian@gmail.com", password: "password123" }) 
  });
  
  if (r2.ok) {
     const data = await r2.json();
     const token = data.token;
     
     console.log("\n3. Testing POST with admin token...");
     const r3 = await fetch("http://localhost:3000/api/admin/library-achievers/categories", {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: "Admin Test", is_active: true })
      });
      console.log("Admin POST status:", r3.status);
      if (r3.ok) {
        const cat = await r3.json();
        console.log("Created category:", cat.id);
        
        console.log("\n4. Testing DELETE with admin token...");
        const r4 = await fetch(`http://localhost:3000/api/admin/library-achievers/categories/${cat.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Admin DELETE status:", r4.status);
      }
  } else {
     console.log("Login failed", r2.status);
  }
}
run();
