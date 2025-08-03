def calculate_progress(data):
    user_progress = []

    for user in data['users']:
        total_phases = len(user['phases'])
        completed_phases = sum(1 for phase_data in user['phases'].values() if phase_data['completed'])
        percentage = round((completed_phases / total_phases) * 100, 2)

        user_progress.append({
            "username": user["username"],
            "completed": completed_phases,
            "total": total_phases,
            "percentage": percentage
        })

    return {"progress": user_progress}