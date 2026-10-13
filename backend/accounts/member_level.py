def member_level_for_points(balance: int) -> int:
    """Derive the display level from the current wallet balance, regardless of role."""
    if balance <= 500:
        return 1
    if balance <= 1000:
        return 2
    return 3
