""" models.py - This file contains the class definitions for the Datastore
entities used by the Game. """

# Import utils modules
from utils import logger

import random
from protorpc import messages
from google.appengine.ext import ndb
from random import shuffle


# ================ Model definitions ================
# ================ Question ================
class Question(ndb.Model):
    """ This class represents a question and its respective answers
        question:           question being asked
        correct_answer:     correct answer to the question
        incorrect_answers:  incorrect answers to the question (multiple)
    """
    question                = ndb.StringProperty(required=True)
    correct_answer          = ndb.StringProperty(required=True)
    incorrect_answers       = ndb.StringProperty(repeated=True)

    def __repr__(self):
        return "Question(%r, %r, %r)" % (self.question,
                                         self.correct_answer,
                                         self.incorrect_answers)

    def to_form(self):
        """ Returns a QuestionForm representation of the Question """
        form = QuestionForm()
        form.urlsafe_key = self.key.urlsafe()
        form.question = self.question

        # Randomise the order of the answers
        answers = list()
        answers = self.incorrect_answers
        answers.append(self.correct_answer)
        shuffle(answers)
        form.answers = answers

        return form


class QuestionForm(messages.Message):
    """ The QuestionForm representation of a Question """
    urlsafe_key = messages.StringField(1, required=True)
    question    = messages.StringField(2, required=True)
    answers     = messages.StringField(3, repeated=True)


class QuestionForms(messages.Message):
    """ A collection of QuestionForm representations
        (currently unused, included for completeness)
        """
    games = messages.MessageField(QuestionForm, 1, repeated=True)


# ================ Game ================
class Game(ndb.Model):
    """ This class represents a game
        title:          the title of the game
        creator:        the player who created the game
        questions:      the questions belonging to the game
        play_mode:      indicates whether the game can be player or edited
    """
    title            = ndb.StringProperty(required=True)
    creator          = ndb.KeyProperty(required=True)
    questions        = ndb.KeyProperty(repeated=True, kind='Question')

    # play_mode=True indicates the game can be played.
    # New questions cannot be added to a game in play mode anymore.
    play_mode         = ndb.BooleanProperty(required=True, default=False)

    def __repr__(self):
        return "Game(%r, %r)" % (self.questions,
                                 self.play_mode)

    @classmethod
    def create_game(cls, player, title):
        ''' Creates and returns a new game '''
        game = Game(creator=player,
                    parent=player,
                    title=title)
        game.put()

        return game

    def to_form(self):
        """ Returns a GameForm representation of the Game """
        form = GameForm()
        form.urlsafe_key = self.key.urlsafe()
        form.title = self.title
        form.creator = self.creator.get().user_name
        form.play_mode = self.play_mode
        form.rounds = len(self.questions)

        return form


class GameForm(messages.Message):
    """ The GameForm representation of a Game """
    urlsafe_key     = messages.StringField(1, required=True)
    title           = messages.StringField(2, required=True)
    creator         = messages.StringField(3, required=True)
    play_mode       = messages.BooleanField(4, required=True)
    rounds          = messages.IntegerField(5, required=True)


class GameForms(messages.Message):
    """ A collection of GameForm game representations """
    games = messages.MessageField(GameForm, 1, repeated=True)


# ================ History ================
class History(ndb.Model):
    """ This class represents a game's history
        question:       the question urlsafe key
        correct_answer: indicates whether the the question answered correctly
        answer:         the answer provided by the user
    """
    question        = ndb.StringProperty(required=True)
    correct_answer  = ndb.BooleanProperty(required=True)
    answer          = ndb.StringProperty(required=True)

    def to_form(self):
        """ Returns a HistoryForm representation of the History """
        form = HistoryForm()
        form.question = self.question
        form.correct_answer = self.correct_answer
        form.answer = self.answer

        return form


class HistoryForm(messages.Message):
    """ The HistoryForm representation of a History """
    question        = messages.StringField(1, required=True)
    correct_answer  = messages.BooleanField(2, required=True)
    answer          = messages.StringField(3, required=True)


class HistoryForms(messages.Message):
    """ A collection of HistoryForm history representations
        (currently unused, included for completeness)
        """
    history         = messages.MessageField(HistoryForm, 1, repeated=True)


