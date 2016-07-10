# Quizzles manual

Due to the structure of quizzles and its complexities within Google app engine, this how-to was created to help you understand how it works and to help you set up your first game and play it.

It is highly recommended that you keep a notepad or - ideally - some copypasta tool ready. Believe me, it'll make your life easier. You can also access a lot of the information you need through [your-app-id].appspot.com/playground which makes finding out urlsafe keys etc. a lot easier.

I will explain parameters you are required to supply only where not self-explanatory.

## Create player
First, you will need to create a new player. Use the create_player endpoint method to do so. Please note down the user_name because you will need it later.

## Create game
Use the create_game endpoint method to create a new game. You will have to provide a user_name as every game needs a creator (player). You should note down the urlsafe key of the newly created game. You can also use ([your-app-id].appspot.com/playground) and give the user_name for quick access to all the keys of the games the player has created.

## Create question
Currently your game is empty. It only knows its creator and its name (title). You will need to add at least one question to the game so it can be played. Use the create_question endpoints method. You will need the information you noted down during the previous steps. You have to supply only one correct answer, but you can give as many incorrect answers as you like. I recommend providing three incorrect answers for a total of four.

You need a minimum of one question in a game, but you can repeat this step as many times as you want if you want more questions on your game.

## Create match
Games are just shells. They have a creator, a set of questions if they have been created etc. To play, a match has to be created. This allows multiple players to play a game with individual score keeping, individual answer histories, the question which needs answering next and so on. Matches contain redundancy. The questions (keys) of the game are copied over so the game entity for not have to be queried quite as frequently. Question order is also randomised in a match.

Create a match with the create_match endpoints method. You will need a urlsafe key for a game and the user_name. As usual you will want to note down the urlsafe key of the created match.

You are now ready to play...

## Get question
You may want to know which question you have to answer next. Use the get_question endpoints method to query a match's current questions. You will need the urlsafe key of the match. Use it and note down the question urlsafe key. You may want to answer it in the next step.

## Submit answer
With the question's urlsafe key, the user name and the match's urlsafe key you can now answer the first question of the match you have created. You will also need to know the round the match is currently on; since you have just created a match in the steps above, the first round is indexed 0. Use the submit_answer endpoints method to submit your answer. Did you get the answer right?

**Congratulations! You are now playing your first match of quizzles.**