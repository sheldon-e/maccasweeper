var SESSION_KEY='ms_stats',
	LOCALKEY='ms_ls';

$(document).ready(function() {
  gameOptions.init();
  game.init(10);
});

var board = {
  board: [],
  size: 10,
  mineCount: 0,
  mineRatio: 0.2,
  flags: 0,
  init: function(size) {
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
    for (var i = 0; i < this.size; i++) {
      this.board.push([]);
      for (var j = 0; j < this.size; j++) {
        this.board[i].push("");
      }
    }
  },
  addMines: function() {
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
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return;
    return this.board[row][col] != "undefined" &&
           this.board[row][col] === "M";
  },
  renderBoard: function() {
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
      board.getSurroundingSquareCoords(row, col).forEach(function(coordinates) {
        board.showHint(coordinates[0], coordinates[1]);
      });
    } else {
      $square.find("p").show();
      $square.addClass("revealed");
    }
  },
  quickClear: function($square) {
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
    return [[row - 1, col - 1],
            [row - 1, col],
            [row - 1, col + 1],
            [row, col - 1],
            [row, col + 1],
            [row + 1, col - 1],
            [row + 1, col],
            [row + 1, col + 1]].filter(function(coordinates) {
              return coordinates[0] >= 0 && coordinates[0] < board.size &&
                     coordinates[1] >= 0 && coordinates[1] < board.size;
            });
  },
  getSurroundingSquares: function(row, col) {
    return board.getSurroundingSquareCoords(row, col)
                .map(function(coords) {
                  return $(".board-square[data-row='" + coords[0] + 
                           "'][data-col='" + coords[1] + "']");
                });
  },
  showHint: function(row, col) {
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
    if ($square.hasClass("flagged")) {
      $square.removeClass("flagged");
      board.flags += 1;
    } else {
      if (!$square.hasClass("revealed")) $square.addClass("flagged");
      board.flags -= 1;
    }
  },
  preventRightClickMenu: function() {
    $(".board").on("contextmenu", function(e) {
      e.preventDefault();
    }, false);
  },
};

var game = {
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
  },
  pageText: function() {
    $(".flag-count").text(board.flags);
    $(".time").text(game.time);
    $(".gameover-text h2").text("");
    $("#play-again-btn").hide();
  },
  clickSquare: function() {
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
  checkLoss: function() {
    if ($(".mine").length > 0) game.lose = true;
  },
  checkWin: function() {
    var win = true;
    $(".board-square").each(function() {
      if (($(this).text() != "M" && !$(this).hasClass("revealed")) ||
         ($(this).text() === "M" && !$(this).hasClass("flagged"))) {
        win = false;
        return false;
      }
    });
    if (win) game.win = true;
  },
  gameoverScreen: function() {
    if (game.win) {
      $(".gameover-text h2").text("You win!");
      $("#play-again-btn").show();
      game.playAgain();
    } else if (game.lose) {
      $(".gameover-text h2").text("You lose!");
      $("#play-again-btn").show();
      game.playAgain();
    }
  },
  playAgain: function() {
    $("#play-again-btn").on("click", function() {
      game.init(game.size);
    });
  },
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
};

var gameOptions = {
  init: function() {
    this.boardSizeDropdown();
    this.chooseBoardSize();
    this.newGame();
  },
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
      switch($(this).text()) {
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
  newGame: function() {
    $("#new-game-btn").on("click", function() {
      game.init(game.size);
    });
  },
};
