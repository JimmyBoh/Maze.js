/************************
 * Maze.js
 *
 * Created by Jim Buck
 * Algorithms derived from Jamis Buck
 *
 * v0.1 - May 8, 2014
 *
 ***********************/

window.MazeJS = {};
(function (m) {

	m.Mazes = [];
	m.Generators = {};
	m.Generators.register = function (name, method) {
		m.Generators[name] = new m.Generator(name, method);
	};

	m.Maze = function (options) {
		
		var defaults = {
			w: 5,
			h: 5,
			onCellChange: function(){},
			generator: null
		};
		
		options.w = options.w || defaults.w;
		options.h = options.h || defaults.h;
		options.onCellChange = options.onCellChange || defaults.onCellChange;
		options.generator = options.generator || defaults.generator;
		
		if(typeof options.generator == 'string')
			options.generator = MazeJS.Generators[options.generator];
		
		this.options = options;
		this.width = options.w;
		this.height = options.h;
		this.generator = options.generator.Name;
		this.cells = new Array(this.width);

		m.Cell.prototype.onCellChange = options.onCellChange;

		for (var c = 0; c < this.width; c++) {
			for (var r = 0; r < this.height; r++) {
				if (r === 0)
					this.cells[c] = new Array(this.height);

				this.cells[c][r] = new m.Cell(this, c, r, false);
			}
		}

		m.Mazes.push(this);
	};

	m.Maze.prototype.generate = function (options) {
		options.generator = options.generator || this.generator;
		
		if(!options.generator) throw new Error('No generator was specified!');
		
		this.seed = options.seed || Math.floor(Math.random() * 99999);
		done = options.done || function () {};

		if (typeof options.generator === 'string')
			options.generator = m.Generators[options.generator];
		
		this.generator = options.generator.Name;
		options.generator.Create.call(this, this, this.seed, options.done);
	};

	m.Maze.prototype.clear = function () {
		this.forEach(function (cell) {
			cell.setState('');
		});
	};

	m.Maze.prototype.isValid = function (x, y) {
		return y >= 0 && y < this.height && x >= 0 && x < this.width; // && this.cells[x][y];
	};

	m.Maze.prototype.forEach = function (func) {
		for (var r = 0; r < this.height; r++) {
			for (var c = 0; c < this.width; c++) {
				func.call(this, this.cells[c][r]);
			}
		}
	};

	m.Cell = function (grid, x, y) {
		this.grid = grid;

		this.x = x;
		this.y = y;

		this.N = false;
		this.E = false;
		this.S = false;
		this.W = false;
		this.state = '';
		
		if(this.x == 0)
			this.switchState('W', false);
		if(this.x+1 == grid.width)
			this.switchState('E', false);
		if(this.y == 0)
			this.switchState('N', false);
		if(this.y+1 == grid.width)
			this.switchState('S', false);
	};
	
	m.Cell.prototype.getNeighbors = function(){
		var neighbors = {};
		
		if (this.grid.isValid(this.x, this.y - 1))
			neighbors.N = this.grid.cells[this.x][this.y - 1];
			
		if (this.grid.isValid(this.x + 1, this.y))
			neighbors.E = this.grid.cells[this.x + 1][this.y];
			
		if (this.grid.isValid(this.x, this.y + 1))
			neighbors.S = this.grid.cells[this.x][this.y + 1];
			
		if (this.grid.isValid(this.x - 1, this.y))
			neighbors.W = this.grid.cells[this.x - 1][this.y];
			
		return neighbors;
	};

	m.Cell.prototype.setState = function (stateString, force) {
		stateString = stateString.toUpperCase();

		if(!force){
			if(this.y === 0) stateString = stateString.replace('N','');
			if(this.x+1 === this.grid.width) stateString = stateString.replace('E','');
			if(this.y+1 === this.grid.height) stateString = stateString.replace('S','');
			if(this.x === 0)  stateString = stateString.replace('W','');
		}
		
		this.switchState('N', stateString.indexOf('N') > -1);
		this.switchState('E', stateString.indexOf('E') > -1);
		this.switchState('S', stateString.indexOf('S') > -1);
		this.switchState('W', stateString.indexOf('W') > -1);

		if (this.grid.isValid(this.x, this.y - 1))
			this.grid.cells[this.x][this.y - 1].switchState('S', this.N);
		if (this.grid.isValid(this.x + 1, this.y))
			this.grid.cells[this.x + 1][this.y].switchState('W', this.E);
		if (this.grid.isValid(this.x, this.y + 1))
			this.grid.cells[this.x][this.y + 1].switchState('N', this.S);
		if (this.grid.isValid(this.x - 1, this.y))
			this.grid.cells[this.x - 1][this.y].switchState('E', this.W);

		this.previousState = this.state;
		this.state = stateString;
		this.onCellChange.call(this, this);
	};

	m.Cell.prototype.switchState = function (stateChar, val) {
		stateChar = stateChar.toUpperCase();
		
		if (arguments.length === 1) {
			if (this[stateChar])
				this.removeState(stateChar);
			else
				this.addState(stateChar);
		} else {
			if (val)
				this.addState(stateChar);
			else
				this.removeState(stateChar);
		}
	};

	m.Cell.prototype.addState = function (stateChar) {
		stateChar = stateChar.toUpperCase();

		if (this[stateChar])
			return;

		this[stateChar] = true;

		this.previousState = this.state;
		this.state = stateChar + this.state;

		this.onCellChange.call(this, this);
	};

	m.Cell.prototype.removeState = function (stateChar) {
		stateChar = stateChar.toUpperCase();

		if (!this[stateChar])
			return;

		this[stateChar] = false;

		this.previousState = this.state || '';
		this.state = this.state.replace(stateChar, '');

		this.onCellChange.call(this, this);
	};

	m.SeededRandom = function (seed) {
		this.seed = Math.abs(seed);
	}

	m.SeededRandom.prototype.next = function (min, max) {
		max = max || 1;
		min = min || 0;

		this.seed = (this.seed * 9301 + 49297) % 233280;
		var rnd = this.seed / 233280;

		return min + rnd * (max - min);
	};
	
	m.SeededRandom.prototype.nextInt = function (min, max) {
		return Math.floor(this.next(min,max));
	};
	
	m.Generator = function(name, create){
		this.Name = name;
		this.Create = create;
	}

})(window.MazeJS);
