const fs = require('fs');

let content = fs.readFileSync('c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/shop.js', 'utf8');

content = content.replace(/req\.session\.userId/g, 'req.user ? req.user._id : null');
content = content.replace(/res\.status\(400\)\.render\("404page"\)/g, 'res.status(400).json({ success: false, message: "Not found" })');
content = content.replace(/res\.render\("404page"\)/g, 'res.status(404).json({ success: false, message: "Not found" })');
content = content.replace(/res\.render\("User\/productDetails", \{/g, 'res.status(200).json({ success: true,');
content = content.replace(/res\.render\("User\/shop", \{/g, 'res.status(200).json({ success: true,');
content = content.replace(/res\.status\(200\)\.render\("User\/whislist", \{/g, 'res.status(200).json({ success: true,');

// Fix the redirect
content = content.replace(/res\.status\(200\)\.redirect\("\/home"\);/g, 'res.status(200).json({ success: true, message: "Added to cart wishlist" });');

fs.writeFileSync('c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/shop.js', content);
console.log("Refactored shop.js");
