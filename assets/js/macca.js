var SESSION_KEY = 'ms_stats',
  LOCAL_KEY = 'ms_ls';

$(document).ready(function() {
  gameOptions.init();
  game.init(15);
  if (isMobile.any()) alert('Device NOT currently supported\nFor best experience play with a mouse or on a PC.\nFor updates, follow code on: \nhttps://github.com/sheldon-e/maccasweeper');
});

var initSessionStats = function(pre_parse) {
  /*
   * create a new initialized object to store stats in sessionStorage
   * the object is initialized as JSON string.
   * It takes a single argument pre_parse. If ommitted or given a truthy
   * value, a Javascript object is returned. Otherwise a string is returned.
   */
  var f = '{"plays":0, "wins":0, "round": 1,' +
    '"lost_games": 0, "best_time":0, "gameTracker":""}';
  if (pre_parse || pre_parse === undefined)
    return JSON.parse(f);
  else
    return f;
}; // initSessionStats


var updateDOM = function(cur, life) {
  /** updateDOM(current, lifetime)
  this method will update the page elements that show the "score board"
  It takes as input, the current value for the object we put in session storage
  and the object we put in localstorage.
  **/
  var h, i, idname, store, value_fields, fld;
  if (cur === undefined)
    cur = JSON.parse(window.sessionStorage.getItem(SESSION_KEY))
  if (life === undefined)
    life = JSON.parse(window.localStorage.getItem(LOCAL_KEY))
  for (h = 0; h < 2; h++) {
    idname = (['current-score', 'top-score'])[h];
    store = ([cur, life])[h];
    value_fields = document.getElementsByClassName('value');
    for (i = 0; i < value_fields.length; i++) {
      fld = value_fields[i];
      if (store && fld.id in store)
        fld.innerHTML = store[fld.id];
    }
  }
};


// The following section sets up initial values for each game session
var gameTracker = "no-track";
var currentStats = window.sessionStorage.getItem(SESSION_KEY) || initSessionStats(false);
currentStats = JSON.parse(currentStats);
currentStats['game_started'] = new Date();
if (!currentStats.roundTracker)
  currentStats.roundTracker = {};
gameTracker = "plyr";
if (currentStats.gameTracker && currentStats.gameTracker != gameTracker) {

  currentStats = Object.assign({}, currentStats, initSessionStats(true));
}
currentStats.gameTracker = gameTracker;

var lifetimeStats = window.localStorage.getItem(LOCAL_KEY) ||
  '{"games_played": 0, "total_wins":0, "lifetime_best":0}';
lifetimeStats = JSON.parse(lifetimeStats);

updateDOM(currentStats, lifetimeStats);


var updateStats = function() {
  // This method updates the DOM of the game. It gets the number of games played
  // The number of games won, the number of games lost as well as the best time and saves
  // them in SESSION and LOCAL
  var playerStat, p, round_end = false;
  lifetimeStats.games_played += 1; // increment total games count
  currentStats.plays += 1; // increment current count
  if (currentStats.plays == 0) {
    round_end = true;
  }
  if (game.win) { // somebody won.
    currentStats.best_time = game.time;
    currentStats.wins += 1;
    if (game.time <= currentStats.best_time || currentStats.best_time == 0) {
      currentStats.best_time = game.time;
      if (currentStats.best_time <= lifetimeStats.lifetime_best || lifetimeStats.lifetime_best == 0) {
        lifetimeStats.lifetime_best = currentStats.best_time;
      }
    }
  } else {
    // somebody done lost
    currentStats.lost_games += 1;    
    }
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentStats));
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(lifetimeStats));
  updateDOM(currentStats, lifetimeStats);
};

var revealMines = function() {
  // This method displays all maccas when the game ends it also lets you see which ones you got 
  // right by not removing the flags from maccas that you've correctly found. 
  $(".board-square").each(function() {

    if (!$(this).hasClass("flagged")) {
      if (($(this).text() == "M")) {
        $(this).addClass("mine");
        $(this).addClass("revealed");
      }
    } else {
      $(this).removeClass("mine");
    }

    if ($(this).text() != "M") {
      $(this).removeClass("flagged");
    }
  })
};


