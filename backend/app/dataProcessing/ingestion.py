

def get_category_list() -> list:
    """
        Get a list of categories for the game.
    """
    return [
        "Science",
        "History",
        "Geography",
        "Sports",
        "Entertainment",
        "Art & Literature",
        "Technology",
        "Music",
        "Movies",
        "Television"
    ]

def get_random_question(category: str) -> dict[str, str]:
    """
        return a question and its correct answer for the given category.
    """
    return {
        "question": f"This is Demo question for category: {category}. What is the answer?",
        "correct_answer": f"The correct answer for category: {category} is...",
        "fake_answers": [
            f"Fake answer 1 for category: {category}",
            f"Fake answer 2 for category: {category}",
            f"Fake answer 3 for category: {category}"
        ]
    }


def validate_bluff_answer(bluff_answer: str) -> dict:
    """
        Validate the bluff answer submitted by the player.
    """
    # here need to process the bluff answer 
    # check if it's equal to the correct or similar to the correct answer
    return {
        "is_valid": True,
        "reason": "" # if it's invalid. set it to : EXACT_TRUTH
        }

def build_voting_choices(bluff_answers: dict, correct_answer: str, fake_answers: list) -> list[dict[str, str]]:
    """
        Get the choices for voting phase. This includes the correct answer and all bluff answers submitted by players.
    """
    # shuffle the bluff answers and add the correct answer to the list of choices
    # fallback to add fake answers if there are not enough bluff answers submitted by players

    # i will add demo choices for now.
    choices = []
    choices.append({ "id": "c1", "text": correct_answer })
    for player_id, bluff_answer in bluff_answers.items():
        choices.append({ "id": f"b_{player_id}", "text": bluff_answer })
    for i, fake_answer in enumerate(fake_answers):
        choices.append({ "id": f"f_{i}", "text": fake_answer })
    return choices

def calculate_results(votes: dict[str, str], bluffs: dict[str, str], correct_answer: str, players: dict[str, dict]) -> dict[str, int]:
    """
        Calculate the results of the round based on the voting results and submitted bluffs.
    """
    # the expected output is in the return statement below. For now, i will return a demo result.
    return {
        "correct_choice_id": "2",
        "choices": [
          {
            "id": "1",
            "text": "Austria",
            "author_name": "usr_1",
            "voters": ["usr_2, usr_3"]
          },
          {
            "id": "2",
            "text": "Switzerland",
            "author_name": None, # None because it's the correct answer
            "voters": ["usr_1"]
          }
        ],
        "leaderboard": [
          { "username": "alice", "score": 10 },
          { "username": "bob", "score": 5 }
        ]
      }