#!/usr/bin/env python

""" main.py - This file contains handlers that are called cronjobs. """
# Import utils
from utils import logger

import webapp2
from google.appengine.api import mail, app_identity, users
from google.appengine.ext import ndb
from api import QuestionsApi

from models import Match

import os
import jinja2
from google.appengine.ext.webapp import template

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + "/templates"),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class SendReminderEmail(webapp2.RequestHandler):
    def get(self):
        """ Send a reminder to players who have unfinished matches """
        app_id = app_identity.get_application_id()

        matches = Match.query(Match.match_over == False)

        players = list()
        for match in matches:
            logger.debug(match)
            players.append(match.player)

        # Remove duplicates in list by list-set-list conversion
        players = list(set(players))

        # Get players from datastore
        players = ndb.get_multi(players)

        # Create message and send to each player
        for player in players:
            subject = 'This is a reminder'
            body = """Hello %s,
                      you have unfinished
                      quizzles business!""" % player.user_name
            mail.send_mail('noreply@{}.appspotmail.com'.format(app_id),
                           player.email_address,
                           subject,
                           body)


class Playground(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('playground.html')
        self.response.write(template.render())


class RegistrationPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('register.html')
        self.response.write(template.render())


class LoginPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('login.html')
        self.response.write(template.render())


class ProfilePage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('profile.html')
        self.response.write(template.render())


class GamesPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('games.html')
        self.response.write(template.render())


class MatchesPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('matches.html')
        self.response.write(template.render())


class ScoresPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('scores.html')
        self.response.write(template.render())


class MainPage(webapp2.RequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('main.html')
        self.response.write(template.render())




app = webapp2.WSGIApplication([
    ('/playground', Playground),

    ('/register', RegistrationPage),
    ('/login', LoginPage),
    ('/profile', ProfilePage),
    ('/games', GamesPage),
    ('/matches', MatchesPage),
    ('/scores', ScoresPage),
    ('/', MainPage),

    ('/crons/send_reminder', SendReminderEmail)
], debug=True)