var isMobile = {
  // This function checks to see whether you are using a mobile device; mainly for compatibility issues.
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

var toggleHelp = function() {
  // Shows a modal with instructions 
  alert('Soh yuh wan help?\nThe purpose of the game is to open all the cells of the board which do not contain a macca. You lose if you set off a macca cell. ' +
    'Every non-macca cell you open will tell you the total number of maccas in the eight neighboring cells. Once you are sure that a cell contains a macca,' +
    'you can right-click to put a flag it on it as a reminder. Once you have flagged all the maccas and cleared all the cells you win!' +
    'To start a new game (abandoning the current one), just click on the new game button.');
  return false;
};

var toggleJcanHelp = function() {
  // Shows a modal with the Jamaican version of instructions 
  alert('The short-er Jamaican version\n'+
'Tanks fi play fi wi game Maccasweeper. Dis is a knockoff fi Minesweeper; only ting it bigga an betta. Yuh play it almoas di same way.'+
'Yuh play gainst di computa and try no mek makka jook yuh. Awoah!\n\n'+
//'How fi play:\n'+
'Yuh put yuh mouse ova di cell weh yuh wan click. If yuh click a macca cell yuh lose. We have some wheelin macca fi yuh look pan when you lose. Yuh ago lose nuff so might as well. '+
'When you clear out bush, an no click no macca we mek it green-ish. When yuh click pan a cell weh no ha no macca yuh si how much macca deh side a it. '+
'We mean seh it tell yuh how much cell have macca outta di 8 weh deh round it – di one above, below, to the lef an to di right and di one dem weh deh slant way from it. ' +
'Di corna wan dem no have 8 cell sida dem neida di wan dem a di side. \n\n' +
'Di easiess way fi learn Maccasweeper is fi play it. Mek sure yuh can guess good else di fus cell yuh click cud be a macca. Yuh can choose di size board yuh wan fi play pon. '+
'Di bigga di board di more macca yuh have fi fine. At di top to di leff, yuh can si how much macca yuh fi fine and pan di right yuh si how much time yuh tek fi win. '+
'Di lass ting yuh need fi know is fi flag di cell dem wid d macca so yuh no tep pan dem, a mean click pan dem. When yuh think a cell have macca yuh haffi right-click pan it. '+
'Put yuh mouse ova di macca cell an click pan it wid di right mouse button.' +

'\n\nSo now weh yuh a wait pan? Duh road!');
  return false;
};

// Setting up the game board
var board = {
  board: [],
  size: 10,
  mineCount: 0,
  mineRatio: 0.2,
  flags: 0,
  init: function(size) {
    // Initialize game board with all parts
    this.board = [];
    this.size = size;
    $(".board-container").empty();
    this.mineCount = Math.floor(this.size * this.size * this.mineRatio);
    this.flags = this.mineCount;
    this.newBoard();
    this.addMines();
    this.addHints();
    this.renderBoard();
    this.preventRightClickMenu();
  },
  newBoard: function() {
    // Create game board based off default settings in document ready function or based on values from board 
    //size
    for (var i = 0; i < this.size; i++) {
      this.board.push([]);
      for (var j = 0; j < this.size; j++) {
        this.board[i].push("");
      }
    }
  },
  addMines: function() {
    //Randomly generates and places maccas all over the board
    for (var i = 0; i < this.mineCount; i++) {
      var randomRow = Math.floor(Math.random() * (this.size));
      var randomCol = Math.floor(Math.random() * (this.size));
      while (this.board[randomRow][randomCol] == "M") {
        randomRow = Math.floor(Math.random() * (this.size));
        randomCol = Math.floor(Math.random() * (this.size));
      }
      this.board[randomRow][randomCol] = "M";
    }
  },
  addHints: function() {
    //places hints around maccas
    for (var i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        if (this.board[i][j] != "M") {
          var count = 0;
          this.getSurroundingSquareCoords(i, j).forEach(function(coordinates) {
            if (board.isMine(coordinates[0], coordinates[1])) count += 1;
          });
          this.board[i][j] = count;
        }
      }
    }
  },
  isMine: function(row, col) {
    //checks to see whether the selected box is a macca or not
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return;
    return this.board[row][col] != "undefined" &&
      this.board[row][col] === "M";
  },
  renderBoard: function() {
    //this method creates the game board based on the default size or by the selected board size
    $(".board-container").append("<table class='board'></table>");
    for (var i = 0; i < this.size; i++) {
      $(".board").append("<tr class='board-row-" + i + "'></tr>");
      for (var j = 0; j < this.size; j++) {
        $(".board-row-" + i).append("<td class='board-square' data-row='" + i +
          "' data-col='" + j + "'><p>" +
          this.board[i][j] + "</p></td>")
      }
    }
  },
  revealSquare: function($square) {
    // This method reveals the contents beneath the square
    $square.removeClass("flagged");
    var row = $square.data("row");
    var col = $square.data("col");
    var value = board.board[row][col];
    if (value === "M") {
      $square.addClass("revealed");
      $square.addClass("mine");
    } else if (value === 0) {
      $square.find("p").text("").show();
      $square.addClass("revealed");
      $square.removeClass("flagged");
      board.getSurroundingSquareCoords(row, col).forEach(function(coordinates) {
        board.showHint(coordinates[0], coordinates[1]);
      });
    } else {
      $square.find("p").show();
      $square.addClass("revealed");
    }
  },
  quickClear: function($square) {
    // Clears squares until there is a macca in the 8 squares closest ot it
    var flags = 0;
    var notRevealedOrFlagged = [];
    var surrSquares = board.getSurroundingSquares($square.data("row"),
      $square.data("col"));
    surrSquares.forEach(function($surrSquare) {
      if ($surrSquare.hasClass("flagged")) {
        flags += 1;
      }
      if (!$surrSquare.hasClass("flagged") &&
        !$surrSquare.hasClass("revealed")) {
        notRevealedOrFlagged.push($surrSquare);
      }
    });
    if (flags.toString() === $square.text() &&
      notRevealedOrFlagged.length > 0) {
      notRevealedOrFlagged.forEach(function($squareToReveal) {
        board.revealSquare($squareToReveal);
      });
    }
  },
  getSurroundingSquareCoords: function(row, col) {
    //Get the coordinates for the surrounding squares 
    return [
      [row - 1, col - 1],
      [row - 1, col],
      [row - 1, col + 1],
      [row, col - 1],
      [row, col + 1],
      [row + 1, col - 1],
      [row + 1, col],
      [row + 1, col + 1]
    ].filter(function(coordinates) {
      return coordinates[0] >= 0 && coordinates[0] < board.size &&
        coordinates[1] >= 0 && coordinates[1] < board.size;
    });
  },
  getSurroundingSquares: function(row, col) {
    //Get the square object from the coordinates
    return board.getSurroundingSquareCoords(row, col)
      .map(function(coords) {
        return $(".board-square[data-row='" + coords[0] +
          "'][data-col='" + coords[1] + "']");
      });
  },
  showHint: function(row, col) {
    // Show hints in the cleared squares about the surrounding maccas
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return;
    var $square = $(".board-square[data-row='" + row +
      "'][data-col='" + col + "']");
    if ($square.text() != "M" && !$square.hasClass("revealed")) {
      if ($square.text() === "0") {
        board.revealSquare($square);
      } else {
        $square.find("p").show();
        $square.addClass("revealed");
      }
    }
  },
  addOrRemoveFlag: function($square) {
    // Add flags (A condition for winning VERY IMPORTANT)
    if ($square.hasClass("flagged")) {
      $square.removeClass("flagged");
      board.flags += 1;
    } else {
      if (!$square.hasClass("revealed")) {
        $square.addClass("flagged");
        board.flags -= 1;
      }
    }
  },
  preventRightClickMenu: function() {
    //Prevent context menu from popping up when right clicking the game board
    $(".board").on("contextmenu", function(e) {
      e.preventDefault();
    }, false);
  },
}; //end board