# ================ Match ================
class Match(ndb.Model):
    """ This class represents a match
        player:         the player creating the match
        questions:      the game's questions transferred to the match,
                        randomised order
        current_round:  the match's current round (zero-indexed)
        match_over:     indicates whether the match has finished
        history:        a history of the player's answers
        score:          the score the player has accumulated in the match

    Scores are match-bound and not transferred over to the player until a match
    is over. This should encourage the player to finish games and not to
    abandon or cancel them.
    """
    player          = ndb.KeyProperty(required=True, kind='Player')
    questions       = ndb.KeyProperty(repeated=True)
    current_round   = ndb.IntegerProperty(default=0)
    match_over      = ndb.BooleanProperty(default=False)
    history         = ndb.StructuredProperty(History, repeated=True)
    score           = ndb.IntegerProperty(default=0)

    @classmethod
    def create_match(cls, player, game):
        ''' Creates a match based on a game '''
        # Randomise question order
        shuffle(game.questions)

        match = Match(player=player,
                      questions=game.questions,
                      parent=player)
        match.put()

        return match

    def to_form(self, history=False):
        """ Returns a MatchForm representation of the Match """
        form = MatchForm()
        form.urlsafe_key = self.key.urlsafe()
        form.current_round = self.current_round
        form.total_rounds = len(self.questions)
        form.match_over = self.match_over
        form.score = self.score

        if history:
            form.history = [entry.to_form() for entry in self.history]

        return form


class MatchForm(messages.Message):
    """ The MatchForm representation of a Match """
    urlsafe_key     = messages.StringField(1, required=True)
    current_round   = messages.IntegerField(2, required=True)
    total_rounds    = messages.IntegerField(3, required=True)
    match_over      = messages.BooleanField(4, required=True)
    score           = messages.IntegerField(5, required=True)
    history         = messages.MessageField(HistoryForm, 6, repeated=True)


class MatchForms(messages.Message):
    """ A collection of MatchForm match representations """
    matches = messages.MessageField(MatchForm, 1, repeated=True)


class ScoreForm(messages.Message):
    """ The ScoreForm representation of a player score/ranking """
    user_name   = messages.StringField(1, required=True)
    score       = messages.IntegerField(2)
    batting_avg = messages.FloatField(3)


class ScoreForms(messages.Message):
    """ A collection of ScoreForm score/ranking representations """
    scores = messages.MessageField(ScoreForm, 1, repeated=True)


# ================ Player ================
class Player(ndb.Model):
    """ This class represents a player
        user_name:          the player's user name
        email_address:      the player's email address
        score:              the players achieved life-time score
        correct_answers:    number of correct answers given by the player
        total_questions:    number of questions answered by the player
        batting_avg:        ratio of questions to correctly answered questions
    """
    user_name       = ndb.StringProperty(required=True)
    email_address   = ndb.StringProperty(required=True)
    score           = ndb.IntegerProperty(default=0)
    correct_answers = ndb.IntegerProperty(default=0)
    total_questions = ndb.IntegerProperty(default=0)
    batting_avg     = ndb.ComputedProperty(lambda self:
                                           Player.compute_batting_avg(self))

    def __repr__(self):
        return "Player(%r, %r, %r, %r)" % (self.user_name,
                                           self.email_address,
                                           self.batting_avg,
                                           self.score)

    def compute_batting_avg(self):
        """ Compute player performance

        This function calculates and returns the ratio of the player's
        correctly answered questions to total number of questions answered.

        Returns:
            float -- ratio of correct answers to total number of questions
        """
        if self.total_questions == 0 or self.total_questions is None:
            batting_avg = float(0)
        else:
            batting_avg = self.correct_answers/float(self.total_questions)

        return batting_avg

    def to_profileform(self):
        """ Returns a Profile representation of the Player """
        form                    = ProfileForm()
        form.user_name          = self.user_name
        # form.email_address = self.email_address
        form.score              = self.score
        form.batting_avg        = self.batting_avg
        form.correct_answers    = self.correct_answers
        form.total_questions    = self.total_questions

        return form

    def to_scoreform(self):
        """ Returns a ScoreForm representation of the Player score/ranking """
        form = ScoreForm()
        form.user_name = self.user_name
        form.score = self.score
        form.batting_avg = self.batting_avg

        return form


class ProfileForm(messages.Message):
    """ The ProfileForm representation of a Player """
    user_name       = messages.StringField(1, required=True)
    score           = messages.IntegerField(2, required=True)
    batting_avg     = messages.FloatField(3, required=True)
    correct_answers = messages.IntegerField(4, required=True)
    total_questions = messages.IntegerField(5, required=True)


# ================ Various ================
class StringMessage(messages.Message):
    """ Outbound string message (string) """
    message = messages.StringField(1, required=True)


class AnswerMessage(messages.Message):
    """ Outbound answer message (true/false) """
    correct_answer = messages.BooleanField(1, required=True)
