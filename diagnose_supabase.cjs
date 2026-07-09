const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";

console.log("=== SUPABASE CLIENT DIAGNOSTICS ===");
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key (length):", supabaseKey ? supabaseKey.length : 0);
console.log("Supabase Key Prefix:", supabaseKey ? supabaseKey.substring(0, 20) + "..." : "undefined");
console.log("Supabase Key Suffix:", supabaseKey ? "..." + supabaseKey.substring(supabaseKey.length - 10) : "undefined");

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  // Test 1: List Buckets
  console.log("\n--- TEST 1: Listing Buckets ---");
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
    } else {
      console.log("Successfully retrieved buckets:", buckets.map(b => b.name));
    }
  } catch (err) {
    console.error("Exception listing buckets:", err);
  }

  // Test 2: Try dummy uploads to each bucket
  const bucketsToTest = ['events', 'notices', 'bulletin', 'magazines', 'profiles', 'gallery', 'staff', 'documents'];
  console.log("\n--- TEST 2: Testing upload to each bucket ---");
  const dummyBuffer = Buffer.from("test-content-" + Date.now());
  
  for (const bucket of bucketsToTest) {
    console.log(`\nTesting bucket: "${bucket}"...`);
    try {
      const fileName = `diag-test-${Date.now()}.txt`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, dummyBuffer, {
          contentType: 'text/plain',
          upsert: true
        });
      
      if (error) {
        console.error(`[-] Upload FAILED for "${bucket}":`);
        console.error(JSON.stringify(error, null, 2));
      } else {
        console.log(`[+] Upload SUCCEEDED for "${bucket}":`, data);
        // Clean up
        const { error: deleteError } = await supabase.storage.from(bucket).remove([fileName]);
        if (deleteError) {
          console.error(`    Failed to clean up file ${fileName}:`, deleteError);
        } else {
          console.log(`    Cleaned up file ${fileName}`);
        }
      }
    } catch (err) {
      console.error(`[-] Exception during upload to "${bucket}":`, err);
    }
  }
}

runDiagnostics();
