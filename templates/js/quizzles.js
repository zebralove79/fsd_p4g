      // Todo: use templating engine
      // Todo: pagination (frontend)

      // set ROOT for API
      var ROOT = 'https://quizzles-1235.appspot.com/_ah/api';


      /**
       * This function is executed once the Google API client has loaded.
       * It will also do some necessary function calls depending on the
       * page name the user is currently on.
       */
      function startUp() {
        console.log("Questions API successfully loaded.");
        console.log("Location: " + window.location.pathname)

        if (window.location.pathname == "/profile") {
          getPlayerProfile();
        }
        if (window.location.pathname == "/games") {
          getUserGames();
        }
        if (window.location.pathname == "/matches") {
          getUserMatches();
        }
        if (window.location.pathname == "/scores") {
          getHighScores();
        }

        bindEvents();
      }


      /**
       * Binds click and submit events.
       * Event delegation is used where necessary
       */
      function bindEvents() {
        // Click event handlers
        $("#question").on("click", ".answer", submitAnswer);
        $("#match-teasers").on("click", ".match-teaser.playable", getQuestion);
        $("#game-teasers").on("click", ".game-teaser", getGameOptions);

        // Form submit handlers
        $("#login-form").on("submit", login);
        $("#create-game-form").on("submit", createGame);
        $("#create-player-form").on("submit", createPlayer);
        $("#create-question-form").on("submit", createQuestion);
        $('#set-playmode-form').on("submit", setPlaymode)
      }


      /**
       * Creates a match if a game has been put into play mode.
       * If the game is still in editing mode, opens an overlay
       * which allows the player to add questions to the selected
       * game or to put the game into play mode.
       */
      function getGameOptions() {
        // Todo: only show playmode option in modal when questions have been added

        /**
         * This function will create a match based on a game. The
         * game has to be specified by its urlsafe key.
         * @param  String   urlsafeKey  a game's urlsafe key
         */
        function createMatch(urlsafeKey) {
          // create_match
          var userName = Cookies.get('userName');

          var request = gapi.client.questions.create_match({
            'user_name': userName,
            'urlsafe_game_key': urlsafeKey
          });

          request.then(function(response) {
            createNotification("alert-success", "Match successfully created.");
            getUserMatches();
          }, function(reason) {
            createNotification("alert-danger", reason.result.error.message);
          });
        }

        that = $(this);
        if (that.hasClass("playable")) {
          if (confirm("Do you want to start a new match?") == false) {
            return 0;
          }
          urlsafeKey = $(".urlsafe-key", that).text();
          createMatch(urlsafeKey);
        } else {
          $("#game-modal-title").text($(".title", that).text());
          $("#game-modal-urlsafe-key").val($(".urlsafe-key", that).text());
          $("#game-modal-playmode-urlsafe-key").val($(".urlsafe-key", that).text());

          $("#game-modal").modal("show");
        }
      }


      /**
       * Retrieves a page of games the player has created.
       * Pagination is currently not implemented.
       * NB: the number of entries (limit) can be set in the backend.
       */
      function getUserGames() {
        // get_user_games
        // Todo: pagination

        var userName = Cookies.get("userName");

        var request = gapi.client.questions.get_user_games({
          'user_name': userName,
          'page': 0
        });

        request.then(function(response) {
          // Remove existing game teasers
          $(".game-teaser-box").remove();

          // Render new match-teasers
          var teasers = $("#game-teasers");
          $.get("/staches/game-teaser.mst", function(template) {
            Mustache.parse(template);

            var output = Mustache.render(template, response.result);
            teasers.append(output);
          });

        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Retrieves a page of matches the player has created.
       * Pagination is currently not implemented.
       * NB: the number of entries (limit) can be set in the backend.
       */
      function getUserMatches() {
        // get_user_matches
        var userName = Cookies.get("userName");

        // Todo: Pagination
        var request = gapi.client.questions.get_user_matches({
          'user_name': userName,
          'page': 0
        });

        request.then(function(response) {
          // Remove existing match teasers
          $(".match-teaser-box").remove();

          // Render new match-teasers
          var teasers = $("#match-teasers");
          $.get("/staches/match-teaser.mst", function(template) {
            Mustache.parse(template);

            var output = Mustache.render(template, response.result);
            teasers.append(output);
          });

        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Retrieves the logged-in player's profile
       */
      function getPlayerProfile() {
        // get_player_profile
        var userName = Cookies.get("userName");

        var request = gapi.client.questions.get_player_profile({
          'user_name': userName
        });
        request.then(function(response) {
          $('#profile ul').remove()
          console.log(response);
          var ul = $('<ul>').appendTo('#profile');
          var json = response.result;
          $.each(response.result, function(index, item) {
            ul.append($(document.createElement('li')).text(index + ": " + item));
          });
        }, function(reason) {
          console.log(reason);
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Retrieves a page of players sorted by points. Batting average
       * is also retrieved.
       * Pagination is currently not implemented.
       * NB: the number of entries (limit) can be set in the backend.
       */
      function getHighScores() {
        // get_high_scores
        // Todo: pagination

        var request = gapi.client.questions.get_high_scores({
          'page': 0,
        });

        request.then(function(response) {
          // Remove previous high scores table
          $("#players-tbl").remove();

          // Render new high scores table
          var scores = $("#scores");
          $.get('/staches/scores.mst', function(template) {
            Mustache.parse(template);
            console.log(template);

            var output = Mustache.render(template, response.result);
            scores.append(output);
          });

        }, function(reason) {
            createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Creates a new player.
       */
      function createPlayer() {
        // create_player
        event.preventDefault();

        // Grab data from form
        var user_name = $('#create-player-form :input#user-name').val()
        var email_address = $('#create-player-form :input#email-address').val()

        // Create player
        var request = gapi.client.questions.create_player({
          'user_name': user_name,
          'email_address': email_address
        });

        request.then(function(response) {
          createNotification("alert-success", "Player successfully created.");
        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });

      }


      /**
       * Creates a question.
       */
      function createQuestion() {
        event.preventDefault();

        console.log("QUESTION FORM");

        var question = $("#create-question-form :input#question").val();
        var correctAnswer = $("#create-question-form :input#correct-answer").val();
        var urlsafeKey = $("#create-question-form :input#game-modal-urlsafe-key").val();

        console.log(question, correctAnswer, urlsafeKey);

        var incorrectAnswers = []
        $.each(
          $("#create-question-form :input.incorrect-answer").serializeArray(),
          function (index, item) {
            console.log(item.value);
            incorrectAnswers.push(item.value);
          }
        );

        console.log("Wrong answers: " + incorrectAnswers);
        var request = gapi.client.questions.create_question({
          'question': question,
          'correct_answer': correctAnswer,
          'incorrect_answers': incorrectAnswers,
          'urlsafe_game_key': urlsafeKey
        });
        request.then(function(response) {
          $("#create-question-form")[0].reset();
          $("#game-modal").modal("hide");
          getUserGames();
          createNotification("alert-success", "Question successfully created!");
        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Creates a game.
       */
      function createGame() {
        event.preventDefault();

        var title = $("#create-game-form :input#game-title").val();
        var userName = Cookies.get("userName");

        console.log(userName);
        console.log(title);
        var request = gapi.client.questions.create_game({
          'user_name': userName,
          'title': title
        });
        request.then(function(response) {
          console.log(response)
          createNotification("alert-success", "Game successfully created.");
          getUserGames()
        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Posts an answer to the backend.
       */
      function submitAnswer() {
        var answer = $(this).text();
        var userName = Cookies.get("userName");

        console.log("Answer chosen: " + answer);
        var request = gapi.client.questions.submit_answer({
          'user_name': userName,
          'answer': answer,
          'urlsafe_question_key': urlsafeQuestionKey,
          'urlsafe_match_key': urlsafeMatchKey,
          'round': round
        });

        request.then(function(response) {
          console.log(response);
          if (response.result.correct_answer == true) {
            createNotification("alert-success", "Well done, that's the correct answer.");
          } else {
            createNotification("alert-danger", "Sorry, that was the wrong answer.");
          }

          // Reload the player's matches
          // which queries a lot of matches that don't need updating
          // Todo: find better solution to update a single match
          getUserMatches();
        }, function(reason) {
          createNotification("alert-danger", "An error has occurred");
        });

        $("#question").modal("hide");
      }


      /**
       * This function loads the current rounds question from a match
       * and displays the answers to the player in a Bootstrap modal.
       */
      function getQuestion() {
        // Todo: This function needs to be updated to include templates
        var that = $(this);

        // Set the urlsafeMatchKey
        urlsafeMatchKey = that.children(".urlsafe-key").text();

        // Set the round
        round = that.find("span.current-round").text();

        var request = gapi.client.questions.get_question({
          'urlsafe_match_key': urlsafeMatchKey
        });

        request.then(function(response) {
          // Set the urlsafeQuestionKey
          urlsafeQuestionKey = response.result.urlsafe_key;

          $("#question-title").text(response.result.question);

          $('.answers').remove();
          var answers = $("<div>", {class: "answers"});
          $.each(response.result.answers, function(index, item) {
            answer = $("<div>", {class: "answer col-xs-12 col-md-3"});
            answer.append($("<p>", {class: "answer-content"}).text(item));
            answers.append(answer);
          });

          $("#question-body").append(answers);
          $("#question").modal("show");

        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Sets a game's mode to play.
       */
      function setPlaymode() {
        // set_playmode
        event.preventDefault();
        that = $(this);

        if (confirm("Are you sure, you want to put this game into play mode. You will not be able to add any more questions once play mode is enabled.") == false) {
          return 0;
        }

        var urlsafeGameKey = $(".urlsafe-key", that).val();
        var userName = Cookies.get('userName');

        var request = gapi.client.questions.set_playmode({
          'user_name': userName,
          'urlsafe_key': urlsafeGameKey,
          'start_game': true
        });
        request.then(function(response) {
          createNotification("alert-success", response.result.message);
          $("#game-modal").modal("hide");
          getUserGames();
        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Very basic (!) "login" functionality. It takes a username and
       * checks if they exist in the database. If the user exists,
       * it creates a cookie with the username for future use.
       * NB: The cookie expires as soon as the browser window is closed.
       */
      function login() {
        event.preventDefault();

        // Login the player
        var userName = $('#login-form :input#user-name').val();

        var request = gapi.client.questions.get_player_profile({
          'user_name': userName
        });

        request.then(function(response) {
          Cookies.set('userName', userName);
          user_name = userName;
          // TODO
          window.location = "/"
        }, function(reason) {
          createNotification("alert-danger", reason.result.error.message);
        });
      }


      /**
       * Creates a notification.
       * @param  String   type      the boostrap type of notification you want
       * @param  String   message   the message the notification is to contain
       */
      function createNotification(type, message) {
        alert = $("<div>", {class: "alert alert-dismissible " + type, role: "alert"});
        button = $("<button>", {type: "button", class: "close", "data-dismiss": "alert", "aria-label": "Close"});
        span = $("<span>", {"aria-hidden": "true"}).html("&times;");

        button.append(span);
        alert.text(message)
        alert.prepend(button);

        $("#notification").append(alert);
        alert.delay(2000).fadeOut(1000);
      }
