const fs = require('fs');

const filesToRefactor = [
  'c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/adminProduct.js',
  'c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/category.js',
  'c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/cart.js',
  'c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/user.js'
];

filesToRefactor.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace req.session.userId with req.user._id
    content = content.replace(/req\.session\.userId/g, 'req.user ? req.user._id : null');
    content = content.replace(/req\.session\.adminId/g, 'req.admin ? req.admin.id : null');

    // Replace generic res.render with res.json
    content = content.replace(/res\.render\((['"`])(.*?)\1\s*,\s*(\{[\s\S]*?\})\s*\)/g, 'res.status(200).json({ success: true, data: $3 })');
    content = content.replace(/res\.render\((['"`])(.*?)\1\s*\)/g, 'res.status(200).json({ success: true, view: $1$2$1 })');

    // Replace res.redirect with res.json
    content = content.replace(/res\.redirect\((['"`])(.*?)\1\s*\)/g, 'res.status(200).json({ success: true, redirect: $1$2$1 })');

    fs.writeFileSync(filePath, content);
    console.log("Refactored " + filePath);
  }
});
