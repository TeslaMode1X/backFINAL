const jwt = require('jsonwebtoken');
const pool = require('../db'); 

exports.cookieWithAuth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        res.clearCookie('token');
        return res.redirect('/?error=401'); 
    }

    try {
        // getting user id from cookies
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const result = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            res.clearCookie('token');
            return res.redirect('/?error=401');
        }

        req.user = result.rows[0];
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/?error=401');
    }
};
