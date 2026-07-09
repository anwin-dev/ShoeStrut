const fs = require('fs');
let content = fs.readFileSync('c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/admin.js', 'utf8');

// Replace ejs import
content = content.replace(/const \{ render \} = require\("ejs"\);\n/, 'const jwt = require("jsonwebtoken");\n');

// loginGet: API doesn't need to render login page
content = content.replace(/const loginGet = async \(req, res\) => \{[\s\S]*?^\};/m, `const loginGet = async (req, res) => {
  res.status(200).json({ success: true, message: "Admin login API endpoint" });
};`);

// loginPost: generate JWT instead of setting session
content = content.replace(/const loginPost = async \(req, res\) => \{[\s\S]*?^\};/m, `const loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminDetails = await adminModel.findOne({ email: email });
    if (!adminDetails || adminDetails.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    
    const token = jwt.sign({ id: adminDetails._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('adminJwt', token, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', sameSite: 'strict' });
    
    return res.status(200).json({ success: true, message: "Login successful", token, adminId: adminDetails._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};`);

// homeGet: remove session check, return JSON
content = content.replace(/if \(req\.session\.adminId\) \{/, '');
content = content.replace(/\} else \{\s*res\.redirect\("\/admin\/"\);\s*\}/, '');
content = content.replace(/res\.render\("admin\/adminHome", \{([\s\S]*?)\}\);/m, 'res.status(200).json({ success: true, data: { $1 } });');

// fix res.redirect inside homeGet (in Promise.all)
content = content.replace(/res\.redirect\("\/admin\/adminHome"\);/g, ''); // just remove redirect, it shouldn't stop API response, or throw error

// logoutGet: clear cookie
content = content.replace(/const logoutGet = async \(req, res\) => \{[\s\S]*?^\};/m, `const logoutGet = async (req, res) => {
  try {
    res.clearCookie('adminJwt');
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};`);

fs.writeFileSync('c:/Users/vfcma/OneDrive/Desktop/StepStyle/controller/admin.js', content);
console.log("Refactored admin.js");
