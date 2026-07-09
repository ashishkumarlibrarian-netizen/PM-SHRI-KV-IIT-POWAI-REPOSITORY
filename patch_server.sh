sed -i 's/console.log(`Backend uploading/console.log(`Key used for upload: ${supabaseKey.substring(0, 10)}...`); console.log(`Backend uploading/' server.ts
