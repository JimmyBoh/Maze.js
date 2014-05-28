



(function (m, name) {
	
	if (typeof m === 'undefined')
		throw new Error('Maze library was not found! Unable to register generator "'+name+'"...');
	
	var randos = ['N', 'E', 'S', 'W', 'NE', 'SE', 'NW', 'SW', 'WE', 'NS', 'NWE', 'SWN', 'ESW', 'NES', 'NSEW'];
	m.Generators.register(name, function (maze, seed, done) {
		var rand = new m.SeededRandom(seed);
		
		maze.forEach(function (cell) {
			cell.setState(randos[rand.nextInt(0, randos.length)]);
		});
		done.call(this);
	});
})(window.MazeJS, 'Random');
