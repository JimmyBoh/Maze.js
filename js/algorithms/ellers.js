/**

 /**
  *  Eller's Algorithm Generator
  *		See
/**
 http://weblog.jamisbuck.org/2010/12/29/maze-generation-eller-s-algorithm
  *
/**
 by Jim Buck 2014
  */

(function(m, name) {

  if (typeof m === 'undefined')
    throw new Error(
      'Maze library was not found! Unable to register generator "' + name + '"...');

  var randos = ['N', 'E', 'S', 'W', 'NE', 'SE', 'NW', 'SW', 'WE', 'NS', 'NWE', 'SWN', 'ESW', 'NES', 'NSEW'];

  m.Generators.register(name, function(maze, rand, done) {
    for (var row = 0; row < maze.height; row++) {
      var numOfDivisions = rand.nextInt(1,
        maze.width - 2);
      var currentRow = maze.cells[row];
      for (numOfDivisions; numOfDivision > 0; numOfDivisions--) {
        var i = rand.nextInt(0,
          currentRow.length);
        currentRow[i]
      }

    }

    done.call(this);
  });

  function unique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] ===
          a[j])
          a.splice(j--, 1);
      }
    }

    return a;
  };

  function Set(id) {
    this.id = id;
    this.cells = [];
    this.verts = [];
  }
  Set.prototype.merge = function(set) {
    this.cells =
      unique(this.cells.concat(set.cells));
    this.verts =
      unique(this.verts.concat(set.verts));
  };

  Set.prototype.add = function(cell) {
    this.cells.push(cell);
    cell.set =
      this;
  };

  Set.prototype.open = function(cell) {
    this.verts.push(cell);
  };

})(window.MazeJS, 'Ellers');
