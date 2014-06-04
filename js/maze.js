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
	'use strict';

	m.Mazes = [];
	m.Generators = {};
	m.Generators.register = function (name, method) {
		m.Generators[name] = new m.Generator(name, method);
	};

	//#region Maze Object
	
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
			options.generator = m.Generators[options.generator];

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

	/**
	 * Generates a new maze according to default or supplied options.
	 * @param {Object} options
	 * @return {Maze} Generated maze.
	 */
	m.Maze.prototype.generate = function (options) {
		options.generator = options.generator || this.generator;

		if(!options.generator) throw new Error('No generator was specified!');

		this.seed = options.seed || Math.floor(Math.random() * 99999);
		options.done = options.done || function () {};

		if (typeof options.generator === 'string')
			options.generator = m.Generators[options.generator];

		this.clear();
		this.generator = options.generator.Name;
		options.generator.Create.call(this, this, new m.SeededRandom(this.seed), options.done);
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

	//#endregion
	
	//#region Cell Object
	
	m.Cell = function (grid, x, y) {
		this.grid = grid;

		this.x = x;
		this.y = y;

		this.N = false;
		this.E = false;
		this.S = false;
		this.W = false;
		this.state = '';

		if(this.x === 0)
			this.switchState('W', false);
		if(this.x+1 == grid.width)
			this.switchState('E', false);
		if(this.y === 0)
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

	//#endregion
	
	//#region Generator Object
	
	m.Generator = function(name, create){
		this.Name = name;
		this.Create = create;
	};
	
	//#endregion
	
	//#region SeededRandom Object
	
	m.SeededRandom = function (seed) {
		this.seed = Math.abs(seed);
	};

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

	m.SeededRandom.prototype.nextBool = function (threshold) {
	    threshold = threshold || 0.5;

	    return this.next() >= threshold;
	}
	
    //#endregion


    //#region Set Object

	m.Set = function () {
	    this.Items = new Array();
	}

	m.Set.prototype.add = function (data) {
	    var item = {
	        data: data,
	        parent: this
	    };

	    if (this.Items.indexOf(item) == -1) {
	        this.Items.push(item);
	    }

	    return this;
	}

	m.Set.prototype.remove = function (data) {
	    var item = {
	        data: data,
	        parent: this
	    };

	    var i = this.Items.indexOf(item);

	    if (i > -1)
	        this.Items.splice(i, 1)[0];

	    return this;
	}

	m.Set.prototype.merge = function (oldSet) {
	    for (var i in oldSet.Items) {
	        var data = oldSet.Items[i].data;
	        oldSet.remove(data);
	        this.add(data);
	    }
	}

    //#endregion

    //#region LinkedList Object

	m.LinkedList = function () {
	    this.Head = null;
	    this.Tail = null;
	}

	m.LinkedList.prototype.append = function (node) {
	    if (node instanceof m.LinkedListNode === false) node = new m.LinkedListNode(node);

	    if (this.Tail)
	        this.Tail.append(node);
        else
	    {
	        this.Head = this.Tail = node;
	        node.Parent = this;
	    }

	    return node;
	}

	m.LinkedList.prototype.prepend = function (node) {
	    if (node instanceof m.LinkedListNode === false) node = new m.LinkedListNode(node);

	    if (this.Head)
	        this.Head.prepend(node);
	    else
	    {
	        this.Head = this.Tail = node;
	        node.Parent = this;
	    }

	    return node;
	}

	m.LinkedList.prototype.forEach = function (func, backwards) {
	    var currentNode = backwards ? this.Tail : this.Head;
	    while (currentNode) {
	        func.call(this, currentNode, this);
	        currentNode = backwards ? currentNode.Left : currentNode.Right;
	    }
	}

	m.LinkedList.prototype.count = function () {
	    var count = 0;
	    this.forEach(function (node) { count++; });
	    return count;
	}

	m.LinkedList.prototype.clear = function () {
	    this.forEach(function (node) {
	        node.remove();
	    });
	}

	m.LinkedListNode = function (data) {
	    this.Data = data;
	    this.Left = left;
	    this.Right = right;
	    this.Parent = null;
	}

	m.LinkedListNode.prototype.append = function (node) {
	    if (node instanceof m.LinkedListNode === false) node = new m.LinkedListNode(node);

	    if (this.Right) {
	        this.Right.Left = node;
            node.Right = this.Right
	    }

	    this.Right = node;
	    node.Left = this;
	    node.Parent = this.Parent;

	    if (this.Parent.Tail === this)
	        this.Parent.Tail = node;

	    return node;
	}

	m.LinkedListNode.prototype.prepend = function (node) {
	    if (node instanceof m.LinkedListNode === false) node = new m.LinkedListNode(node);

	    if (this.Left) {
	        this.Left.Right = node;
	        node.Left = this.Right
	    }

	    this.Left = node;
	    node.Right = this;
	    node.Parent = this.Parent;

	    if (this.Parent.Head === this)
	        this.Parent.Head = node;

	    return this;
	}

	m.LinkedListNode.prototype.remove = function () {

	    if (this.Parent.Head === this)
	        this.Parent.Head = this.Right;

	    if (this.Parent.Tail === this)
	        this.Parent.Tail = this.Left;

	    if (this.Left) {
	        this.Left.Right = this.Right;
	    }

	    if (this.Right) {
	        this.Right.Left = this.Left;
	    }

	    delete this.Left;
	    delete this.Right;
	    delete this.Parent;

	    return this;
	}

    //#endregion

})(window.MazeJS);
