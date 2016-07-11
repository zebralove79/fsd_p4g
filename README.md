# Full Stack Nanodegree Project 4 Refresh - Quizzles

## Set-Up Instructions
1.  Update the value of application in app.yaml to the app ID you have registered
 in the App Engine admin console and would like to use to host your instance of this sample.
2.  Run the app with the devserver using dev_appserver.py DIR, and ensure it's
 running by visiting the API Explorer - by default localhost:8080/_ah/api/explorer.
3.  The app is rather complex. Feel free to explore the frontend. You will need to deploy the app to [your-app-id].appspot.com. Check out the playground at [your-app-id].appspot.com/playground to try out various aspects of the backend. Or try out the rudimentary frontend implementation [your-app-id].appspot.com.


## Description
Quizzles is a flash card / quiz game. You can register, create your own quizzes
(games) with your own questions. You can also play quizzes which you or others
have created (matches).
Two indicators are used to rank players. One, points (scores) are awarded for
every question answered correctly. Two, the ratio of correct answers given by
a player to the total number of questions they answered is known as the batting
average (avg).


### Instruction
For detailed instructions please check the manual (MANUAL.md).

## Files
 - api.py: Contains endpoints and game playing logic.
 - app.yaml: App configuration.
 - cron.yaml: Cronjob configuration.
 - main.py: Handler for taskqueue handler.
 - models.py: Entity and message definitions including helper methods.
 - utils.py: Helper functions




## Endpoints
 - **create_player**
    - Path: 'player/create_player'
    - Method: POST
    - Parameters: user_name, email_address
    - Returns: StringMessage -- confirmation of player creation
    - Raises: ConflictException -- if username or email address is taken already
    - Description: Creates a new player.
        This function creates a new player. It will also make sure
        that the chosen username is not yet taken.
        (NB: Currently this function does not implement any validity checks
        on the email address, such as a regex etc.)


 - **create_game**
    - Path: 'game/create_game'
    - Method: POST
    - Parameters: user_name, title
    - Returns: GameForm -- a GameForm representation of the created game
    - Description: Creates a new game.
        This function creates a new game.
        (NB: Games are just shells for questions.)


 - **create_match**
    - Path: 'game/{urlsafe_game_key}/create_match'
    - Method: POST
    - Parameters: urlsafe_game_key, user_name, start_game (optional)
    - Returns: MatchForm -- a MatchForm representation of the created match
    - Raises: BadRequestException -- raised when game has no questions or when
                                     game is not in play mode or when play mode
                                     enabling is required, but was not requested
    - Description: Creates a new match.
        This match allows players to create a new match. A match is an
        'instance' of a game. This allows multiple users to play the same
        game at the same time or different times.


 - **get_user_games**
    - Path: 'player/{user_name}/games'
    - Method: GET
    - Parameters: page, user_name
    - Returns: GamesForms - a list of games in GameForm representation
    - Description: Lists a player's games.
        This functions delivers a list of games by a specific player. It
        also allows pagination.
        (NB: Change QUERY_LIMIT to increase/decrease results per page)


 - **get_user_matches**
    - Path: 'player/{user_name}/matches'
    - Method: GET
    - Parameters: page, user_name
    - Returns: MatchForms -- a list of matches in MatchForm representation
    - Description: Lists a player's matches.
        This functions delivers a list of matches by a specific player. It
        also allows pagination.
        (NB: Change QUERY_LIMIT to increase/decrease results per page)


 - **get_high_scores**
    - Path: 'high_scores'
    - Method: GET
    - Parameters: page
    - Returns: ScoreForms -- a list of scores in ScoreForm representation
    - Description: Lists players' scores.
        This functions delivers a player list ordered by their scores. It
        also allows pagination.
        (NB: Change QUERY_LIMIT to increase/decrease results per page)


 - **cancel_match**
    - Path: 'match/{urlsafe_match_key}/cancel_match'
    - Method: DELETE
    - Parameters: urlsafe_match_key, user_name
    - Returns: StringMessage -- a confirmation of the match deletion
    - Raises: ForbiddenException -- raised if a player tries to delete another player's match or if the match does not exist
    - Description: Deletes a match.
        This function allows players to cancel their own (and only their own)
        matches. Cancelled matches are deleted and cannot be recovered.
        Only unfinished matches can be deleted.


 - **create_question**
    - Path: 'question/create_question'
    - Method: POST
    - Parameters: question, correct_answer, incorrect_answers, urlsafe_game_key
    - Returns: QuestionForm -- QuestionForm representation of the created question
    - Description: Allows players to create questions.
        This function allows players to create questions.


 - **add_question**
    - Path: 'game/{urlsafe_game_key}/add_question'
    - Method: POST
    - Parameters: urlsafe_game_key, urlsafe_question_key
    - Returns: StringMessage -- A confirmation that the question has been successfully added to a game
    - Description: Allows players to add questions to existing games.
        This function allows players to add already existing questions to
        existing games. This allows questions to be re-used across many games
        rather than belong to one game only.
        (NB: This does not create a new questions, just allows questions from
        one game to be used in another. To create new questions use the
        create_question endpoints method)


 - **set_playmode**
    - Path: 'game/{urlsafe_match_key}/set_playmode'
    - Method: POST
    - Parameters: urlsafe_game_key, user_name, start_game
    - Returns: StringMessage -- a confirmation that the play mode is enabled
    - Raises: ForbiddenException -- raised if player requesting play mode is not the game's creator or the game does not exist
    - Raises  BadRequestException -- raised when the user has not explicitly requested the game be put into play mode
    - Description: Set a game's play mode
        This function allows to put a game into play mode. Games in play mode
        allow the creation of matches which players can then play.
        (NB: Only game creators may put a game into play mode)


 - **get_match_history**
    - Path: 'match/{urlsafe_match_key}/history'
    - Method: GET
    - Parameters: urlsafe_match_key, user_name
    - Returns: MatchForm -- the match details including the history
    - Raises: ForbiddenException -- raised when an attempt is made to view another player's history
    - Description: Retrieves a game's history.
        This function allows players to see the history of their matches.
        Players are only allowed to view the history of their own matches;
        access to other player's history is not granted.


 - **get_question**
    - Path: 'match/{urlsafe_match_key}/get_question'
    - Method: GET
    - Parameters: urlsafe_match_key
    - Returns: QuestionForm -- a QuestionForm representation of the question
    - Raises: ForbiddenException -- raised if the match has finished, i.e. there are no more questions left in the match (and) thus cannot be retrieved from the datastore
    - Description: Retrieves a question.
        This function gets a question from the datastore and returns it
        as a QuestionForm representation. Specifically it gets and delivers
        the match's current round's question.


 - **get_player_profile**
    - Path: 'player/{user_name}/profile'
    - Method: GET
    - Parameters: user_name
    - Returns: ProfileForm -- the player's public profile as a ProfileForm
    - Description: Retrieves a player's profile.
        This function retrieves a player's profile.


 - **get_user_ranking**
    - Path: 'player/{user_name}/ranking'
    - Method: GET
    - Parameters: user_name
    - Returns: ScoreForm -- a player's ranking in ScoreForm representation
    - Description: Get a player's ranking.
        This function serves no real purpose and was just included to fullfil
        the Udacity course project requirements. This information is also
        included in a player's profile (see get_player_profile).


 - **get_user_score**
    - Path: 'player/{user_name}/score'
    - Method: GET
    - Parameters: user_name
    - Returns: ScoreForm -- a player's ranking in ScoreForm representation
    - Description: Get a player's score.
        This function serves no real purpose and was just included to fullfil
        the Udacity course project requirements. This information is also
        included in a player's profile (see get_player_profile).


 - **submit_answer**
    - Path: 'match/{urlsafe_match_key}/submit_answer'
    - Method: POST
    - Parameters: user_name, urlsafe_question_key, answer, urlsafe_match_key, round
    - Returns: AnswerMessage -- information about whether the player has answered the question correctly or incorrectly
    - Raises: ForbbidenException -- raised if the match to which the answer was submitted has finished already
    - Raises: BadRequestException -- raised if the player tried to submit an answer to a round which is not the match's current round
    - Description: Allows players to submit questions to answers
        This function allows players to submit answers to questions in a match.
        It will also make sure that the question being answered belongs to the
        current round. This counteracts the accidental submission of answers
        several times in a row.



