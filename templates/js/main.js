
      var ROOT = 'https://quizzles-1235.appspot.com/_ah/api';

      var urlsafeQuestionKey = "";
      var urlsafeMatchKey = "";
      var round = 0;
      var user_name = "";

      function setUrlsafeMatchKey(event) {
        urlsafeMatchKey = $(this).siblings(".urlsafe-key").text();
        round = parseInt($(this).text());
      }

      function getQuestion(event) {
        var request = gapi.client.questions.get_question({
          'urlsafe_match_key': urlsafeMatchKey
        });
        request.then(function(response) {
          urlsafeQuestionKey = response.result.urlsafe_key;

          $('.question-answer').remove();

          var questionSection = $("#questions");
          var questionAnswer = $("<div>", {class: "question-answer"});
          questionAnswer.append($("<div>", {class: "question"}).text(response.result.question));

          var answers = $("<div>", {class: "answers"});
          $.each(response.result.answers, function(index, item) {
            answers.append($("<div>", {class: "answer"}).text(item));
          });
          questionAnswer.append(answers);
          questionSection.append(questionAnswer);
          console.log(questionSection);

        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }

      function getUserGames(event) {
        // get_user_games
        var request = gapi.client.questions.get_user_games({
          'user_name': user_name,
          'page': 0
        });

        request.then(function(response) {
          $('#games-tbl').remove();
          var json = response.result.games;

          var games = $("#games");
          var table = $("<div>", {id: "games-tbl", class: "tbl"});

          // Create the table head and add to table
          var head = $("<div>", {class: "tbl-head"});
          head.append($("<div>", {class: "tbl-cell"}).text("Creator"));
          head.append($("<div>", {class: "tbl-cell"}).text("Title"));
          head.append($("<div>", {class: "tbl-cell"}).text("Rounds"));
          head.append($("<div>", {class: "tbl-cell"}).text("Playmode?"));
          head.append($("<div>", {class: "tbl-cell"}).text("urlsafe_key"));
          table.append(head);

          $.each(json, function(index, item) {
            // Create table rows
            var row = $("<div>", {class: "tbl-row"});
            row.append($("<div>", {class: "tbl-cell creator"}).text(item.creator));
            row.append($("<div>", {class: "tbl-cell title"}).text(item.title));
            row.append($("<div>", {class: "tbl-cell rounds link-cell"}).text(item.rounds));
            row.append($("<div>", {class: "tbl-cell play-mode link-cell"}).text(item.play_mode));
            row.append($("<div>", {class: "tbl-cell urlsafe-key link-cell"}).text(item.urlsafe_key));
            table.append(row)
          });

          games.append(table);
        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }

      function setUserName() {
        user_name = $(this).text();
      }

      function getPlayerProfile(event) {
        // get_player_profile
        var request = gapi.client.questions.get_player_profile({
          'user_name': user_name
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
          window.alert(reason.result.error.message);
        });
      }

      function setPlaymode(event) {
        var userName = $(this).siblings(".creator").text();
        var urlsafeGameKey = $(this).siblings(".urlsafe-key").text();

        console.log(urlsafeGameKey);
        console.log(userName);

        var request = gapi.client.questions.set_playmode({
          'user_name': userName,
          'urlsafe_key': urlsafeGameKey,
          'start_game': true
        });
        request.then(function(response) {
          window.alert(response.result.message);
          getUserGames();
        }, function(reason) {
          window.alert(reason.result.error.message)
        });
      }

      function fillMatchForm(event) {
        urlsafeKey = $(this).siblings(".urlsafe-key").text()
        console.log(urlsafeKey);
        $("#create-match-form :input#urlsafe-key").val(urlsafeKey);
      }

      function getUserMatches(event) {
        // get_user_matches
        var request = gapi.client.questions.get_user_matches({
          'user_name': user_name,
          'page': 0
        });

        request.then(function(response) {
          $('#matches-tbl').remove();
          var json = response.result.matches;

          var matches = $("#matches")
          var table = $("<div>", {id: "matches-tbl", class: "tbl"});

          // Create the table head and add to table
          var head = $("<div>", {class: "tbl-head"});
          head.append($("<div>", {class: "tbl-cell"}).text("Current round"));
          head.append($("<div>", {class: "tbl-cell"}).text("Total rounds"));
          head.append($("<div>", {class: "tbl-cell"}).text("Score"));
          head.append($("<div>", {class: "tbl-cell"}).text("Match over?"));
          head.append($("<div>", {class: "tbl-cell"}).text("urlsafe_key"));
          table.append(head);

          $.each(json, function(index, item) {
            // Create table rows
            var row = $("<div>", {class: "tbl-row"});
            row.append($("<div>", {class: "tbl-cell current-round link-cell"}).text(item.current_round));
            row.append($("<div>", {class: "tbl-cell total-rounds"}).text(item.total_rounds));
            row.append($("<div>", {class: "tbl-cell score"}).text(item.score));
            row.append($("<div>", {class: "tbl-cell match-over"}).text(item.match_over));
            row.append($("<div>", {class: "tbl-cell urlsafe-key"}).text(item.urlsafe_key));
            table.append(row)
          });
          matches.append(table);
        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }

      function submitAnswer(event) {
        var answer = $(this).text();
        console.log(answer);

        // submit_answer
        var request = gapi.client.questions.submit_answer ({
          'user_name': user_name,
          'answer': answer,
          'urlsafe_question_key': urlsafeQuestionKey,
          'urlsafe_match_key': urlsafeMatchKey,
          'round': round
        });
        request.then(function(response) {
          console.log(response);
          $('.question-answer').children().remove();
          if (response.result.correct_answer == true) {
            $('#notification').text("Congratulations, that was the right answer!")
          } else {
            $('#notification').text("Sorry, that was the wrong answer :(")
          }
          getUserMatches();
          round += 1;
          getQuestion()
        },
        function(reason) {
          window.alert(reason.result.error.message);
        });

      }

      function getHighScores(event) {
        event.preventDefault();

        var page = $('#get-highscores-form :input#page').val()
        if (page == "") {
          page = 0
        }

        var request = gapi.client.questions.get_high_scores({
          'page': page,
        });

        request.then(function(response) {
          $('#players-tbl').remove();
          var table = $("<div>", {id: "players-tbl", class: "tbl"});

          // Create the table head and add to table
          var head = $("<div>", {class: "tbl-head"});
          head.append($("<div>", {class: "tbl-cell"}).text("Player"));
          head.append($("<div>", {class: "tbl-cell"}).text("Score"));
          head.append($("<div>", {class: "tbl-cell"}).text("Batting average"));
          table.append(head);

          var scores = response.result.scores
          // Create table rows
          for (i = 0; i < scores.length; i++) {
            var row = $("<div>", {class: "tbl-row"});
            row.append($("<div>", {class: "tbl-cell user-name link-cell"}).text(scores[i].user_name));
            row.append($("<div>", {class: "tbl-cell score"}).text(scores[i].score));
            row.append($("<div>", {class: "tbl-cell batting_avg"}).text(scores[i].batting_avg));
            table.append(row)
          }
          $('#players').append(table);
        }, function(reason) {
             window.alert(reason.result.error.message);
        });

      }

      function createPlayer(event) {
        event.preventDefault();

        var user_name = $('#create-player-form :input#user-name').val()
        var email_address = $('#create-player-form :input#email-address').val()

        console.log("Creating a player");
        var request = gapi.client.questions.create_player({
          'user_name': user_name,
          'email_address': email_address
        });

        request.then(function(response) {
          window.alert("Player successfully created.");
        }, function(reason) {
          window.alert('Error: ' + reason.result.error.message);
        });

      }

      function fillQuestionForm(event) {
        var urlsafeKey = $(this).text();
        $("#create-question-form :input#urlsafe-key").val(urlsafeKey);
      }

      function createQuestion(event) {
        event.preventDefault();

        var question = $("#create-question-form :input#question").val();
        var correctAnswer = $("#create-question-form :input#correct-answer").val();
        var urlsafeKey = $("#create-question-form :input#urlsafe-key").val();

        console.log(question, correctAnswer, urlsafeKey);

        var incorrectAnswers = []
        $.each(
          $("#create-question-form :input.incorrect-answers").serializeArray(),
          function (index, item) {
            console.log(item.value);
            incorrectAnswers.push(item.value);
          }
        );

        var request = gapi.client.questions.create_question({
          'question': question,
          'correct_answer': correctAnswer,
          'incorrect_answers': incorrectAnswers,
          'urlsafe_game_key': urlsafeKey
        });
        request.then(function(response) {
          window.alert("Question successfully created!");
          getUserGames();
        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }


     function createGame(event) {
        event.preventDefault();

        var userName = $("#create-game-form :input#user-name").val();
        var title = $("#create-game-form :input#title").val();

        console.log(userName);
        console.log(title);
        var request = gapi.client.questions.create_game({
          'user_name': userName,
          'title': title
        });
        request.then(function(response) {
          console.log(response)
          window.alert("Game successfully created.");
          getUserGames()
        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }

      function fillGameForm(event) {
        $("#create-game-form :input#user-name").val(user_name);
      }


      function createMatch(event) {
        event.preventDefault();

        var userName = $("#create-match-form :input#user-name").val();
        var urlsafeKey = $("#create-match-form :input#urlsafe-key").val();

        var request = gapi.client.questions.create_match({
          'user_name': userName,
          'urlsafe_game_key': urlsafeKey
        });
        request.then(function(response) {
          window.alert("Match successfully created.");
          getUserMatches()
        }, function(reason) {
          window.alert(reason.result.error.message);
        });
      }

      function bindEvents() {
        // Handlers for table of players
        $("#players").on("click tap", ".user-name", setUserName);
        $("#players").on("click tap", ".user-name", fillGameForm);
        $("#players").on("click tap", ".user-name", getPlayerProfile);
        $("#players").on("click tap", ".user-name", getUserGames);
        $("#players").on("click tap", ".user-name", getUserMatches);

        // Handlers for table of games
        $("#games").on("click tap", ".urlsafe-key", fillQuestionForm);
        $("#games").on("click tap", ".play-mode", setPlaymode);
        $("#games").on("click tap", ".rounds", fillMatchForm);

        // Handlers for table of matches
        $("#matches").on("click tap", ".current-round", setUrlsafeMatchKey);
        $("#matches").on("click tap", ".current-round", getQuestion);

        // Handlers for questions
        $("#questions").on("click tap", ".answer", submitAnswer);

        // Form submit handlers
        $("#get-highscores-form").on("submit", getHighScores);
        $("#create-player-form").on("submit", createPlayer);
        $("#create-question-form").on("submit", createQuestion);
        $("#create-match-form").on("submit", createMatch);
        $("#create-game-form").on("submit", createGame);

      }


      function affirmLoad() {
        console.log("Questions API successfully loaded.");
      }

