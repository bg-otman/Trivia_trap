def get_categories() -> list:
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

def get_question(category: str) -> str:
    """
        get a question for the given category.
    """
    return f"This is Demo question for category: {category}. What is the answer?"