## Models
 - **Game**
   - Stores a game (including its stats such as creator and questions)

 - **Match**
   - Stores a match. The match is a playable representation of a Game. It also includes the match history to be stored.

 - **Question**
    - Stores a question (including correct and incorrect answers).

 - **History**
   - Stores a question the player has answered in a match. It includes the answer the player has given and whether it was correct.

 - **Player**
   - Stores the player and all his stats.



## Forms
 - **GameForm**
    - Representation of a single Game.
 - **GameForms**
    - Multiple GameForms container.

 - **MatchForm**
    - Representation of a single Match.
 - **GameForms**
    - Multiple MatchForm container.

 - **QuestionForm**
    - Representation of a single Question.
 - **QuestionsForms**
    - Multiple QuestionsForms container.

 - **HistoryForm**
    - Representation of a single History entry.
 - **HistoryForms**
    - Multiple HistoryForms container.

 - **ScoreForm**
    - Representation a player's score and/or ranking
 - **ScoreForms**
    - Multiple ScoreForm container.

 - **ProfileForm**
    - Representation a player's profile

## Score Keeping
Scores are measured with two metrics: points and batting average.

### Points
100 points are awarded for every question answered correctly. However, they are not handed over to a player until he has finished the match. Until then, the points accrued are stored in the match. If a player cancels a match, the points are forfeit and not awarded.

### Batting average
The batting average is the ratio of questions answered correctly to total number of questions answered by the player. Unlike points this metric is transferred to the player directly. Player have thus a stake in every match they create and every question answered, rather than just being able to cancel a game and forget about it.

## Todos
 - Implement OAuth2
 - Pagination
 - CSS
 - Usability improvements
 - Sharing function
 - Leitner-like flash card system (?)
 - Different types of quizzles, e.g. images, equations, ... (?)

## Acknowledgments / Thanks
 - Thanks to Stack Overflow for providing a rather large, searchable plethora of answers on issues I had with Bootstrap and jQuery.
 - **Resources used (backend)**
    - Google App Engine / Cloud Computing API documentation
    - Google API Client Libraries API (Javascript BETA) documentation
    - Udacity forums
 - **Resources used (frontend)**
    - Boostrap and its documentation
    - jQuery and its documentation
    - JavaScript Cookie API and its documentation
    - Mustache and its documentation

