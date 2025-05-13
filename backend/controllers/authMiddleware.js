/**
 * Author: Maryna Kucher
 * Description: Middleware that verifies user authentication.
 * Part of Bachelor's Thesis: Digital Assessment of Human Perceptual-Motor Functions.
 */
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
	//get token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		//decode token
		const decoded = jwt.verify(token, process.env.JWT_SECRET); 
		//save data about user 
		req.user = decoded; 
		next();
	} catch (error) {

		return res.status(403).json({ error: "Invalid token" });
	}
};

export default authMiddleware;
