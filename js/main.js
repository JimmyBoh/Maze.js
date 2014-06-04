(function(){
	'use strict';

	window.Grid = {};
	window.SeedInput;
	window.Size = 5;

	var CELL_MULTIPLIER = 1;
	var CELL_OFFSET = Math.floor(CELL_MULTIPLIER / 2);

	window.buildGrid = function (w, h) {

		Grid.addClass(CELL_MULTIPLIER === 1 ? 'lines' : 'grid');

		var cellsWidth = w * CELL_MULTIPLIER;
		var cellsHeight = h * CELL_MULTIPLIER;

		var hPercentage = 100 / cellsHeight;
		var wPercentage = 100 / cellsWidth;

		for (var r = 0; r < cellsHeight; r++) {
			for (var c = 0; c < cellsWidth; c++) {

				var cell = $('<div class="cell" id="' + c + 'x' + r + '" title="' + c + ' x ' + r + '"/>');

				if (r % CELL_MULTIPLIER == CELL_OFFSET && c % CELL_OFFSET == CELL_OFFSET)
					cell.addClass('core');

				cell.css({
					'width' : wPercentage + '%',
					'height' : hPercentage + '%',
				});
				Grid.append(cell);
			}
		}
	};

	window.generateMaze = function (w, h) {

		var seedInput = $('#seedInput');
		var seed = seedInput.val();

		if (!seed)
			return;

		window.maze.generate({
			generator : 'Random',
			seed : seed,
			done : function () {
			    window.location.hash = '#' + this.seed;
			}
		});
	};

	window.generateRandom = function () {
	    var random = Math.floor(Math.random() * 99999);
	    SeedInput.val(random);
	    window.location.hash = '#' + random;
	    generateMaze();
	};

	window.findCellDiv = function (x, y) {
		return $('#' + x + 'x' + y);
	};

	window.displayCell = function (cell) {
		var x = CELL_MULTIPLIER * cell.x + CELL_OFFSET;
		var y = CELL_MULTIPLIER * cell.y + CELL_OFFSET;

		if (CELL_MULTIPLIER === 3) {
			for (var xi = -1; xi <= 1; xi++)
				for (var yi = -1; yi <= 1; yi++)
					findCellDiv(x + xi, y + yi).removeClass('open');

			findCellDiv(x, y).addClass('open');

			if (cell.N)
				findCellDiv(x, y - 1).addClass('open');
			if (cell.E)
				findCellDiv(x + 1, y).addClass('open');
			if (cell.S)
				findCellDiv(x, y + 1).addClass('open');
			if (cell.W)
				findCellDiv(x - 1, y).addClass('open');

			if (cell.N && cell.E)
				findCellDiv(x + 1, y - 1).addClass('open');
			if (cell.S && cell.E)
				findCellDiv(x + 1, y + 1).addClass('open');
			if (cell.N && cell.W)
				findCellDiv(x - 1, y - 1).addClass('open');
			if (cell.S && cell.W)
				findCellDiv(x - 1, y + 1).addClass('open');
		} else if (CELL_MULTIPLIER === 1) {
			var cellDiv = window.findCellDiv(x, y);

			var cellDivClass = 'cell ';
			for (var s in cell.state)
				cellDivClass += cell.state[s].toUpperCase() + ' ';

			cellDiv.attr('class', cellDivClass).attr('title', cell.state);
		}
	};

	window.clearGrid = function () {
	    SeedInput.val('');
		window.maze.clear();
	};

	$(function () {
		Grid = $('#grid');
		window.SeedInput = $('#seedInput');
		window.buildGrid(Size, Size);

		window.maze = new MazeJS.Maze({
		    width: Size,
		    height: Size,
		    onCellChange: displayCell,
		    generator: 'Random'
		});

		if(!window.location.hash){
		    window.location.hash = '#10';
		}
		
		var initialSeed = window.location.hash.replace('#', '');
		SeedInput.val(initialSeed);
		generateMaze();
	});
})();
