"""utils.py - File for collecting general utility functions."""

""" Define the logger, based on logger example in python docs. """
# Logger from the python docs
import logging
# Create logger
logger = logging.getLogger('simple_example')
logger.setLevel(logging.DEBUG)
# Create console handler
ch = logging.StreamHandler()
# Set logging level
ch.setLevel(logging.DEBUG)
# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Add formatter to console handler
ch.setFormatter(formatter)
# Add console handler to logger
logger.addHandler(ch)


from google.appengine.ext import ndb
from models import Player
import endpoints


# ============ CONSTANTS ============
# Limit for the number of query results
# Change as you see fit, low number ideal for debugging purposes
QUERY_LIMIT = 50


def get_by_urlsafe(urlsafe, model):
    """Returns an ndb.Model entity that the urlsafe key points to. Checks
        that the type of entity returned is of the correct kind. Raises an
        error if the key String is malformed or the entity is of the incorrect
        kind

    Arguments:
        urlsafe -- A urlsafe key string
        model -- The expected entity kind

    Returns:
        The entity that the urlsafe Key string points to or None if no entity
        exists.

    Raises:
        BadRequestException -- raised when key invalid
        ValueError -- raised then entity is of the wrong kind """
    try:
        key = ndb.Key(urlsafe=urlsafe)
    except TypeError:
        raise endpoints.BadRequestException('Invalid Key')
    except Exception, e:
        if e.__class__.__name__ == 'ProtocolBufferDecodeError':
            raise endpoints.BadRequestException('Invalid Key')
        else:
            raise

    entity = key.get()
    if not entity:
        return None
    if not isinstance(entity, model):
        raise ValueError('Incorrect Kind')

    logger.debug(entity)
    return entity


def get_player(user_name):
    """ Gets a player from their user name.

    This function returns a player from the datastore.

    Arguments:
        user_name {string} -- the user name of the requested player

    Returns:
        Player -- a player object pulled from the datastore

    Raises:
        NotFoundException -- raised if a player with the user name
                             does not exist
    """
    player = Player.query(Player.user_name == user_name).get()
    logger.debug(player)

    if not player:
        raise endpoints.NotFoundException(
            'A Player with that name does not exist.')

    return player


def get_limit_offset(page):
    """ Get the limit and offset for pagination.

    This function returns limit and offset which allows pagination across
    multiple result pages pulled from the datastore.

    Arguments:
        page {int} -- the page for which an offset is required
    """
    limit = QUERY_LIMIT
    if page is None or page < 0:
        offset = 0
    else:
        offset = limit * page

    return (limit, offset)
