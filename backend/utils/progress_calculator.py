def calculate_progress(data):
    phases = data["phases"]
    total = len(phases)
    completed = sum(1 for value in phases.values() if value)
    progress = round((completed / total) * 100, 2)

    return {
        "username": data.get("username", "Unknown"),
        "total": total,
        "completed": completed,
        "progress_percentage": progress
    }
