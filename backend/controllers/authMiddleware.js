import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Витягуємо токен з заголовка Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

	console.log('token', token)
	if (!token) {
		console.log('unauthorised')
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET); // Розшифровуємо токен
		req.user = decoded; // Зберігаємо дані користувача в req
		next();
	} catch (error) {
		console.log('invalid token')

		return res.status(403).json({ error: "Invalid token" });
	}
};

export default authMiddleware;