var game = {
  //Game AI
  lose: false,
  win: false,
  size: 10,
  time: 0,
  timer: "default",
  init: function(size) {
    game.size = size;
    game.time = 0;
    board.init(game.size);
    game.pageText();
    game.lose = false;
    game.win = false;
    game.clickSquare();
    clearInterval(game.timer);
    game.startTimer();
    $(".gameover-container").toggleClass("hidden");
  },
  pageText: function() {
    // Update game text fields
    $(".flag-count").text(board.flags);
    $(".time").text(game.time);
    $(".gameover-text h2").text("");
    $("#play-again-btn").hide();
  },
  clickSquare: function() {
    // Gets click event and ...
    $(".board-square").mousedown(function() {
      var $square = $(this);
      if (!game.lose && !game.win) {
        switch (event.which) {
          case 1:
            if ($square.hasClass("revealed")) {
              board.quickClear($square);
            } else {
              board.revealSquare($square);
            }
            game.checkLoss();
            game.checkWin();
            break;
          case 3:
            board.addOrRemoveFlag($square);
            $(".flag-count").text(board.flags);
            game.checkWin();
            break;
          default:
            return;
        }
        game.gameoverScreen();
      }
    });
  },
  checkLoss: function() {//checks if user won
    if ($(".mine").length > 0) {
      game.lose = true;
      revealMines();
      updateStats();
    }
  },
  checkWin: function() {//checks if user lost
    var win = true;
    $(".board-square").each(function() {
      if (($(this).text() != "M" && !$(this).hasClass("revealed")) ||
        ($(this).text() === "M" && !$(this).hasClass("flagged"))) {
        win = false;
        return false;
      }
    });
    if (win) {//executes if the user 
      game.win = true;
      updateStats();
    }
  },
  //setting the screen when the game has finished
  gameoverScreen: function() {
    if (game.win) {
      $(".gameover-container").toggleClass("hidden");
      $(".gameover-text h2").text("You win!");
      $("#play-again-btn").show();
      game.playAgain();
    } else if (game.lose) {
      $(".gameover-container").toggleClass("hidden");
      $(".gameover-text h2").text("You lose!");
      $("#play-again-btn").show();
      game.playAgain();
    }
  },
  //executes when the playagain button is clicked
  playAgain: function() {
    $("#play-again-btn").on("click", function() {
      game.init(game.size);
    });
  },
  //function to control the timer
  startTimer: function() {
    game.timer = setTimeout(function() {
      if (!game.win && !game.lose) {
        game.time += 1;
        $(".time").text(game.time);
      } else {
        clearInterval(game.timer);
      }
      game.startTimer();
    }, 1000);
  },
}; //end game

