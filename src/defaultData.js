(function () {
	var data,
		i,
		defaultData = [],
		white = ["Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"],
		black = ["Rook", "Knight", "Bishop", "King", "Queen", "Bishop", "Knight", "Rook"],
		pos = ["A", "B", "C", "D", "E", "F", "G", "H"];

		for (i = 0; i < white.length; i++) {
			data = {
				piece: white[i],
				player: "White",
				position: (pos[i] + "1")
			};
			defaultData.push(data);
		}
		for (i = 0; i < 8; i++) {
			data = {
				piece: "Pawn",
				player: "White",
				position: (pos[i] + "2")
			};
			defaultData.push(data);
		}
		for (i = 0; i < black.length; i++) {
			data = {
				piece: black[i],
				player: "Black",
				position: (pos[i] + "8")
			};
			defaultData.push(data);
		}
		for (i = 0; i < 8; i++) {
			data = {
				piece: "Pawn",
				player: "Black",
				position: (pos[i] + "7")
			};
			defaultData.push(data);
		}
	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = defaultData;
	} else {
		window.HighchessData = defaultData;
	}
}());