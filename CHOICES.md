# Design Choices
A lot of smaller decisions had to be made in the course of this project. However, some rather major design choices were also made. I will outline the choices which have had a major impact.

# Game and match system
I made the decision to allow multiple players to play the same game. I use the term match to describe a playable instance of a game. Every match has only one player, but a game can have many matches. This has quite a few advantages:

 - allows for match-specific (and therefor player-specific) history, scores, round counters etc.
 - ability to check for open matches to send reminders via cronjob easily
 - scores are only awarded for matches which are finished, cancelling a game won't net you any points
 - any game (in play mode) is open to be played in a match, this allows for sharing of games (multiplayer)
 - matches automatically scramble the questions, so that the question order in match is not the same as in a game

# Scoring system
The scoring system is currently very rudimentary, but gets the idea across. Get an answer right and you are awarded 100 points. Get it wrong and you get 0 points. These scores are only awarded to your player profile once the match is over.

There is a secondary ranking system: batting average. This is the ratio of correctly answered questions to total number of questions answered. If you have 0 total questions, the batting average is 0 to avoid division-by-zero problems.

This latter system is not match dependent, ie. this metric is updated every time you answer a question. Why the difference to the score points? There should be some stake in creating matches and answering questions. If you could always just cancel a match when it's not going well, it would make it a bit too easy for players.

# Game and question system
Quizzles isn't just a game with ready-made questions and answers. Players can create their own games with their own questions and their own answers. To me that was a vital design choice, I want players to have that freedom.

However, it was also very time consuming. Very time consuming because it meant for example a rethinking of question-game-match decisions. For example a Question and Match classes had to be designed and implemented. In the end>, a new class Question which stores a question, a correct answer and infinitely many incorrect answers.