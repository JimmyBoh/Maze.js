
/**
 *  Binary Tree Generator
 *		Creates a very simple maze from a really simple binary tree.
 *  by Jim Buck 2014
 */

(function (m, name) {

    if (typeof m === 'undefined')
        throw new Error('Maze library was not found! Unable to register generator "' + name + '"...');

    var randos = [
        function (maze, cell, rand) {
            var dirs = [];
            if (cell.y > 0) dirs.push('N');
            if (cell.x > 0) dirs.push('W');
            return dirs[rand.nextInt(0, dirs.length)];
        }, function (maze, cell, rand) {
            var dirs = [];
            if (cell.y > 0) dirs.push('N');
            if (cell.x < maze.width-1) dirs.push('E');
            return dirs[rand.nextInt(0, dirs.length)];
        }, function (maze, cell,rand) {
            var dirs = [];
            if (cell.y < maze.height-1) dirs.push('S');
            if (cell.x > 0) dirs.push('W');
            return dirs[rand.nextInt(0, dirs.length)];
        }, function (maze, cell, rand) {
            var dirs = [];
            if (cell.y < maze.height - 1) dirs.push('S');
            if (cell.x < maze.width - 1) dirs.push('E');
            return dirs[rand.nextInt(0, dirs.length)];
        }
    ];

    m.Generators.register(name, function (maze, rand, done) {

        var dirFunc = randos[rand.nextInt(0, randos.length)];
        maze.forEach(function (cell) {
            
            var newDir = dirFunc(maze, cell, rand);
            if (!newDir) return;

            var state = newDir + cell.state;
            console.log(state);
            //console.log(cell.x + 'x' + cell.y + ' -> ' + state);
            cell.setState(state);
        });
        done.call(this);
    });
})(window.MazeJS, 'Random');