var gameOptions = {
  // Method that handles the top buttons and submenu of the game. 
  // 
  init: function() {
    this.boardSizeDropdown();
    this.chooseBoardSize();
    this.newGame();
  },
  //executes when the boardsize button is clicked 
  boardSizeDropdown: function() {
    $("#board-size-btn").on("click", function() {
      $(".board-size-dropdown").toggleClass("show-dropdown");
    });

    $(document).mouseup(function(e) {
      var $dropdown = $(".board-size-dropdown");
      if (!$dropdown.is(e.target) && !$("#board-size-btn").is(e.target) &&
        $dropdown.has(e.target).length === 0) {
        $dropdown.removeClass("show-dropdown");
      }
    });
  },
  chooseBoardSize: function() {
    $(".board-size-type").on("click", function() {
      console.log($(this).text());
      switch ($(this).text()) {
        case "Tiny":
          game.init(5);
          break;
        case "Small":
          game.init(10);
          break;
        case "Medium":
          game.init(15);
          break;
        case "Large":
          game.init(23);
          break;
        case "Enormous":
          game.init(35);
          break;
        default:
          return;
      }
      $(".board-size-type").removeClass("current-board-size");
      $(this).addClass("current-board-size");
      $(".board-size-dropdown").removeClass("show-dropdown");
    });
  },
  //executes when the new game button is clicked
  newGame: function() {
    $("#new-game-btn").on("click", function() {
      game.init(game.size);
    });
  },
}; //end game options