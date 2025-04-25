const lineTrackingController = {

    saveResponse: async (req, res) => {
		console.log('got here')
		const {userLines, templateLines}= req.body;
		// console.log('request body', req.body)
        const user_id = req.user.id;
        if (!user_id || !userLines || !templateLines  ) {

            return res.status(400).json({ error: "Missing required fields" });
        }

		const result = lineTrackingController.evaluateUserPath(userLines[0], templateLines, 10);
		console.log('Точок загалом:', result.totalPoints);
		console.log('У межах шаблону:', result.insideCount);
		console.log('Точність малювання:', result.percentInside + '%');
		console.log('Похибка:', result.percentOutside + '%');

	
		res.json({
			message: "Final score calculated",
			finalScore: `${result.percentInside}`,
		});

	},
	
	evaluateUserPath : (userPoints, templatePoints, threshold = 1) => {
		let insideCount = 0;
	
		for (let i = 0; i < userPoints.length; i++) {
			const userPoint = userPoints[i];
			let isInside = false;
	
			for (let j = 0; j < templatePoints.length - 1; j++) {
				const start = templatePoints[j];
				const end = templatePoints[j + 1];
				const distance = lineTrackingController.distanceToSegment(userPoint, start, end);
				if (distance <= threshold) {
					isInside = true;
					break;
				}
			}
	
			if (isInside) insideCount++;
		}
	
		const totalPoints = userPoints.length;
		const percentInside = totalPoints === 0 ? 0 : (insideCount / totalPoints) * 100;
	
		return {
			totalPoints,
			insideCount,
			percentInside: percentInside.toFixed(2),
			percentOutside: (100 - percentInside).toFixed(2)
		};
	},
	distanceToSegment: (p, v, w) => {
		const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
		if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
	
		let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
		t = Math.max(0, Math.min(1, t));
		const projection = {
			x: v.x + t * (w.x - v.x),
			y: v.y + t * (w.y - v.y)
		};
		return Math.hypot(p.x - projection.x, p.y - projection.y);
	}
	
	

}
export default lineTrackingController;